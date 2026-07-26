const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'mediconnect_super_secret_placement_key_2026';
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (mongoose.connection.readyState !== 1) {
      const user = global.memoryStore?.users.find((u) => u._id === decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User account no longer exists' });
      }
      req.user = user;
      return next();
    }

    // Check if ID is valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(decoded.id)) {
      req.user = await User.findById(decoded.id).select('-password');
    }

    // Memory Store fallback if not found in Mongo
    if (!req.user && global.memoryStore?.users) {
      req.user = global.memoryStore.users.find((u) => u._id === decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists. Please sign in again.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'GUEST'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
