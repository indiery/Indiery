import admin from '../config/firebase.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Verify Firebase ID Token from "Authorization: Bearer <token>"
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decoded;

    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (user) req.user = user;

    next();
  } catch (err) {
    logger.error(`Auth error: ${err.message}`);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: 'User profile not found. Please complete registration.',
    });
  }
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};