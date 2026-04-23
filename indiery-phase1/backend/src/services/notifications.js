const { admin } = require('../middleware/auth');
const { getPool } = require('../db/pool');

/**
 * Send a push notification via FCM.
 * @param {string} recipientId - user or driver UUID
 * @param {'user'|'driver'} recipientType
 * @param {{ title, body, data }} payload
 */
async function sendPushNotification(recipientId, recipientType, { title, body, data = {} }) {
  const db = getPool();

  // Get FCM token from DB
  const table = recipientType === 'driver' ? 'drivers' : 'users';
  const { rows } = await db.query(`SELECT fcm_token FROM ${table} WHERE id = $1`, [recipientId]);
  const token = rows[0]?.fcm_token;

  if (!token) return; // No token registered — skip silently

  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });

    // Log it
    await db.query(
      `INSERT INTO notifications (user_id, driver_id, order_id, title, body)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        recipientType === 'user' ? recipientId : null,
        recipientType === 'driver' ? recipientId : null,
        data.orderId || null,
        title,
        body,
      ]
    );
  } catch (err) {
    console.error('FCM send error:', err.message);
  }
}

module.exports = { sendPushNotification };
