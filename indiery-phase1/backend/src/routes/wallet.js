const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { getPool } = require('../db/pool');
const walletService = require('../services/wallet');

// GET /api/wallet — get coin balance & transaction history
router.get('/', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows: users } = await db.query('SELECT id, coin_balance FROM users WHERE firebase_uid=$1', [req.firebaseUser.uid]);
  if (!users[0]) return res.status(404).json({ error: 'User not found' });

  const { rows: txns } = await db.query(
    `SELECT * FROM wallet_transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30`,
    [users[0].id]
  );
  res.json({ coinBalance: users[0].coin_balance, transactions: txns });
});

module.exports = router;
