// ── FAM WHEEL – MAIN SERVER ────────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const http    = require('http');
const { Server } = require('socket.io');
const prisma  = require('./lib/prisma');

const app    = express();
const server = http.createServer(app);

// ── SOCKET.IO ─────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// ── MIDDLEWARE ────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Inject io + prisma into every request so routes can use req.io and req.prisma
app.use((req, _res, next) => {
  req.io     = io;
  req.prisma = prisma;
  next();
});

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`  ${req.method.padEnd(6)} ${req.path}`);
    next();
  });
}

// ── ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/crops',         require('./routes/crops'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/offers',        require('./routes/offers'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/transport',     require('./routes/transport'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/market-prices', require('./routes/market-prices'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/providers',     require('./routes/providers'));

// ── HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status:    'ok',
      message:   '🚜 FAM WHEEL API is running!',
      version:   '2.0.0',
      database:  'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

// ── API DOCS (root) ───────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html><head><title>FAM WHEEL API</title>
    <style>body{font-family:monospace;background:#0a0f0d;color:#4ade80;padding:40px}
    h1{color:#fff}pre{color:#d1fae5;font-size:14px}a{color:#4ade80}</style></head>
    <body>
    <h1>🚜 FAM WHEEL API v2.0</h1>
    <p style="color:#9ca3af">Server running on port <b style="color:#fff">${process.env.PORT || 5000}</b></p>
    <a href="/api/health">GET /api/health</a>
    <pre>
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/crops            (public)
POST   /api/crops            (FARMER)
GET    /api/crops/farmer/my  (FARMER)
PUT    /api/crops/:id        (FARMER)
DELETE /api/crops/:id        (FARMER)

GET    /api/orders
POST   /api/orders           (BUYER)
PATCH  /api/orders/:id/status
GET    /api/orders/stats/summary

GET    /api/offers
POST   /api/offers           (BUYER)
PATCH  /api/offers/:id/respond (FARMER)

GET    /api/messages/conversations
GET    /api/messages/:partnerId
POST   /api/messages

GET    /api/transport
POST   /api/transport
PATCH  /api/transport/:id/bid   (TRANSPORT)
PATCH  /api/transport/:id/status

GET    /api/notifications
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id

GET    /api/market-prices    (public)
PUT    /api/market-prices/:id (ADMIN)

GET    /api/reviews/:userId  (public)
POST   /api/reviews

GET    /api/users            (ADMIN)
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/:id        (public)
PATCH  /api/users/:id/verify (ADMIN)
    </pre>
    </body></html>
  `);
});

// ── 404 HANDLER ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error:   process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── SOCKET.IO EVENTS ──────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`  🔌 Socket connected   : ${socket.id}`);

  // User joins their personal room so we can send targeted events
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`  ✅ User ${userId} joined room user_${userId}`);
  });

  // Relay chat message — also saves to DB for persistence
  socket.on('send_message', async (data) => {
    try {
      const { fromId, toId, text } = data;
      const message = await prisma.message.create({
        data: { fromId: parseInt(fromId), toId: parseInt(toId), text },
        include: { from: { select: { firstName: true, lastName: true, avatar: true } } },
      });
      io.to(`user_${toId}`).emit('new_message', message);
      socket.emit('message_sent', message);
    } catch (err) {
      console.error('Socket send_message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async ({ userId, fromId }) => {
    try {
      await prisma.message.updateMany({
        where: { toId: parseInt(userId), fromId: parseInt(fromId), isRead: false },
        data:  { isRead: true },
      });
    } catch (err) {
      console.error('Socket mark_read error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`  🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── START SERVER ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;

server.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`
╔═════════════════════════════════════════╗
║   🚜  FAM WHEEL API Server Started!    ║
╠═════════════════════════════════════════╣
║  🌐 Server  : http://localhost:${PORT}       ║
║  🗄️  Database: SQLite (famwheel.db)     ║
║  📡 Socket  : Socket.IO enabled         ║
║  🔑 JWT     : ${process.env.JWT_EXPIRES_IN || '7d'} token expiry              ║
║  📱 Client  : ${process.env.CLIENT_URL || 'http://localhost:5173'}  ║
╚═════════════════════════════════════════╝

  Visit http://localhost:${PORT}/api/health to verify.
`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Run: cd server && npm run db:push && npm run db:seed');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT',  () => { prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', () => { prisma.$disconnect(); process.exit(0); });
