// ── USERS ROUTES ──────────────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate, requireRole, safeUser } = require('../middleware/auth');

// ── GET /api/users/profile ── Own profile ────────────────────────────────
// MUST be before /:id to prevent Express matching "profile" as an ID
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            crops:           true,
            ordersAsFarmer:  true,
            ordersAsBuyer:   true,
            reviewsReceived: true,
          },
        },
        reviewsReceived: {
          include: { from: { select: { firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take:    10,
        },
      },
    });

    const avgRating = user.reviewsReceived.length
      ? (user.reviewsReceived.reduce((s, r) => s + r.rating, 0) / user.reviewsReceived.length).toFixed(1)
      : null;

    res.json({ success: true, user: safeUser(user), avgRating });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// ── PUT /api/users/profile ── Update own profile ──────────────────────────
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, state, city, bio } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName !== undefined && { firstName: firstName.trim() }),
        ...(lastName  !== undefined && { lastName:  lastName.trim()  }),
        ...(phone     !== undefined && { phone:     phone?.trim()    }),
        ...(state     !== undefined && { state:     state?.trim()    }),
        ...(city      !== undefined && { city:      city?.trim()     }),
        ...(bio       !== undefined && { bio:       bio?.trim()      }),
      },
    });
    res.json({ success: true, user: safeUser(updated) });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ── GET /api/users ── List all users (admin only) ──────────────────────────
router.get('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (role) where.role = role.toUpperCase();
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName:  { contains: search } },
        { email:     { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { crops: true, ordersAsFarmer: true, ordersAsBuyer: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, users: users.map(safeUser), total });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// ── GET /api/users/:id ── Public user profile ─────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, avatar: true,
        role: true, state: true, city: true, bio: true,
        verified: true, createdAt: true,
        _count: { select: { crops: true, ordersAsFarmer: true, reviewsReceived: true } },
        reviewsReceived: {
          include: { from: { select: { firstName: true, lastName: true, avatar: true } } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// ── PATCH /api/users/:id/verify ── Admin verify user ────────────────────
router.patch('/:id/verify', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const updated = await prisma.user.update({ where: { id }, data: { verified: true } });

    await prisma.notification.create({
      data: {
        userId: id,
        type:   'SYSTEM',
        icon:   '✅',
        title:  'Account Verified!',
        text:   'Your account has been verified by admin. All features are now unlocked.',
        link:   '/profile',
      },
    });

    res.json({ success: true, user: safeUser(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to verify user' });
  }
});

// ── PATCH /api/users/:id/deactivate ── Admin deactivate user ─────────────
router.patch('/:id/deactivate', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid user ID' });
    if (id === req.user.id) return res.status(400).json({ success: false, error: 'Cannot deactivate your own account' });

    const updated = await prisma.user.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, user: safeUser(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to deactivate user' });
  }
});

module.exports = router;
