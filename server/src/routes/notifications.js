// ── NOTIFICATIONS ROUTES ──────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

// ── GET /api/notifications/read-all ── BEFORE /:id to avoid route conflict
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const { count } = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data:  { isRead: true },
    });
    res.json({ success: true, message: `${count} notification(s) marked as read` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to mark all read' });
  }
});

// ── GET /api/notifications ───────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take:    50,
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// ── PATCH /api/notifications/:id/read ── Mark single as read ─────────────
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid notification ID' });

    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data:  { isRead: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// ── DELETE /api/notifications/:id ── Delete notification ─────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid notification ID' });

    await prisma.notification.deleteMany({
      where: { id, userId: req.user.id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

module.exports = router;
