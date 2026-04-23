const { getPool } = require('../db/pool');

async function creditCoins(userId, amount, orderId) {
  const db = getPool();
  await db.query('UPDATE users SET coin_balance = coin_balance + $1 WHERE id = $2', [amount, userId]);
  await db.query(
    `INSERT INTO wallet_transactions (user_id, order_id, type, amount, description)
     VALUES ($1, $2, 'coin_credit', $3, 'Late delivery refund')`,
    [userId, orderId, amount]
  );
}

async function debitCoins(userId, amount, orderId) {
  const db = getPool();
  const { rows } = await db.query('SELECT coin_balance FROM users WHERE id = $1', [userId]);
  if (rows[0].coin_balance < amount) throw new Error('Insufficient coins');
  await db.query('UPDATE users SET coin_balance = coin_balance - $1 WHERE id = $2', [amount, userId]);
  await db.query(
    `INSERT INTO wallet_transactions (user_id, order_id, type, amount, description)
     VALUES ($1, $2, 'coin_debit', $3, 'Coins applied at checkout')`,
    [userId, orderId, amount]
  );
}

async function creditDriver(driverId, amount, orderId, isLate) {
  const db = getPool();
  await db.query('UPDATE drivers SET wallet_balance = wallet_balance + $1 WHERE id = $2', [amount, driverId]);
  await db.query(
    `INSERT INTO wallet_transactions (driver_id, order_id, type, amount, description)
     VALUES ($1, $2, $3, $4, $5)`,
    [driverId, orderId, isLate ? 'driver_penalty' : 'reserve_bonus', amount,
     isLate ? 'Delivery earning (late penalty applied)' : 'Delivery earning + on-time bonus']
  );
}

async function getBalance(userId) {
  const db = getPool();
  const { rows } = await db.query('SELECT coin_balance FROM users WHERE id = $1', [userId]);
  return rows[0]?.coin_balance ?? 0;
}

module.exports = { creditCoins, debitCoins, creditDriver, getBalance };
