const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { getPool } = require('../db/pool');
const { sendPushNotification } = require('../services/notifications');

// Simple admin auth middleware — checks custom claim or hardcoded admin list
async function adminOnly(req, res, next) {
  if (!req.firebaseUser?.admin) return res.status(403).json({ error: 'Admin access required' });
  next();
}

// GET /api/admin/drivers/pending — list drivers pending KYC approval
router.get('/drivers/pending', verifyFirebaseToken, adminOnly, async (req, res) => {
  const db = getPool();
  const { rows } = await db.query(
    `SELECT * FROM drivers WHERE kyc_status='pending' ORDER BY created_at ASC`
  );
  res.json(rows);
});

// PATCH /api/admin/drivers/:id/kyc — approve or reject KYC
router.patch('/drivers/:id/kyc', verifyFirebaseToken, adminOnly, async (req, res) => {
  const db = getPool();
  const { action, reason } = req.body; // action: 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(action)) return res.status(400).json({ error: 'Invalid action' });

  await db.query('UPDATE drivers SET kyc_status=$1 WHERE id=$2', [action, req.params.id]);
  await db.query(
    `INSERT INTO kyc_reviews (driver_id, action, reason) VALUES ($1,$2,$3)`,
    [req.params.id, action, reason]
  );

  const msg = action === 'approved'
    ? { title: '✅ KYC Approved!', body: 'You can now go online and accept orders.' }
    : { title: '❌ KYC Rejected', body: reason || 'Your documents were rejected. Please re-upload.' };

  await sendPushNotification(req.params.id, 'driver', { ...msg, data: { screen: 'KYC' } });

  res.json({ ok: true, action });
});

// GET /api/admin/orders — all orders with filters
router.get('/orders', verifyFirebaseToken, adminOnly, async (req, res) => {
  const db = getPool();
  const { status, limit = 50, offset = 0 } = req.query;
  const where = status ? `WHERE status='${status}'` : '';
  const { rows } = await db.query(
    `SELECT o.*, u.name as customer_name, u.phone as customer_phone,
            d.name as driver_name, d.phone as driver_phone
     FROM orders o
     LEFT JOIN users u ON u.id = o.customer_id
     LEFT JOIN drivers d ON d.id = o.driver_id
     ${where}
     ORDER BY o.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  res.json(rows);
});

// GET /api/admin/metrics — basic dashboard metrics
router.get('/metrics', verifyFirebaseToken, adminOnly, async (req, res) => {
  const db = getPool();
  const [orders, drivers, users] = await Promise.all([
    db.query(`SELECT status, COUNT(*) FROM orders GROUP BY status`),
    db.query(`SELECT kyc_status, COUNT(*) FROM drivers GROUP BY kyc_status`),
    db.query(`SELECT COUNT(*) FROM users`),
  ]);
  res.json({
    ordersByStatus: orders.rows,
    driversByKycStatus: drivers.rows,
    totalUsers: users.rows[0].count,
  });
});

module.exports = router;
