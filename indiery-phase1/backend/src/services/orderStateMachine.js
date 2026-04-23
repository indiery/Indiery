/**
 * Order State Machine — Indiery Phase 1
 *
 * States:  created → accepted → pickup → in_transit → delivered
 *                                              ↘
 *                                           cancelled (from any state except delivered)
 */

const VALID_TRANSITIONS = {
  created:    ['accepted', 'cancelled'],
  accepted:   ['pickup', 'cancelled'],
  pickup:     ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered:  [],
  cancelled:  [],
};

const TIMESTAMP_FIELDS = {
  accepted:   'accepted_at',
  pickup:     'pickup_at',
  in_transit: 'in_transit_at',
  delivered:  'delivered_at',
};

function canTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

const { getPool } = require('../db/pool');
const { settleLateOrOnTime } = require('./pricing');
const { sendPushNotification } = require('./notifications');
const walletService = require('./wallet');

async function transitionOrder(orderId, newStatus, actorId = null) {
  const db = getPool();

  const { rows } = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = rows[0];
  if (!order) throw new Error('Order not found');

  if (!canTransition(order.status, newStatus)) {
    throw new Error(`Invalid transition: ${order.status} → ${newStatus}`);
  }

  const tsField = TIMESTAMP_FIELDS[newStatus];
  const tsUpdate = tsField ? `, ${tsField} = NOW()` : '';

  await db.query(
    `UPDATE orders SET status = $1 ${tsUpdate} WHERE id = $2`,
    [newStatus, orderId]
  );

  // Post-transition side effects
  if (newStatus === 'delivered') {
    await handleDelivery(order, db);
  }

  return { orderId, previousStatus: order.status, newStatus };
}

async function handleDelivery(order, db) {
  // Determine if late
  const now = new Date();
  const isLate = order.estimated_delivery_at && now > new Date(order.estimated_delivery_at);

  await db.query('UPDATE orders SET is_late = $1 WHERE id = $2', [isLate, order.id]);

  const settlement = settleLateOrOnTime(order.final_amount, isLate);

  // Credit driver wallet
  await walletService.creditDriver(order.driver_id, settlement.driverEarning, order.id, isLate);

  // Credit customer coins if late
  if (isLate && settlement.customerCoinRefund > 0) {
    await walletService.creditCoins(order.customer_id, settlement.customerCoinRefund, order.id);
  }

  // Notifications
  await sendPushNotification(order.customer_id, 'user', {
    title: '📦 Delivered!',
    body: isLate
      ? `Your order was delivered late. You received ₹${settlement.customerCoinRefund} in Indiery Coins.`
      : 'Your order has been delivered on time. Thank you for using Indiery!',
    data: { orderId: order.id, screen: 'OrderHistory' },
  });
}

module.exports = { transitionOrder, canTransition };
