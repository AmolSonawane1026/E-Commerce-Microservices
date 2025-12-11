const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/order.routes');
const { globalErrorHandler, Logger } = require('../../../shared');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://e-commerce-microservices-auth-servi.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

// Webhook route needs raw body
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  if (!req.path.includes('/webhook')) {
    Logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }
  next();
});

// Routes
app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'order-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Order Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      createOrder: 'POST /api/orders',
      myOrders: 'GET /api/orders/my-orders',
      orderDetails: 'GET /api/orders/:id',
      cancelOrder: 'PATCH /api/orders/:id/cancel',
      stripeWebhook: 'POST /api/orders/webhook/stripe'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(globalErrorHandler);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    Logger.info('MongoDB connected', {
      service: 'order-service',
      database: mongoose.connection.name
    });
    console.log('✅ MongoDB connected - Order Service');
  })
  .catch((err) => {
    Logger.error('MongoDB connection failed', err);
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  Logger.info('Order Service started', {
    port: PORT,
    environment: process.env.NODE_ENV
  });

  console.log(`🚀 Order Service running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
});
