// ── TRANSPORT ROUTES ──────────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// ── GET /api/transport ── List transport requests ─────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();

    // Transport providers only see open/relevant requests
    if (req.user.role === 'TRANSPORT') {
      where.status = where.status || 'OPEN';
    }

    const requests = await prisma.transportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            crop:   { select: { name: true, emoji: true, unit: true } },
            farmer: { select: { firstName: true, lastName: true, phone: true } },
            buyer:  { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });

    res.json({ success: true, requests });
  } catch (err) {
    console.error('List transport error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch transport requests' });
  }
});

// ── GET /api/transport/:id ── Single request ──────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID' });

    const request = await prisma.transportRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            crop:   true,
            farmer: { select: { firstName: true, lastName: true, phone: true } },
            buyer:  { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        provider: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
      },
    });

    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch request' });
  }
});

// ── POST /api/transport ── Create transport request ───────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { orderId, fromLocation, toLocation, distance, weight, requiredBy, notes } = req.body;

    if (!fromLocation || !toLocation) {
      return res.status(400).json({ success: false, error: 'fromLocation and toLocation are required' });
    }

    // orderId is optional — can post a general request without a specific order
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      const existing = await prisma.transportRequest.findUnique({ where: { orderId } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Transport request already exists for this order' });
      }
    }

    const request = await prisma.transportRequest.create({
      data: {
        orderId:      orderId || undefined,
        fromLocation: fromLocation.trim(),
        toLocation:   toLocation.trim(),
        distance:     distance  ? parseFloat(distance)  : null,
        weight:       weight    ? parseFloat(weight)    : null,
        requiredBy:   requiredBy ? new Date(requiredBy) : null,
        notes:        notes?.trim(),
      },
    });

    if (req.io) req.io.emit('new_transport_request', request);
    res.status(201).json({ success: true, request });
  } catch (err) {
    console.error('Create transport error:', err);
    res.status(500).json({ success: false, error: 'Failed to create transport request' });
  }
});

// ── PATCH /api/transport/:id/bid ── Provider bids on a request ────────────
router.patch('/:id/bid', authenticate, requireRole('TRANSPORT', 'ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID' });

    const { bidAmount } = req.body;
    if (!bidAmount) return res.status(400).json({ success: false, error: 'bidAmount is required' });

    const provider = await prisma.transportProvider.findUnique({ where: { userId: req.user.id } });
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'You are not registered as a transport provider. Please complete your provider profile.',
      });
    }

    const request = await prisma.transportRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    if (request.status === 'ASSIGNED') {
      return res.status(400).json({ success: false, error: 'Request already assigned to another provider' });
    }

    const updated = await prisma.transportRequest.update({
      where: { id },
      data:  { status: 'ASSIGNED', providerId: provider.id, bidAmount: parseFloat(bidAmount) },
    });

    res.json({ success: true, request: updated });
  } catch (err) {
    console.error('Bid error:', err);
    res.status(500).json({ success: false, error: 'Failed to place bid' });
  }
});

// ── PATCH /api/transport/:id/status ── Update delivery status ────────────
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID' });

    const { status } = req.body;
    const validStatuses = ['OPEN', 'BIDDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({ success: false, error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const request = await prisma.transportRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    const updated = await prisma.transportRequest.update({
      where: { id },
      data:  { status: status.toUpperCase() },
    });

    // Sync order status when delivered
    if (status.toUpperCase() === 'DELIVERED' && updated.orderId) {
      await prisma.order.update({
        where: { id: updated.orderId },
        data:  { status: 'DELIVERED' },
      });
    }
    // Mark as in-transit when picked up
    if (status.toUpperCase() === 'PICKED_UP' && updated.orderId) {
      await prisma.order.update({
        where: { id: updated.orderId },
        data:  { status: 'IN_TRANSIT' },
      });
    }

    if (req.io) req.io.emit('transport_updated', updated);
    res.json({ success: true, request: updated });
  } catch (err) {
    console.error('Update transport status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

module.exports = router;
