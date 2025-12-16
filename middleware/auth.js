const { verifyAccessToken } = require('../utils/jwt');
const { sendUnauthorized, sendForbidden } = require('../utils/response');
const User = require('../src/models/user.model.js');
const logger = require('../utils/logger');

/**
 * Authentication middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return sendUnauthorized(res, 'Access token is required');
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      logger.error('Token verification failed', { error: error.message, token: token.substring(0, 20) + '...' });
      return sendUnauthorized(res, 'Invalid or expired token');
    }

    // Check if token is access token
    if (decoded.type !== 'access') {
      return sendUnauthorized(res, 'Invalid token type');
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    // Check if user is active
    if (!user.status) {
      return sendForbidden(res, 'Account is deactivated');
    }

    // Add user to request object
    req.user = user;
    req.userId = user.user_id;
    req.roleId = user.role_id;

    next();
  } catch (error) {
    logger.error('Authentication middleware error', { error: error.message, stack: error.stack });
    return sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token provided, continue without authentication
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next(); // No token provided, continue without authentication
    }

    // Try to verify token
    try {
      const decoded = verifyAccessToken(token);
      
      if (decoded.type === 'access') {
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.status) {
          req.user = user;
          req.userId = user.user_id;
          req.roleId = user.role_id;
        }
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      logger.debug('Optional auth token verification failed', { error: error.message });
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error', { error: error.message });
    next(); // Continue even if there's an error
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    // For now, we'll implement a simple role check
    // You can extend this based on your role system
    if (roles.length && !roles.includes(req.user.role)) {
      return sendForbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Check if user can access resource (owner or admin)
 * @param {string} resourceUserIdField - Field name that contains user ID in resource
 * @returns {Function} Express middleware function
 */
const checkResourceOwnership = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    // Get resource from request (could be from params, body, or query)
    const resource = req.resource || req.body || req.params || req.query;
    
    if (!resource || !resource[resourceUserIdField]) {
      return sendForbidden(res, 'Resource not found or invalid');
    }

    // Check if user owns the resource or is admin
    const isOwner = resource[resourceUserIdField].toString() === req.userId.toString();
    const isAdmin = req.user.role === 'admin'; // Adjust based on your role system

    if (!isOwner && !isAdmin) {
      return sendForbidden(res, 'Access denied. You can only access your own resources.');
    }

    next();
  };
};

/**
 * Rate limiting middleware for authentication attempts
 * Unlimited attempts - no rate limiting applied
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authRateLimit = (req, res, next) => {
  // No rate limiting - allow unlimited attempts
  next();
};

module.exports = {
  auth,
  optionalAuth,
  authorize,
  checkResourceOwnership,
  authRateLimit
};
