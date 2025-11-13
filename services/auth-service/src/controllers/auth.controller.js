// const jwt = require('jsonwebtoken');
// const { validationResult } = require('express-validator');
// const User = require('../models/User.model');

// // Generate JWT Token
// const generateToken = (userId, role) => {
//   return jwt.sign(
//     { userId, role },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRE || '24h' }
//   );
// };

// // Register new user
// exports.register = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ 
//         success: false,
//         errors: errors.array() 
//       });
//     }

//     const { email, password, role, profile } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ 
//         success: false,
//         message: 'User with this email already exists' 
//       });
//     }

//     // Create new user
//     const user = new User({
//       email,
//       password,
//       role: role || 'customer',
//       profile
//     });

//     await user.save();

//     // Generate token
//     const token = generateToken(user._id, user.role);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       data: {
//         token,
//         user: {
//           id: user._id,
//           email: user.email,
//           role: user.role,
//           profile: user.profile
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error during registration',
//       error: error.message 
//     });
//   }
// };

// // Login user
// exports.login = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ 
//         success: false,
//         errors: errors.array() 
//       });
//     }

//     const { email, password } = req.body;

//     // Find user and include password field
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Invalid credentials' 
//       });
//     }

//     // Check if user is active
//     if (!user.isActive) {
//       return res.status(403).json({ 
//         success: false,
//         message: 'Account is disabled. Please contact support.' 
//       });
//     }

//     // Verify password
//     const isValidPassword = await user.comparePassword(password);
//     if (!isValidPassword) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Invalid credentials' 
//       });
//     }

//     // Update last login
//     user.lastLogin = new Date();
//     await user.save();

//     // Generate token
//     const token = generateToken(user._id, user.role);

//     res.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         token,
//         user: {
//           id: user._id,
//           email: user.email,
//           role: user.role,
//           profile: user.profile,
//           isVerified: user.isVerified
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error during login',
//       error: error.message 
//     });
//   }
// };

// // Get current user profile
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId);
    
//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'User not found' 
//       });
//     }

//     res.json({
//       success: true,
//       data: { user }
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error',
//       error: error.message 
//     });
//   }
// };

// // Update user profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const { profile } = req.body;
    
//     const user = await User.findById(req.userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'User not found' 
//       });
//     }

//     // Update profile fields
//     if (profile) {
//       user.profile = { ...user.profile, ...profile };
//     }

//     await user.save();

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       data: { user }
//     });
//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error',
//       error: error.message 
//     });
//   }
// };

// // Verify token (for other services to validate)
// exports.verifyToken = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId);
    
//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'User not found' 
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         user: {
//           id: user._id,
//           email: user.email,
//           role: user.role,
//           isActive: user.isActive
//         }
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error',
//       error: error.message 
//     });
//   }
// };

// // Logout (client-side token removal mainly)
// exports.logout = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       message: 'Logout successful'
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error'
//     });
//   }
// };




const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');

// Import shared utilities
const { 
  sendSuccess, 
  sendError, 
  AppError, 
  catchAsync,
  Logger 
} = require('../../../../shared');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Register new user - using catchAsync to handle errors automatically
exports.register = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  const { email, password, role, profile } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Create new user
  const user = new User({
    email,
    password,
    role: role || 'customer',
    profile
  });

  await user.save();

  Logger.info('New user registered', {
    userId: user._id,
    email: user.email,
    role: user.role
  });

  // Generate token
  const token = generateToken(user._id, user.role);

  return sendSuccess(
    res,
    {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    },
    'User registered successfully',
    201
  );
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is disabled. Please contact support.', 403);
  }

  // Verify password
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    Logger.warn('Failed login attempt', { email });
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  Logger.info('User logged in', {
    userId: user._id,
    email: user.email,
    role: user.role
  });

  // Generate token
  const token = generateToken(user._id, user.role);

  return sendSuccess(
    res,
    {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified
      }
    },
    'Login successful'
  );
});

// Get current user profile
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return sendSuccess(res, { user }, 'Profile retrieved successfully');
});

// Update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { profile } = req.body;
  
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update profile fields
  if (profile) {
    user.profile = { ...user.profile, ...profile };
  }

  await user.save();

  Logger.info('User profile updated', {
    userId: user._id,
    email: user.email
  });

  return sendSuccess(res, { user }, 'Profile updated successfully');
});

// Verify token (for other services to validate)
exports.verifyToken = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('User account is disabled', 403);
  }

  return sendSuccess(res, {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified
    }
  }, 'Token is valid');
});

// Logout (client-side token removal mainly)
exports.logout = catchAsync(async (req, res, next) => {
  Logger.info('User logged out', {
    userId: req.userId
  });

  return sendSuccess(res, null, 'Logout successful');
});
