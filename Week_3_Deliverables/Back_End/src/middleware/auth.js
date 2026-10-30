/**
 * MediRemind — Authentication & Authorization Middleware
 * Week 3 Deliverable
 * Author: Francis John Empil (Back-End Developer)
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mediremind_super_secure_jwt_secret_key_2026';

/**
 * Verify JWT Token from Authorization Header
 * Header format: Authorization: Bearer <token>
 */
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization header provided.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Format must be: Bearer <token>'
    });
  }

  const token = parts[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please sign in again.'
        });
      }
      return res.status(403).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Invalid or forged token.'
      });
    }

    // Attach decoded user payload to request
    req.user = decoded;
    next();
  });
};

/**
 * Role-Based Access Control (RBAC) Guard
 * Ensures only users with specified roles can access the route
 */
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' lacks permission to access this resource.`
      });
    }
    next();
  };
};
