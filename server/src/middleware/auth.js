// ── AUTH MIDDLEWARE ────────────────────────────────────────────────────────
const jwt   = require('jsonwebtoken');
const prisma = require('../lib/prisma');

/**
 * authenticate  — verifies JWT, loads user from DB, sets req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization header missing or malformed' });
    }

    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

/**
 * requireRole(...roles)  — checks that req.user.role is in the allowed list
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
    });
  }
  next();
};

/**
 * safeUser  — strips password from a user object before sending to client
 */
const safeUser = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

module.exports = { authenticate, requireRole, safeUser };
