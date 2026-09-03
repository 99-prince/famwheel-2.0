// ── MESSAGES ROUTES ────────────────────────────────────────────────────────
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

// ── GET /api/messages/conversations ──────────────────────────────────────
// MUST be before /:partnerId to prevent Express matching "conversations" as a partner ID
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const msgs = await prisma.message.findMany({
      where: { OR: [{ fromId: userId }, { toId: userId }] },
      include: {
        from: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
        to:   { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const convMap = {};
    for (const m of msgs) {
      const partnerId = m.fromId === userId ? m.toId   : m.fromId;
      const partner   = m.fromId === userId ? m.to     : m.from;
      if (!convMap[partnerId]) {
        convMap[partnerId] = { partner, lastMessage: m, unreadCount: 0 };
      }
      if (!m.isRead && m.toId === userId) {
        convMap[partnerId].unreadCount++;
      }
    }

    const conversations = Object.values(convMap).sort(
      (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json({ success: true, conversations });
  } catch (err) {
    console.error('Conversations error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// ── GET /api/messages/unread/count ───────────────────────────────────────
// MUST be before /:partnerId
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: { toId: req.user.id, isRead: false },
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
  }
});

// ── GET /api/messages/:partnerId ── Get thread ────────────────────────────
router.get('/:partnerId', authenticate, async (req, res) => {
  try {
    const userId    = req.user.id;
    const partnerId = parseInt(req.params.partnerId);

    if (isNaN(partnerId)) {
      return res.status(400).json({ success: false, error: 'Invalid partner ID' });
    }

    const { page = 1, limit = 50 } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: userId, toId: partnerId },
          { fromId: partnerId, toId: userId },
        ],
      },
      include: {
        from: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip:  (parseInt(page) - 1) * parseInt(limit),
      take:  parseInt(limit),
    });

    // Mark all messages from partner to me as read
    await prisma.message.updateMany({
      where: { fromId: partnerId, toId: userId, isRead: false },
      data:  { isRead: true },
    });

    res.json({ success: true, messages });
  } catch (err) {
    console.error('Thread error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// ── POST /api/messages ── Send a message ──────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { toId, text } = req.body;

    if (!toId || !text?.trim()) {
      return res.status(400).json({ success: false, error: 'toId and text are required' });
    }

    const to = parseInt(toId);
    if (isNaN(to)) return res.status(400).json({ success: false, error: 'Invalid toId' });

    const receiver = await prisma.user.findUnique({ where: { id: to } });
    if (!receiver) return res.status(404).json({ success: false, error: 'Recipient not found' });

    const message = await prisma.message.create({
      data: { fromId: req.user.id, toId: to, text: text.trim() },
      include: {
        from: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Real-time delivery via Socket.IO
    if (req.io) req.io.to(`user_${to}`).emit('new_message', message);

    // Notification for offline delivery
    await prisma.notification.create({
      data: {
        userId: to,
        type:   'SYSTEM',
        icon:   '💬',
        title:  'New Message',
        text:   `${req.user.firstName} sent you a message`,
        link:   '/messages',
      },
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

module.exports = router;
