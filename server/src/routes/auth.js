// ── AUTH ROUTES ────────────────────────────────────────────────────────────
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const prisma  = require('../lib/prisma');
const { authenticate, safeUser } = require('../middleware/auth');

// Helper: generate signed JWT
const genToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, state, city } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, error: 'firstName, lastName, email, password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const validRoles = ['FARMER', 'BUYER', 'TRANSPORT', 'ADMIN'];
    const userRole   = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : 'FARMER';
    const avatarMap  = { FARMER: '👨‍🌾', BUYER: '🛒', TRANSPORT: '🚚', ADMIN: '👨‍💼' };

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.toLowerCase().trim(),
        password:  hashedPassword,
        phone:     phone?.trim(),
        role:      userRole,
        state:     state?.trim(),
        city:      city?.trim(),
        avatar:    avatarMap[userRole],
      },
    });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type:   'SYSTEM',
        icon:   '🎉',
        title:  'Welcome to FAM WHEEL!',
        text:   `Account created. ${userRole === 'FARMER' ? 'Start by listing your crops.' : 'Browse the marketplace to find great deals.'}`,
        link:   userRole === 'FARMER' ? '/my-listings' : '/marketplace',
      },
    });

    const token = genToken(user.id);
    res.status(201).json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Account is deactivated. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = genToken(user.id);
    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            crops:          true,
            ordersAsFarmer: true,
            ordersAsBuyer:  true,
            reviewsReceived: true,
            sentMessages:   true,
          },
        },
      },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────
router.post('/logout', authenticate, (_req, res) => {
  // JWT is stateless — client must delete the token
  res.json({ success: true, message: 'Logged out successfully' });
});

// ── POST /api/auth/change-password ───────────────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

module.exports = router;
