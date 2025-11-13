const jwt = require('jsonwebtoken');
const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * Verify JWT token middleware
 * This can be used by all microservices
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided. Authorization denied.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token locally (faster)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      next();
    } catch (jwtError) {
      // If local verification fails, verify with auth service (fallback)
      try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        
        if (response.data.success) {
          req.userId = response.data.data.user.id;
          req.userRole = response.data.data.user.role;
          next();
        } else {
          return res.status(401).json({ 
            success: false,
            message: 'Invalid token' 
          });
        }
      } catch (authServiceError) {
        console.error('Auth service verification error:', authServiceError.message);
        return res.status(401).json({ 
          success: false,
          message: 'Token verification failed' 
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication' 
    });
  }
};

/**
 * Authorize based on user roles
 * Usage: authorize('admin', 'seller')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ 
        success: false,
        message: 'User role not found. Please authenticate first.' 
      });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.userRole}` 
      });
    }
    
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work differently for authenticated users
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      req.isAuthenticated = true;
    } catch (error) {
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    next();
  }
};

