// Middleware exports
const { verifyToken, authorize, optionalAuth } = require('./middleware/auth');

// Config exports
const { cloudinary, createCloudinaryStorage, createUploadMiddleware } = require('./config/cloudinary');

// Utility exports
const { 
  uploadFromBuffer, 
  uploadMultipleImages, 
  deleteImage, 
  deleteMultipleImages,
  getImageDetails 
} = require('./utils/imageUpload');

const { sendSuccess, sendError, sendPaginated } = require('./utils/responseFormatter');
const { AppError, catchAsync, globalErrorHandler } = require('./utils/errorHandler');
const { 
  isValidObjectId, 
  isValidEmail, 
  isValidPhone, 
  isStrongPassword,
  sanitizeInput,
  isValidPrice 
} = require('./utils/validation');
const Logger = require('./utils/logger');

module.exports = {
  // Middleware
  verifyToken,
  authorize,
  optionalAuth,
  
  // Cloudinary
  cloudinary,
  createCloudinaryStorage,
  createUploadMiddleware,
  
  // Image utilities
  uploadFromBuffer,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getImageDetails,
  
  // Response utilities
  sendSuccess,
  sendError,
  sendPaginated,
  
  // Error handling
  AppError,
  catchAsync,
  globalErrorHandler,
  
  // Validation
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  sanitizeInput,
  isValidPrice,
  
  // Logger
  Logger
};

