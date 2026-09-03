const router = require('express').Router();
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

router.post('/intent', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== req.user.id) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.paymentStatus === 'PAID') return res.status(409).json({ success: false, error: 'Order is already paid' });
    const payment = await prisma.payment.upsert({
      where: { orderId },
      update: { amount: order.totalAmount, status: 'PENDING' },
      create: { orderId, buyerId: req.user.id, amount: order.totalAmount },
    });
    res.status(201).json({ success: true, payment, nextAction: 'Complete payment with configured provider' });
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ success: false, error: 'Unable to create payment intent' });
  }
});

router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-payment-signature'];
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return res.status(401).json({ success: false, error: 'Webhook authentication required' });
  const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
  const received = Buffer.from(String(signature));
  const expectedBuffer = Buffer.from(expected);
  if (received.length !== expectedBuffer.length || !crypto.timingSafeEqual(received, expectedBuffer)) {
    return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
  }
  try {
    const { paymentId, status, providerRef } = req.body;
    if (!['AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid payment status' });
    const payment = await prisma.payment.update({ where: { id: paymentId }, data: { status, providerRef, ...(status === 'PAID' ? { order: { update: { paymentStatus: 'PAID' } } } : {}) } });
    res.json({ success: true, payment });
  } catch (err) {
    console.error('Payment webhook error:', err);
    res.status(500).json({ success: false, error: 'Unable to process payment webhook' });
  }
});

module.exports = router;
