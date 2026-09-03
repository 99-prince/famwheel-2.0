// ── MARKET PRICES ROUTES ──────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// ── GET /api/market-prices ── Public list ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const where = {};
    if (search)   where.name     = { contains: search };
    if (category) where.category = category;

    const prices = await prisma.marketPrice.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, prices });
  } catch (err) {
    console.error('Market prices error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch prices' });
  }
});

// ── GET /api/market-prices/:id ── Single price ───────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID' });

    const price = await prisma.marketPrice.findUnique({ where: { id } });
    if (!price) return res.status(404).json({ success: false, error: 'Price not found' });
    res.json({ success: true, price });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch price' });
  }
});

// ── POST /api/market-prices ── Admin: create new price ───────────────────
router.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, emoji, category, region, price, unit, minPrice, maxPrice } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'name and price are required' });
    }
    const entry = await prisma.marketPrice.create({
      data: {
        name, emoji: emoji || '🌾', category: category || 'General',
        region: region || 'India',
        price:    parseFloat(price),
        unit:     unit || 'qtl',
        minPrice: minPrice ? parseFloat(minPrice) : parseFloat(price) * 0.9,
        maxPrice: maxPrice ? parseFloat(maxPrice) : parseFloat(price) * 1.1,
      },
    });
    if (req.io) req.io.emit('price_update', entry);
    res.status(201).json({ success: true, price: entry });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create price' });
  }
});

// ── PUT /api/market-prices/:id ── Admin: update price ───────────────────
router.put('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID' });

    const { price, minPrice, maxPrice } = req.body;
    const updated = await prisma.marketPrice.update({
      where: { id },
      data: {
        ...(price    !== undefined && { price:    parseFloat(price)    }),
        ...(minPrice !== undefined && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice !== undefined && { maxPrice: parseFloat(maxPrice) }),
      },
    });
    if (req.io) req.io.emit('price_update', updated);
    res.json({ success: true, price: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update price' });
  }
});

// ── DELETE /api/market-prices/:id ── Admin: delete price ─────────────────
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID' });
    await prisma.marketPrice.delete({ where: { id } });
    res.json({ success: true, message: 'Price deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete price' });
  }
});

module.exports = router;
