const router = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { sendVerificationCode } = require('../services/email');

router.post('/request', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, error: 'Valid email is required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: 'Account not found' });
    if (user.emailVerified) return res.json({ success: true, message: 'Email is already verified' });
    const code = String(crypto.randomInt(100000, 1000000));
    await prisma.emailVerification.deleteMany({ where: { email } });
    await prisma.emailVerification.create({
      data: { email, codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });
    await sendVerificationCode(email, code);
    res.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('Verification request error:', err);
    res.status(500).json({ success: false, error: 'Unable to send verification code' });
  }
});

router.post('/confirm', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const record = await prisma.emailVerification.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } });
    if (!record || record.expiresAt < new Date() || record.attempts >= 5) {
      return res.status(400).json({ success: false, error: 'Code expired or invalid' });
    }
    const valid = await bcrypt.compare(code, record.codeHash);
    if (!valid) {
      await prisma.emailVerification.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      return res.status(400).json({ success: false, error: 'Code expired or invalid' });
    }
    await prisma.$transaction([
      prisma.user.update({ where: { email }, data: { emailVerified: true, verified: true } }),
      prisma.emailVerification.delete({ where: { id: record.id } }),
    ]);
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verification confirm error:', err);
    res.status(500).json({ success: false, error: 'Unable to verify email' });
  }
});

module.exports = router;
