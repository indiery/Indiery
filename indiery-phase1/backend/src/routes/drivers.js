const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { getPool } = require('../db/pool');

// GET /api/drivers/me — driver profile
router.get('/me', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows } = await db.query('SELECT * FROM drivers WHERE firebase_uid=$1', [req.firebaseUser.uid]);
  if (!rows[0]) return res.status(404).json({ error: 'Driver not found' });
  res.json(rows[0]);
});

// PATCH /api/drivers/me — update profile / KYC fields
router.patch('/me', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const allowed = ['name', 'pan', 'bank_account', 'bank_ifsc', 'bank_name', 'vehicle_type', 'fcm_token'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const keys = Object.keys(updates);
  if (keys.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const setClauses = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
  const values = [...Object.values(updates), req.firebaseUser.uid];

  const { rows } = await db.query(
    `UPDATE drivers SET ${setClauses} WHERE firebase_uid=$${values.length} RETURNING *`,
    values
  );
  res.json(rows[0]);
});

// PATCH /api/drivers/me/toggle — go online/offline
router.patch('/me/toggle', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows } = await db.query(
    `UPDATE drivers SET is_online = NOT is_online WHERE firebase_uid=$1 RETURNING id, is_online`,
    [req.firebaseUser.uid]
  );
  res.json(rows[0]);
});

// GET /api/drivers/me/orders — driver's order feed (available orders nearby)
router.get('/me/orders', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows: drivers } = await db.query('SELECT * FROM drivers WHERE firebase_uid=$1', [req.firebaseUser.uid]);
  const driver = drivers[0];
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  // Orders assigned to this driver, pending acceptance
  const { rows } = await db.query(
    `SELECT * FROM orders
     WHERE driver_id=$1 AND status IN ('created','accepted','pickup','in_transit')
     ORDER BY created_at DESC`,
    [driver.id]
  );
  res.json(rows);
});

// GET /api/drivers/me/earnings — earnings summary
router.get('/me/earnings', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows: drivers } = await db.query('SELECT id, wallet_balance FROM drivers WHERE firebase_uid=$1', [req.firebaseUser.uid]);
  const driver = drivers[0];
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  const { rows } = await db.query(
    `SELECT DATE(created_at) AS day, SUM(amount) AS total
     FROM wallet_transactions WHERE driver_id=$1 GROUP BY day ORDER BY day DESC LIMIT 30`,
    [driver.id]
  );
  res.json({ walletBalance: driver.wallet_balance, dailyEarnings: rows });
});

module.exports = router;
