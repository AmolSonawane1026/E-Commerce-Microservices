// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const authRoutes = require('./routes/auth.routes');

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://your-frontend.vercel.app'] 
//     : ['http://localhost:5173', 'http://localhost:5174'],
//   credentials: true
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Request logging
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// // Routes
// app.use('/api/auth', authRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ 
//     success: true,
//     service: 'auth-service',
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Auth Service API',
//     version: '1.0.0',
//     endpoints: {
//       health: '/health',
//       register: 'POST /api/auth/register',
//       login: 'POST /api/auth/login',
//       profile: 'GET /api/auth/profile',
//       verify: 'GET /api/auth/verify'
//     }
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected successfully for Auth Service');
//     console.log(`📊 Database: ${mongoose.connection.name}`);
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection error:', err.message);
//     process.exit(1);
//   });

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received, shutting down gracefully...');
//   await mongoose.connection.close();
//   process.exit(0);
// });

// // Start server
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`🚀 Auth Service running on port ${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
//   console.log(`📍 Health check: http://localhost:${PORT}/health`);
// });




const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');

// Import shared utilities
const { globalErrorHandler, Logger } = require('../../../shared');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://e-commerce-web-client.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:3003', "http://localhost:3004", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware using shared Logger
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    service: 'auth-service',
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
    message: 'Auth Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile',
      updateProfile: 'PUT /api/auth/profile',
      verify: 'GET /api/auth/verify',
      logout: 'POST /api/auth/logout'
    }
  });
});

// 404 handler - must be BEFORE error handler
app.use((req, res) => {
  Logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Global error handler - MUST be the last middleware
// This uses the shared error handler
app.use(globalErrorHandler);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    Logger.info('MongoDB connected successfully', {
      service: 'auth-service',
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
    console.log('✅ MongoDB connected successfully for Auth Service');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    Logger.error('MongoDB connection failed', err);
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  Logger.error('UNHANDLED REJECTION! Shutting down...', err);
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received, shutting down gracefully...');
  console.log('SIGTERM received, shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    Logger.info('MongoDB connection closed');
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    Logger.error('Error during shutdown', err);
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  Logger.info('Auth Service started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
  
  console.log(`🚀 Auth Service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API Info: http://localhost:${PORT}/`);
});
