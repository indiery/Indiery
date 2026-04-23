const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { getPool } = require('../db/pool');
const { calculateFare } = require('../services/pricing');
const { findNearestDriver } = require('../services/driverMatching');
const { transitionOrder } = require('../services/orderStateMachine');
const { sendPushNotification } = require('../services/notifications');

// POST /api/orders — create order + payment intent
router.post('/', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const {
    vehicleType, goodsType,
    pickupAddress, pickupLat, pickupLng,
    dropAddress, dropLat, dropLng,
    distanceKm, coinsUsed = 0, couponDiscount = 0,
  } = req.body;

  try {
    const { rows: users } = await db.query('SELECT id, coin_balance FROM users WHERE firebase_uid=$1', [req.firebaseUser.uid]);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (coinsUsed > user.coin_balance) return res.status(400).json({ error: 'Insufficient coins' });

    const fare = calculateFare(vehicleType, distanceKm, coinsUsed, couponDiscount);

    const { rows } = await db.query(
      `INSERT INTO orders
         (customer_id, vehicle_type, goods_type,
          pickup_address, pickup_lat, pickup_lng,
          drop_address, drop_lat, drop_lng,
          distance_km, base_fare, total_fare, gst_amount,
          coins_used, coupon_discount, final_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'created')
       RETURNING *`,
      [user.id, vehicleType, goodsType,
       pickupAddress, pickupLat, pickupLng,
       dropAddress, dropLat, dropLng,
       fare.distanceKm, fare.baseFare, fare.totalBeforeDiscount, fare.gstAmount,
       fare.coinsUsed, fare.couponDiscount, fare.finalAmount]
    );

    res.status(201).json({ order: rows[0], fare });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows } = await db.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
  res.json(rows[0]);
});

// GET /api/orders — customer order history
router.get('/', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows: users } = await db.query('SELECT id FROM users WHERE firebase_uid=$1', [req.firebaseUser.uid]);
  if (!users[0]) return res.status(404).json({ error: 'User not found' });

  const { rows } = await db.query(
    'SELECT * FROM orders WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 50',
    [users[0].id]
  );
  res.json(rows);
});

// POST /api/orders/:id/dispatch — find driver and dispatch
router.post('/:id/dispatch', verifyFirebaseToken, async (req, res) => {
  const db = getPool();
  const { rows } = await db.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const driver = await findNearestDriver(order.vehicle_type, order.pickup_lat, order.pickup_lng);
  if (!driver) return res.status(503).json({ error: 'No drivers available nearby' });

  await db.query('UPDATE orders SET driver_id=$1 WHERE id=$2', [driver.id, order.id]);

  await sendPushNotification(driver.id, 'driver', {
    title: '🚚 New Order!',
    body: `Pickup: ${order.pickup_address}. Fare: ₹${order.final_amount}`,
    data: { orderId: order.id, screen: 'OrderFeed' },
  });

  res.json({ driver, message: 'Driver notified' });
});

// PATCH /api/orders/:id/status — transition order state (driver)
router.patch('/:id/status', verifyFirebaseToken, async (req, res) => {
  try {
    const result = await transitionOrder(req.params.id, req.body.status);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
