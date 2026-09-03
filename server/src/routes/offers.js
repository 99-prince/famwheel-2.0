// ── OFFERS ROUTES ─────────────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// ── GET /api/offers ── Get all offers for current user ────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {
      OR: [{ fromId: req.user.id }, { toId: req.user.id }],
    };
    if (status) where.status = status.toUpperCase();

    const offers = await prisma.offer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        crop: { select: { id: true, name: true, emoji: true, unit: true, price: true } },
        from: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        to:   { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    res.json({ success: true, offers });
  } catch (err) {
    console.error('List offers error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch offers' });
  }
});

// ── POST /api/offers ── Make an offer (buyer only) ────────────────────────
router.post('/', authenticate, requireRole('BUYER', 'ADMIN'), async (req, res) => {
  try {
    const { cropId, offerPrice, quantity, message } = req.body;

    if (!cropId || !offerPrice || !quantity) {
      return res.status(400).json({ success: false, error: 'cropId, offerPrice, and quantity are required' });
    }

    const crop = await prisma.crop.findUnique({ where: { id: parseInt(cropId) } });
    if (!crop)             return res.status(404).json({ success: false, error: 'Crop not found' });
    if (!crop.isAvailable) return res.status(400).json({ success: false, error: 'Crop is no longer available' });
    if (crop.farmerId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot make an offer on your own crop' });
    }

    const qty   = parseFloat(quantity);
    const price = parseFloat(offerPrice);
    const total = qty * price;

    const offer = await prisma.offer.create({
      data: {
        cropId:      parseInt(cropId),
        fromId:      req.user.id,
        toId:        crop.farmerId,
        offerPrice:  price,
        quantity:    qty,
        totalAmount: total,
        message:     message?.trim(),
      },
      include: {
        crop: { select: { name: true, unit: true } },
        from: { select: { firstName: true, lastName: true } },
      },
    });

    // Notify farmer
    await prisma.notification.create({
      data: {
        userId: crop.farmerId,
        type:   'OFFER',
        icon:   '🤝',
        title:  'New Offer Received!',
        text:   `${req.user.firstName} offered ₹${price}/${crop.unit} for ${qty} ${crop.unit} of ${crop.name}`,
        link:   '/offers',
      },
    });

    if (req.io) req.io.to(`user_${crop.farmerId}`).emit('new_offer', offer);

    res.status(201).json({ success: true, offer });
  } catch (err) {
    console.error('Create offer error:', err);
    res.status(500).json({ success: false, error: 'Failed to create offer' });
  }
});

// ── PATCH /api/offers/:id/respond ── Accept / Reject / Counter ────────────
router.patch('/:id/respond', authenticate, async (req, res) => {
  try {
    const offerId = parseInt(req.params.id);
    if (isNaN(offerId)) return res.status(400).json({ success: false, error: 'Invalid offer ID' });

    const { action, counterPrice } = req.body; // action: accept | reject | counter

    const offer = await prisma.offer.findUnique({
      where:   { id: offerId },
      include: { crop: true },
    });

    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.toId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the recipient can respond to this offer' });
    }
    if (offer.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Offer is already ${offer.status.toLowerCase()}` });
    }

    const actionMap = { accept: 'ACCEPTED', reject: 'REJECTED', counter: 'COUNTERED' };
    const newStatus = actionMap[action];
    if (!newStatus) {
      return res.status(400).json({ success: false, error: 'action must be: accept | reject | counter' });
    }

    const updated = await prisma.offer.update({
      where: { id: offerId },
      data:  { status: newStatus },
    });

    // If accepted → auto-create an order
    if (action === 'accept') {
      const order = await prisma.order.create({
        data: {
          cropId:      offer.cropId,
          farmerId:    offer.toId,
          buyerId:     offer.fromId,
          quantity:    offer.quantity,
          pricePerUnit: offer.offerPrice,
          totalAmount: offer.totalAmount,
        },
      });
      if (req.io) req.io.to(`user_${offer.fromId}`).emit('order_created', order);
    }

    // Notify buyer
    const notifText = action === 'accept'
      ? '🎉 Your offer was accepted! An order has been created.'
      : action === 'reject'
      ? 'Your offer was rejected by the farmer.'
      : `Counter offer: ₹${counterPrice}/${offer.crop.unit}`;

    await prisma.notification.create({
      data: {
        userId: offer.fromId,
        type:   'OFFER',
        icon:   '🤝',
        title:  `Offer ${action === 'accept' ? 'Accepted' : action === 'reject' ? 'Rejected' : 'Countered'}`,
        text:   notifText,
        link:   '/offers',
      },
    });

    if (req.io) req.io.to(`user_${offer.fromId}`).emit('offer_updated', updated);

    res.json({ success: true, offer: updated });
  } catch (err) {
    console.error('Respond offer error:', err);
    res.status(500).json({ success: false, error: 'Failed to respond to offer' });
  }
});

module.exports = router;
