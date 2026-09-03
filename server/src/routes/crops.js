// ── CROPS ROUTES ──────────────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// ── GET /api/crops/farmer/my ─────────────────────────────────────────────
// MUST be defined BEFORE /:id to prevent Express matching "farmer" as an id
router.get('/farmer/my', authenticate, requireRole('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const crops = await prisma.crop.findMany({
      where: { farmerId: req.user.id },
      include: { _count: { select: { orders: true, offers: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, crops });
  } catch (err) {
    console.error('My crops error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch your crops' });
  }
});

// ── GET /api/crops ── List all crops (public, with filters) ──────────────
router.get('/', async (req, res) => {
  try {
    const {
      search, category, state,
      minPrice, maxPrice,
      sortBy = 'createdAt', order = 'desc',
      page = 1, limit = 20,
    } = req.query;

    const where = { isAvailable: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (category) where.category = category.toUpperCase();
    if (state)    where.farmer = { state: { contains: state } };
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    const validSort = ['price', 'createdAt', 'name'];
    const orderBy = { [validSort.includes(sortBy) ? sortBy : 'createdAt']: order === 'asc' ? 'asc' : 'desc' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [crops, total] = await Promise.all([
      prisma.crop.findMany({
        where, orderBy, skip, take,
        include: {
          farmer: {
            select: { id: true, firstName: true, lastName: true, avatar: true, state: true, city: true, verified: true },
          },
          _count: { select: { orders: true } },
        },
      }),
      prisma.crop.count({ where }),
    ]);

    res.json({
      success: true, crops, total,
      page: parseInt(page),
      pages: Math.ceil(total / take),
    });
  } catch (err) {
    console.error('List crops error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch crops' });
  }
});

// ── GET /api/crops/:id ── Get single crop ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid crop ID' });

    const crop = await prisma.crop.findUnique({
      where: { id },
      include: {
        farmer: {
          select: { id: true, firstName: true, lastName: true, avatar: true, state: true, city: true, verified: true, phone: true },
        },
        _count: { select: { orders: true, offers: true } },
      },
    });
    if (!crop) return res.status(404).json({ success: false, error: 'Crop not found' });
    res.json({ success: true, crop });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch crop' });
  }
});

// ── POST /api/crops ── Create crop (farmer only) ─────────────────────────
router.post('/', authenticate, requireRole('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { name, emoji, category, quality, description, price, unit, quantity, minOrderQty } = req.body;

    if (!name || !description || price === undefined || quantity === undefined) {
      return res.status(400).json({ success: false, error: 'name, description, price, quantity are required' });
    }

    const validCategories = ['GRAIN', 'VEGETABLE', 'FRUIT', 'PULSE', 'OILSEED', 'SPICE', 'DAIRY', 'OTHER'];
    const resolvedCategory = validCategories.includes(category?.toUpperCase()) ? category.toUpperCase() : 'OTHER';

    const crop = await prisma.crop.create({
      data: {
        name,
        emoji: emoji || '🌱',
        category: resolvedCategory,
        quality: quality || 'Grade A',
        description,
        price: parseFloat(price),
        unit: unit || 'kg',
        quantity: parseFloat(quantity),
        minOrderQty: parseFloat(minOrderQty) || 1,
        farmerId: req.user.id,
      },
      include: {
        farmer: { select: { firstName: true, lastName: true, state: true, city: true } },
      },
    });

    if (req.io) req.io.emit('new_crop', crop);
    res.status(201).json({ success: true, crop });
  } catch (err) {
    console.error('Create crop error:', err);
    res.status(500).json({ success: false, error: 'Failed to create crop' });
  }
});

// ── PUT /api/crops/:id ── Update crop ────────────────────────────────────
router.put('/:id', authenticate, requireRole('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid crop ID' });

    const crop = await prisma.crop.findUnique({ where: { id } });
    if (!crop) return res.status(404).json({ success: false, error: 'Crop not found' });
    if (crop.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this crop' });
    }

    const { name, emoji, category, quality, description, price, unit, quantity, minOrderQty, isAvailable } = req.body;
    const updated = await prisma.crop.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(emoji !== undefined && { emoji }),
        ...(category !== undefined && { category: category.toUpperCase() }),
        ...(quality !== undefined && { quality }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(unit !== undefined && { unit }),
        ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
        ...(minOrderQty !== undefined && { minOrderQty: parseFloat(minOrderQty) }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
      },
    });
    res.json({ success: true, crop: updated });
  } catch (err) {
    console.error('Update crop error:', err);
    res.status(500).json({ success: false, error: 'Failed to update crop' });
  }
});

// ── DELETE /api/crops/:id ── Soft-delete crop ────────────────────────────
router.delete('/:id', authenticate, requireRole('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid crop ID' });

    const crop = await prisma.crop.findUnique({ where: { id } });
    if (!crop) return res.status(404).json({ success: false, error: 'Crop not found' });
    if (crop.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Soft delete — marks as unavailable, preserves order history
    await prisma.crop.update({ where: { id }, data: { isAvailable: false } });
    res.json({ success: true, message: 'Crop removed from marketplace' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete crop' });
  }
});

module.exports = router;
