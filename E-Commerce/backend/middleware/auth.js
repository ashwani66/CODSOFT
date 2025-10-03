const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ---------- Helper to verify JWT ----------
const verifyToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user || null;
  } catch (err) {
    console.error('JWT verification error:', err);
    return null;
  }
};

// ---------- Verify if user is logged in ----------
const verifyUser = async (req, res, next) => {
  const user = await verifyToken(req, res);
  if (!user) return res.status(401).json({ message: 'Invalid or missing token' });

  req.user = user;
  next();
};

// ---------- Verify if user is admin ----------
const verifyAdmin = async (req, res, next) => {
  const user = await verifyToken(req, res);
  if (!user) return res.status(401).json({ message: 'Invalid or missing token' });
  if (!user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

  req.user = user;
  next();
};

module.exports = { verifyUser, verifyAdmin };
