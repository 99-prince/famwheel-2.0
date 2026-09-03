// ── TRANSPORT PROVIDER ROUTES ─────────────────────────────────────────────
// Separate from transport requests — handles provider profiles
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// ── GET /api/providers/me ── Get own provider profile ───────────────────
router.get('/me', authenticate, requireRole('TRANSPORT', 'ADMIN'), async (req, res) => {
  try {
    const provider = await prisma.transportProvider.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { firstName: true, lastName: true, phone: true, state: true } } },
    });
    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch provider profile' });
  }
});

// ── POST /api/providers/register ── Register as transport provider ────────
router.post('/register', authenticate, requireRole('TRANSPORT', 'ADMIN'), async (req, res) => {
  try {
    const { vehicleType, vehicleNo, capacity, currentLoc } = req.body;

    if (!vehicleType || !vehicleNo || !capacity) {
      return res.status(400).json({ success: false, error: 'vehicleType, vehicleNo, and capacity are required' });
    }

    const existing = await prisma.transportProvider.findUnique({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Already registered as a provider. Use PUT /api/providers/me to update.' });
    }

    const provider = await prisma.transportProvider.create({
      data: {
        userId:      req.user.id,
        vehicleType: vehicleType.trim(),
        vehicleNo:   vehicleNo.trim().toUpperCase(),
        capacity:    parseFloat(capacity),
        currentLoc:  currentLoc?.trim(),
      },
    });

    res.status(201).json({ success: true, provider });
  } catch (err) {
    console.error('Provider register error:', err);
    res.status(500).json({ success: false, error: 'Failed to register as provider' });
  }
});

// ── PUT /api/providers/me ── Update own provider profile ─────────────────
router.put('/me', authenticate, requireRole('TRANSPORT', 'ADMIN'), async (req, res) => {
  try {
    const { vehicleType, vehicleNo, capacity, currentLoc, isAvailable } = req.body;

    const provider = await prisma.transportProvider.findUnique({ where: { userId: req.user.id } });
    if (!provider) {
      return res.status(404).json({ success: false, error: 'Provider profile not found. POST /api/providers/register first.' });
    }

    const updated = await prisma.transportProvider.update({
      where: { userId: req.user.id },
      data: {
        ...(vehicleType  !== undefined && { vehicleType:  vehicleType.trim() }),
        ...(vehicleNo    !== undefined && { vehicleNo:    vehicleNo.trim().toUpperCase() }),
        ...(capacity     !== undefined && { capacity:     parseFloat(capacity) }),
        ...(currentLoc   !== undefined && { currentLoc:   currentLoc?.trim() }),
        ...(isAvailable  !== undefined && { isAvailable:  Boolean(isAvailable) }),
      },
    });

    res.json({ success: true, provider: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update provider profile' });
  }
});

// ── GET /api/providers ── List all available providers (admin/internal) ──
router.get('/', authenticate, async (req, res) => {
  try {
    const providers = await prisma.transportProvider.findMany({
      where: { isAvailable: true },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, state: true, city: true, verified: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, providers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch providers' });
  }
});

module.exports = router;
