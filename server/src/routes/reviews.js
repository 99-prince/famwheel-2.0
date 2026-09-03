// ── REVIEWS ROUTES ─────────────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

// ── GET /api/reviews/:userId ── Reviews for a specific user ───────────────
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const reviews = await prisma.review.findMany({
      where:   { toId: userId },
      include: { from: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ success: true, reviews, avgRating, total: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// ── POST /api/reviews ── Submit a review ──────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { toId, rating, comment, cropName, orderId } = req.body;

    if (!toId || rating === undefined || !comment) {
      return res.status(400).json({ success: false, error: 'toId, rating, and comment are required' });
    }

    const to = parseInt(toId);
    if (isNaN(to)) return res.status(400).json({ success: false, error: 'Invalid toId' });
    if (to === req.user.id) return res.status(400).json({ success: false, error: 'You cannot review yourself' });

    const ratingInt = parseInt(rating);
    if (ratingInt < 1 || ratingInt > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: to } });
    if (!targetUser) return res.status(404).json({ success: false, error: 'User to review not found' });

    const review = await prisma.review.create({
      data: {
        fromId:   req.user.id,
        toId:     to,
        rating:   ratingInt,
        comment:  comment.trim(),
        cropName: cropName?.trim(),
        orderId:  orderId || null,
      },
      include: {
        from: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });

    // Notify the reviewed user
    await prisma.notification.create({
      data: {
        userId: to,
        type:   'REVIEW',
        icon:   '⭐',
        title:  'New Review!',
        text:   `${req.user.firstName} gave you ${ratingInt} stars: "${comment.slice(0, 50)}${comment.length > 50 ? '…' : ''}"`,
        link:   '/profile',
      },
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

module.exports = router;
