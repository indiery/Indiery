const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { getPool } = require('../db/pool');

// POST /api/auth/user — register or login customer
router.post('/user', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { uid, phone_number, email, name } = req.firebaseUser;

  let { rows } = await db.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
  if (rows.length === 0) {
    const result = await db.query(
      `INSERT INTO users (firebase_uid, phone, email, name) VALUES ($1,$2,$3,$4) RETURNING *`,
      [uid, phone_number, email, name || req.body.name]
    );
    rows = result.rows;
  }
  res.json({ user: rows[0] });
});

// POST /api/auth/driver — register or login driver
router.post('/driver', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { uid, phone_number } = req.firebaseUser;

  let { rows } = await db.query('SELECT * FROM drivers WHERE firebase_uid = $1', [uid]);
  if (rows.length === 0) {
    const result = await db.query(
      `INSERT INTO drivers (firebase_uid, phone, name) VALUES ($1,$2,$3) RETURNING *`,
      [uid, phone_number, req.body.name]
    );
    rows = result.rows;
  }
  res.json({ driver: rows[0] });
});

module.exports = router;
