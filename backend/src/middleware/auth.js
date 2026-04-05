import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect routes (require valid JWT)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // Extract token from Bearer string
      const parts = req.headers.authorization.split(' ');
      if (parts.length !== 2) {
        return res.status(401).json({ success: false, message: 'Invalid token format' });
      }
      token = parts[1];

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and attach to request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
      }

      if (typeof req.user.changedPasswordAfter === 'function' && req.user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({ success: false, message: 'Not authorized, token expired after password change' });
      }

      return next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Middleware to grant access to specific roles
// Middleware for public endpoints that conditionally read user tokens to grant escalated view access (like 'pending' items)
export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {}
  next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
    next();
  };
};
