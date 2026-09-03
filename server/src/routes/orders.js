// ── ORDERS ROUTES ─────────────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// ── GET /api/orders/stats/summary ─────────────────────────────────────────
// MUST be defined BEFORE /:id to prevent Express matching "stats" as an id
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'FARMER') where.farmerId = req.user.id;
    else if (req.user.role === 'BUYER') where.buyerId = req.user.id;

    const [total, delivered, inTransit, pending, revenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'DELIVERED' } }),
      prisma.order.count({ where: { ...where, status: 'IN_TRANSIT' } }),
      prisma.order.count({ where: { ...where, status: 'PENDING' } }),
      prisma.order.aggregate({
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        delivered,
        inTransit,
        pending,
        revenue: revenue._sum.totalAmount || 0,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ── GET /api/orders ── Get orders (filtered by role) ─────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    // Farmers see their sale orders; buyers see their purchase orders; admins see all
    if (req.user.role === 'FARMER')    where.farmerId = req.user.id;
    else if (req.user.role === 'BUYER') where.buyerId  = req.user.id;
    if (status) where.status = status.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          crop:    { select: { id: true, name: true, emoji: true, unit: true } },
          farmer:  { select: { id: true, firstName: true, lastName: true, phone: true } },
          buyer:   { select: { id: true, firstName: true, lastName: true, phone: true } },
          transport: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, total, page: parseInt(page), pages: Math.ceil(total / take) });
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// ── GET /api/orders/:id ── Single order ───────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        crop:   true,
        farmer: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true } },
        buyer:  { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true } },
        transport: {
          include: {
            provider: {
              include: { user: { select: { firstName: true, lastName: true, phone: true } } },
            },
          },
        },
      },
    });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const canView = [order.farmerId, order.buyerId].includes(req.user.id) || req.user.role === 'ADMIN';
    if (!canView) return res.status(403).json({ success: false, error: 'Access denied' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

// ── POST /api/orders ── Create order ──────────────────────────────────────
router.post('/', authenticate, requireRole('BUYER', 'ADMIN'), async (req, res) => {
  try {
    const { cropId, quantity, pricePerUnit, deliveryAddress, notes } = req.body;

    if (!cropId || !quantity || !pricePerUnit) {
      return res.status(400).json({ success: false, error: 'cropId, quantity, pricePerUnit are required' });
    }

    const crop = await prisma.crop.findUnique({ where: { id: parseInt(cropId) } });
    if (!crop || !crop.isAvailable) {
      return res.status(404).json({ success: false, error: 'Crop not available' });
    }

    const qty = parseFloat(quantity);
    const unitPrice = parseFloat(pricePerUnit);
    if (!Number.isFinite(qty) || !Number.isFinite(unitPrice) || qty <= 0 || unitPrice <= 0) {
      return res.status(400).json({ success: false, error: 'quantity and pricePerUnit must be positive numbers' });
    }
    if (crop.farmerId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot order your own crop' });
    }
    if (qty < crop.minOrderQty) {
      return res.status(400).json({ success: false, error: `Minimum order is ${crop.minOrderQty} ${crop.unit}` });
    }
    if (qty > crop.quantity) {
      return res.status(400).json({ success: false, error: `Only ${crop.quantity} ${crop.unit} available` });
    }

    const totalAmount = qty * unitPrice;
    const order = await prisma.$transaction(async (tx) => {
      const reserved = await tx.crop.updateMany({
        where: { id: crop.id, isAvailable: true, quantity: { gte: qty } },
        data: { quantity: { decrement: qty } },
      });
      if (reserved.count !== 1) throw Object.assign(new Error('Crop stock changed; please retry'), { status: 409 });
      return tx.order.create({
        data: {
          cropId: crop.id, farmerId: crop.farmerId, buyerId: req.user.id,
          quantity: qty, pricePerUnit: unitPrice, totalAmount, deliveryAddress, notes,
        },
        include: {
          crop: { select: { name: true, emoji: true, unit: true } },
          farmer: { select: { firstName: true, lastName: true } },
          buyer: { select: { firstName: true, lastName: true } },
        },
      });
    });

    // Notify farmer
    await prisma.notification.create({
      data: {
        userId: crop.farmerId,
        type:   'ORDER',
        icon:   '📦',
        title:  'New Order Received!',
        text:   `${req.user.firstName} ordered ${qty} ${crop.unit} of ${crop.name}`,
        link:   '/orders',
      },
    });

    if (req.io) req.io.to(`user_${crop.farmerId}`).emit('new_order', order);

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(err.status || 500).json({ success: false, error: err.status ? err.message : 'Failed to create order' });
  }
});

// ── PATCH /api/orders/:id/status ── Update status ────────────────────────
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({ success: false, error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const requestedStatus = status.toUpperCase();
    const canUpdate =
      req.user.role === 'ADMIN' ||
      (order.farmerId === req.user.id && ['CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(requestedStatus)) ||
      (order.buyerId === req.user.id && ['CANCELLED'].includes(requestedStatus));
    if (!canUpdate) return res.status(403).json({ success: false, error: 'Access denied' });

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data:  { status: requestedStatus },
    });

    // Notify the other party
    const notifyId = order.farmerId === req.user.id ? order.buyerId : order.farmerId;
    await prisma.notification.create({
      data: {
        userId: notifyId,
        type:   'ORDER',
        icon:   '📦',
        title:  `Order ${status}`,
        text:   `Order #${req.params.id.slice(0, 8)} status changed to ${status}`,
        link:   '/orders',
      },
    });

    if (req.io) req.io.to(`user_${notifyId}`).emit('order_updated', updated);

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

module.exports = router;
