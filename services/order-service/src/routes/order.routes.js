const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { verifyToken, authorize } = require('../../../../shared');

const router = express.Router();

// Stripe webhook (must be before other routes and without verifyToken)
router.post('/webhook/stripe', 
  express.raw({ type: 'application/json' }), 
  orderController.handleStripeWebhook
);

// All other routes require authentication
router.use(verifyToken);

// Customer routes
router.post('/',
  [
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('shippingAddress').isObject().withMessage('Shipping address is required'),
    body('paymentMethod').isIn(['cod', 'stripe']).withMessage('Valid payment method is required')
  ],
  orderController.createOrder
);

router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);

// Seller routes
router.get('/seller/orders', 
  authorize('seller', 'admin'),
  orderController.getSellerOrders
);

router.patch('/:id/status',
  authorize('seller', 'admin'),
  orderController.updateOrderStatus
);

// Admin routes
router.get('/admin/all',
  authorize('admin'),
  orderController.getAllOrders
);

router.get('/admin/stats',
  authorize('seller', 'admin'),
  orderController.getOrderStats
);

module.exports = router;
