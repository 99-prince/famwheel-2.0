// ── ADMIN ROUTES ──────────────────────────────────────────────────────────
// All routes here require ADMIN role
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate, requireRole, safeUser } = require('../middleware/auth');

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireRole('ADMIN'));

// ── GET /api/admin/stats ── Platform overview stats ───────────────────────
router.get('/stats', async (_req, res) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalTransport,
      totalCrops,
      activeCrops,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalRevenue,
      totalMessages,
      totalOffers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { role: 'TRANSPORT' } }),
      prisma.crop.count(),
      prisma.crop.count({ where: { isAvailable: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalAmount: true } }),
      prisma.message.count(),
      prisma.offer.count(),
    ]);

    res.json({
      success: true,
      stats: {
        users:    { total: totalUsers, farmers: totalFarmers, buyers: totalBuyers, transport: totalTransport },
        crops:    { total: totalCrops, active: activeCrops },
        orders:   { total: totalOrders, delivered: deliveredOrders, pending: pendingOrders },
        revenue:  totalRevenue._sum.totalAmount || 0,
        messages: totalMessages,
        offers:   totalOffers,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ── GET /api/admin/users ── All users with counts ────────────────────────
router.get('/users', async (req, res) => {
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
        include: {
          _count: {
            select: { crops: true, ordersAsFarmer: true, ordersAsBuyer: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, users: users.map(safeUser), total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// ── PATCH /api/admin/users/:id/verify ── Verify a user ───────────────────
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const updated = await prisma.user.update({ where: { id }, data: { verified: true } });
    await prisma.notification.create({
      data: { userId: id, type: 'SYSTEM', icon: '✅', title: 'Account Verified!', text: 'Your account has been verified by admin.', link: '/profile' },
    });
    res.json({ success: true, user: safeUser(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to verify user' });
  }
});

// ── PATCH /api/admin/users/:id/toggle-active ── Ban or restore user ───────
router.patch('/users/:id/toggle-active', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid user ID' });
    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot deactivate your own account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const updated = await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
    res.json({ success: true, user: safeUser(updated), isActive: updated.isActive });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle user status' });
  }
});

// ── GET /api/admin/orders ── All orders ──────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip:    (parseInt(page) - 1) * parseInt(limit),
        take:    parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          crop:   { select: { name: true, emoji: true, unit: true } },
          farmer: { select: { firstName: true, lastName: true, email: true } },
          buyer:  { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// ── GET /api/admin/crops ── All crops ─────────────────────────────────────
router.get('/crops', async (req, res) => {
  try {
    const crops = await prisma.crop.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        farmer: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { orders: true, offers: true } },
      },
    });
    res.json({ success: true, crops, total: crops.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch crops' });
  }
});

// ── POST /api/admin/market-prices/seed ── Re-seed market prices ───────────
router.post('/market-prices/seed', async (_req, res) => {
  try {
    // Run the seed just for market prices
    const seedPrices = require('../prisma/seedPrices');
    await seedPrices(prisma);
    res.json({ success: true, message: 'Market prices re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to seed prices: ' + err.message });
  }
});

// ── DELETE /api/admin/crop/:id ── Force delete a crop ────────────────────
router.delete('/crops/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid crop ID' });
    await prisma.crop.update({ where: { id }, data: { isAvailable: false } });
    res.json({ success: true, message: 'Crop removed from marketplace' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove crop' });
  }
});

module.exports = router;
