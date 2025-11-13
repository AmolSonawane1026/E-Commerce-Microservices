const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/product.routes');
const { globalErrorHandler, Logger } = require('../../../shared');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:3003' , 'http://localhost:3004'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    service: 'product-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Product Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      getAllProducts: 'GET /api/products',
      getProduct: 'GET /api/products/:id',
      createProduct: 'POST /api/products',
      updateProduct: 'PUT /api/products/:id',
      deleteProduct: 'DELETE /api/products/:id',
      searchProducts: 'GET /api/products/search?q=query',
      getCategories: 'GET /api/products/categories'
    }
  });
});

// 404 handler
app.use((req, res) => {
  Logger.warn('Route not found', {
    method: req.method,
    path: req.path
  });
  
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(globalErrorHandler);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    Logger.info('MongoDB connected successfully', {
      service: 'product-service',
      database: mongoose.connection.name
    });
    console.log('✅ MongoDB connected successfully for Product Service');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    Logger.error('MongoDB connection failed', err);
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  Logger.info('Product Service started', {
    port: PORT,
    environment: process.env.NODE_ENV
  });
  
  console.log(`🚀 Product Service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

