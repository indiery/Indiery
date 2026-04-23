const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { getPool } = require('../db/pool');

// PATCH /api/notifications/fcm-token — save FCM token for user or driver
router.patch('/fcm-token', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { fcmToken, role } = req.body; // role: 'user' | 'driver'
  const table = role === 'driver' ? 'drivers' : 'users';
  await db.query(`UPDATE ${table} SET fcm_token=$1 WHERE firebase_uid=$2`, [fcmToken, req.firebaseUser.uid]);
  res.json({ ok: true });
});

// GET /api/notifications — get notification history for user
router.get('/', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows: users } = await db.query('SELECT id FROM users WHERE firebase_uid=$1', [req.firebaseUser.uid]);
  if (!users[0]) return res.status(404).json({ error: 'Not found' });
  const { rows } = await db.query(
    'SELECT * FROM notifications WHERE user_id=$1 ORDER BY sent_at DESC LIMIT 50',
    [users[0].id]
  );
  res.json(rows);
});

module.exports = router;
