const Order = require('../models/Order.model');
const axios = require('axios');
const stripeService = require('../services/stripe.service');
const {
  sendSuccess,
  sendPaginated,
  AppError,
  catchAsync,
  Logger,
  isValidObjectId
} = require('../../../../shared');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

const MAILER_SERVICE_URL = process.env.MAILER_SERVICE_URL || 'http://localhost:3004';

// Helper to send email (fire and forget)
const sendEmail = async (template, data, to, subject) => {
  try {
    await axios.post(`${MAILER_SERVICE_URL}/api/email/send`, {
      to,
      subject,
      template,
      data
    });
    Logger.info(`Email sent: ${template} to ${to}`);
  } catch (error) {
    Logger.error('Failed to send email', error.message);
    // Don't throw error to avoid failing the order process
  }
};

// Create new order
exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    notes
  } = req.body;

  const customerId = req.userId;
  const customerEmail = req.user?.email || shippingAddress.email;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  // Validate shipping address
  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city ||
    !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
    throw new AppError('Complete shipping address is required', 400);
  }

  // Validate payment method
  if (!paymentMethod || !['cod', 'stripe'].includes(paymentMethod)) {
    throw new AppError('Valid payment method is required (cod or stripe)', 400);
  }

  // Fetch product details and validate
  const productIds = items.map(item => item.productId);
  let products;

  try {
    const productPromises = productIds.map(id =>
      axios.get(`${PRODUCT_SERVICE_URL}/api/products/${id}`)
    );
    const responses = await Promise.all(productPromises);
    products = responses.map(res => res.data.data.product);
  } catch (error) {
    Logger.error('Failed to fetch product details', error);
    throw new AppError('Failed to validate products', 500);
  }

  // Calculate order totals
  let subtotal = 0;
  const orderItems = items.map((item, index) => {
    const product = products[index];

    if (!product) {
      throw new AppError(`Product ${item.productId} not found`, 404);
    }

    if (!product.isActive) {
      throw new AppError(`Product "${product.name}" is not available`, 400);
    }

    if (product.inventory.quantity < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.name}". Available: ${product.inventory.quantity}`,
        400
      );
    }

    const price = product.discountPrice || product.price;
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;

    return {
      productId: product._id,
      sellerId: product.sellerId,
      name: product.name,
      price: price,
      quantity: item.quantity,
      image: product.images[0]?.url || '',
      subtotal: itemSubtotal
    };
  });

  // Calculate additional charges
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shippingCharges = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
  const totalAmount = subtotal + tax + shippingCharges;

  // Generate order number
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const count = await Order.countDocuments({
    createdAt: { $gte: startOfDay }
  });

  const orderCount = String(count + 1).padStart(4, '0');
  const orderNumber = `ORD${year}${month}${day}${orderCount}`;

  console.log('Generated order number:', orderNumber);

  // Create order
  const order = new Order({
    orderNumber,
    customerId,
    customerEmail,
    items: orderItems,
    subtotal,
    tax,
    shippingCharges,
    totalAmount,
    shippingAddress: {
      ...shippingAddress,
      firstName: shippingAddress.firstName || shippingAddress.name?.split(' ')[0] || 'Customer'
    },
    billingAddress: billingAddress || shippingAddress,
    paymentInfo: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'pending',
      amount: totalAmount,
      currency: 'inr'
    },
    status: paymentMethod === 'cod' ? 'confirmed' : 'payment_pending',
    notes: notes || ''
  });

  await order.save();

  // If Stripe payment, create checkout session
  let checkoutSession = null;
  if (paymentMethod === 'stripe') {
    try {
      checkoutSession = await stripeService.createCheckoutSession(order, customerEmail);

      order.paymentInfo.stripeSessionId = checkoutSession.sessionId;
      await order.save();
    } catch (error) {
      Logger.error('Failed to create Stripe session', error);
      // Delete the order if payment session creation fails
      await order.deleteOne();
      throw new AppError('Failed to create payment session', 500);
    }
  }

  Logger.info('Order created', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerId,
    totalAmount,
    paymentMethod
  });

  // Send confirmation email
  sendEmail(
    'orderConfirmation',
    {
      order: order.toJSON(), // properly format dates/ids by converting to JSON
      customerName: order.shippingAddress.firstName
    },
    customerEmail,
    `Order Confirmation - ${order.orderNumber}`
  );

  return sendSuccess(
    res,
    {
      order,
      checkoutUrl: checkoutSession?.url
    },
    'Order placed successfully',
    201
  );
});

// Get customer's orders
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const customerId = req.userId;
  const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;

  const query = { customerId };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'),
    Order.countDocuments(query)
  ]);

  Logger.info('Customer orders fetched', {
    customerId,
    count: orders.length
  });

  return sendPaginated(res, orders, page, limit, total);
});

// Get single order details
exports.getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  if (!isValidObjectId(id)) {
    throw new AppError('Invalid order ID', 400);
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check authorization
  if (userRole !== 'admin') {
    if (userRole === 'customer' && order.customerId.toString() !== userId) {
      throw new AppError('Access denied', 403);
    }

    if (userRole === 'seller') {
      const hasSellersProduct = order.items.some(
        item => item.sellerId.toString() === userId
      );
      if (!hasSellersProduct) {
        throw new AppError('Access denied', 403);
      }
    }
  }

  return sendSuccess(res, { order }, 'Order retrieved successfully');
});

// Update order status (Seller/Admin only)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, trackingInfo, notes } = req.body;
  const userId = req.userId;
  const userRole = req.userRole;

  if (!isValidObjectId(id)) {
    throw new AppError('Invalid order ID', 400);
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Sellers can only update orders with their products
  if (userRole === 'seller') {
    const hasSellersProduct = order.items.some(
      item => item.sellerId.toString() === userId
    );
    if (!hasSellersProduct) {
      throw new AppError('Access denied', 403);
    }
  }

  // Validate status
  const validStatuses = [
    'pending', 'payment_pending', 'paid', 'confirmed', 'processing',
    'packed', 'shipped', 'out_for_delivery', 'delivered',
    'cancelled', 'returned', 'refunded'
  ];

  if (status && !validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  const previousStatus = order.status;

  // Update order
  if (status) {
    order.status = status;

    // Mark as paid if delivered with COD
    if (status === 'delivered' && order.paymentInfo.method === 'cod') {
      order.paymentInfo.status = 'succeeded';
      order.paymentInfo.paidAt = new Date();
    }

    // Set delivery date if delivered
    if (status === 'delivered' && !order.trackingInfo.actualDelivery) {
      order.trackingInfo.actualDelivery = new Date();
    }
  }

  if (trackingInfo) {
    order.trackingInfo = { ...order.trackingInfo, ...trackingInfo };
  }

  if (notes) {
    order.notes = notes;
  }

  await order.save();

  Logger.info('Order status updated', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    updatedBy: userId
  });

  // Send status update email if status changed
  if (status && status !== previousStatus) {
    sendEmail(
      'orderStatusUpdate',
      {
        order: order.toJSON(),
        customerName: order.shippingAddress.firstName,
        previousStatus
      },
      order.customerEmail,
      `Order Update - ${order.orderNumber}`
    );
  }

  return sendSuccess(res, { order }, 'Order updated successfully');
});

// Cancel order (Customer)
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  const customerId = req.userId;

  if (!isValidObjectId(id)) {
    throw new AppError('Invalid order ID', 400);
  }

  const order = await Order.findOne({ _id: id, customerId });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Can only cancel if order is in certain statuses
  const cancellableStatuses = ['pending', 'payment_pending', 'confirmed'];
  if (!cancellableStatuses.includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  order.status = 'cancelled';
  order.cancelReason = reason || 'Cancelled by customer';

  // If payment was made, initiate refund
  if (order.paymentInfo.status === 'succeeded' && order.paymentInfo.stripePaymentIntentId) {
    try {
      await stripeService.createRefund(order.paymentInfo.stripePaymentIntentId);
      order.paymentInfo.status = 'refunded';
    } catch (error) {
      Logger.error('Refund failed', error);
    }
  }

  await order.save();

  Logger.info('Order cancelled', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerId
  });

  // Send cancellation email
  sendEmail(
    'orderStatusUpdate',
    {
      order: order.toJSON(),
      customerName: order.shippingAddress.firstName,
      previousStatus: 'active'
    },
    order.customerEmail,
    `Order Cancelled - ${order.orderNumber}`
  );

  return sendSuccess(res, { order }, 'Order cancelled successfully');
});

// Get orders for seller
exports.getSellerOrders = catchAsync(async (req, res, next) => {
  const sellerId = req.userId;
  const { page = 1, limit = 20, status, sort = '-createdAt' } = req.query;

  const query = { 'items.sellerId': sellerId };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'),
    Order.countDocuments(query)
  ]);

  Logger.info('Seller orders fetched', {
    sellerId,
    count: orders.length
  });

  return sendPaginated(res, orders, page, limit, total);
});

// Get all orders (Admin only)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, customerId, sort = '-createdAt' } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (customerId && isValidObjectId(customerId)) {
    query.customerId = customerId;
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'),
    Order.countDocuments(query)
  ]);

  return sendPaginated(res, orders, page, limit, total);
});

// Stripe Webhook Handler
exports.handleStripeWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeService.constructWebhookEvent(req.body, sig);
  } catch (err) {
    Logger.error('Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  res.json({ received: true });
});

// Get order statistics
exports.getOrderStats = catchAsync(async (req, res, next) => {
  const userRole = req.userRole;
  const userId = req.userId;

  let matchQuery = {};

  if (userRole === 'seller') {
    matchQuery = { 'items.sellerId': userId };
  }

  const stats = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments(matchQuery);

  const revenueData = await Order.aggregate([
    { $match: { ...matchQuery, 'paymentInfo.status': 'succeeded' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  return sendSuccess(res, {
    stats,
    totalOrders,
    totalRevenue: revenueData[0]?.total || 0
  }, 'Order statistics retrieved successfully');
});
