import admin from '../config/firebase.js';
import logger from '../utils/logger.js';

export const sendPushNotification = async (fcmToken, { title, body, data = {} }) => {
  if (!fcmToken) return null;
  try {
    return await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
  } catch (err) {
    logger.error(`FCM send error: ${err.message}`);
    return null;
  }
};

export const sendOrderUpdate = async (user, order, message) => {
  if (!user?.fcmToken) return;
  await sendPushNotification(user.fcmToken, {
    title: `Order ${order.orderId}`,
    body: message,
    data: { orderId: order.orderId, status: order.status, type: 'order_update' },
  });
};