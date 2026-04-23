const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { verifyFirebaseToken } = require('../middleware/auth');
const { getPool } = require('../db/pool');
const walletService = require('../services/wallet');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create — create Razorpay order
router.post('/create', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { orderId } = req.body;

  const { rows } = await db.query('SELECT * FROM orders WHERE id=$1', [orderId]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });

  try {
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(order.final_amount * 100), // paise
      currency: 'INR',
      receipt: orderId,
      notes: { indiery_order_id: orderId },
    });

    await db.query('UPDATE orders SET razorpay_order_id=$1 WHERE id=$2', [rpOrder.id, orderId]);

    res.json({
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/verify — verify payment signature after success
router.post('/verify', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  // Deduct coins used
  const { rows } = await db.query('SELECT * FROM orders WHERE id=$1', [orderId]);
  const order = rows[0];
  if (order.coins_used > 0) {
    await walletService.debitCoins(order.customer_id, order.coins_used, orderId);
  }

  await db.query(
    `UPDATE orders SET payment_status='captured', razorpay_payment_id=$1 WHERE id=$2`,
    [razorpayPaymentId, orderId]
  );

  res.json({ success: true });
});

module.exports = router;
