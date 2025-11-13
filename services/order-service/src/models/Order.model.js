const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String,
    subtotal: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingCharges: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'payment_pending',
      'paid',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded'
    ],
    default: 'pending',
    index: true
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['cod', 'stripe', 'card', 'upi'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
      default: 'pending'
    },
    stripePaymentIntentId: String,
    stripeSessionId: String,
    transactionId: String,
    paidAt: Date,
    amount: Number,
    currency: {
      type: String,
      default: 'inr'
    }
  },
  shippingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: String,
    phone: {
      type: String,
      required: true
    },
    email: String,
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    landmark: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  trackingInfo: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  timeline: [{
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  cancelReason: String,
  returnReason: String
}, { 
  timestamps: true 
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  // Only generate order number for new documents
  if (this.isNew && !this.orderNumber) {
    try {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Get start of today
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Count orders created today
      const count = await this.constructor.countDocuments({
        createdAt: { $gte: startOfDay }
      });
      
      const orderCount = String(count + 1).padStart(4, '0');
      this.orderNumber = `ORD${year}${month}${day}${orderCount}`;
      
      console.log('Generated order number:', this.orderNumber);
    } catch (error) {
      console.error('Error generating order number:', error);
      // If there's an error, generate a random order number
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.orderNumber = `ORD${Date.now()}${randomNum}`;
    }
  }
  
  next();
});

// Add timeline entry when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    const statusMessages = {
      'pending': 'Order placed',
      'payment_pending': 'Awaiting payment',
      'paid': 'Payment received',
      'confirmed': 'Order confirmed',
      'processing': 'Order is being processed',
      'packed': 'Order has been packed',
      'shipped': 'Order has been shipped',
      'out_for_delivery': 'Order is out for delivery',
      'delivered': 'Order delivered successfully',
      'cancelled': 'Order has been cancelled',
      'returned': 'Order has been returned',
      'refunded': 'Payment refunded'
    };
    
    this.timeline.push({
      status: this.status,
      message: statusMessages[this.status] || `Order status: ${this.status}`,
      timestamp: new Date()
    });
  }
  next();
});

// Initialize timeline for new orders
orderSchema.pre('save', function(next) {
  if (this.isNew && this.timeline.length === 0) {
    const statusMessages = {
      'pending': 'Order placed',
      'payment_pending': 'Awaiting payment',
      'paid': 'Payment received',
      'confirmed': 'Order confirmed',
      'processing': 'Order is being processed'
    };
    
    this.timeline.push({
      status: this.status,
      message: statusMessages[this.status] || 'Order created',
      timestamp: new Date()
    });
  }
  next();
});

// Indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ 'items.sellerId': 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.stripePaymentIntentId': 1 });

module.exports = mongoose.model('Order', orderSchema);
