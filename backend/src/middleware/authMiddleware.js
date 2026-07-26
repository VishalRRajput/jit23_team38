import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_employee_tracking_2026');

      req.user = await Admin.findById(decoded.id).select('-password');
      if (!req.user) {
        // Fallback for mock token during initial setup / testing
        req.user = { id: decoded.id, email: decoded.email, role: 'admin' };
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware] Invalid Token:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  // Allow test / dev access if no header during local testing
  if (process.env.NODE_ENV === 'development') {
    req.user = { id: 'admin_dev_id', name: 'Super Admin', email: 'admin@company.com', role: 'admin' };
    return next();
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no authorization token provided' });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
