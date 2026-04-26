import Order from '../models/Order.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { buildPriceBreakdown } from '../services/pricingService.js';
import { getDistanceMatrix } from '../services/mapService.js';
import { settleOrder, refundCoinsOnCancel } from '../services/refundService.js';
import { generateOrderId, generateOTP } from '../utils/helpers.js';
import { sendOrderUpdate } from '../services/notificationService.js';
import { emitToOrder, emitToDriver, emitToCustomer } from '../sockets/trackingSocket.js';
import { ORDER_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * POST /orders — create a new order (customer)
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      vehicleType, pickup, drop, goodsType, goodsDescription,
      weight, paymentMethod = 'upi', couponCode, coinsUsed = 0,
    } = req.body;

    if (!vehicleType || !pickup?.coordinates || !drop?.coordinates) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const { distanceKm, durationMin } = await getDistanceMatrix(
      pickup.coordinates,
      drop.coordinates
    );

    // Validate coins against user's balance
    const useCoins = Math.min(Math.max(0, coinsUsed), req.user.creditCoins);

    const pricing = buildPriceBreakdown({
      vehicleType,
      distanceKm,
      couponDiscount: 0,
      coinsUsed: useCoins,
    });

    // ETA: now + driver pickup (~5 min) + journey + 5 min buffer
    const promisedDeliveryTime = new Date(
      Date.now() + (5 + durationMin + 5) * 60 * 1000
    );

    const order = await Order.create({
      orderId: generateOrderId(),
      customer: req.user._id,
      tripType: 'intracity',
      vehicleType,
      pickup,
      drop,
      distanceKm,
      estimatedDurationMin: durationMin,
      goodsType: goodsType || 'other',
      goodsDescription,
      weight,
      pricing,
      couponCode,
      coinsUsed: useCoins,
      paymentMethod,
      status: ORDER_STATUS.PENDING,
      pickupOtp: generateOTP(4),
      promisedDeliveryTime,
      statusHistory: [{ status: ORDER_STATUS.PENDING, note: 'Order created' }],
    });

    // Deduct coins (refunded if order cancelled)
    if (useCoins > 0) {
      req.user.creditCoins -= useCoins;
      await req.user.save();
    }

    // Background: find nearby drivers and notify via socket
    findAndNotifyDrivers(order).catch((e) =>
      logger.error(`Driver matching: ${e.message}`)
    );

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * Find nearest online verified drivers within 5 km of pickup; notify via socket.
 */
const findAndNotifyDrivers = async (order) => {
  const drivers = await Driver.find({
    isOnline: true,
    verificationStatus: 'verified',
    vehicleType: order.vehicleType,
    currentLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: order.pickup.coordinates },
        $maxDistance: 5000,
      },
    },
  }).limit(10);

  drivers.forEach((d) => {
    emitToDriver(d._id.toString(), 'new_order_request', {
      orderId: order.orderId,
      pickup: order.pickup,
      drop: order.drop,
      pricing: order.pricing,
      distanceKm: order.distanceKm,
    });
  });
};

/**
 * GET /orders/:orderId
 */
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('customer', 'name phone profileImage')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name phone profileImage' },
      });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /orders/:orderId/accept (driver)
 */
export const acceptOrder = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: 'Order no longer available' });
    }

    order.driver = driver._id;
    order.status = ORDER_STATUS.DRIVER_ASSIGNED;
    order.statusHistory.push({ status: ORDER_STATUS.DRIVER_ASSIGNED, note: 'Driver accepted' });
    await order.save();

    const customer = await User.findById(order.customer);
    sendOrderUpdate(customer, order, 'A driver has been assigned to your order!');
    emitToCustomer(order.customer.toString(), 'order_status', {
      orderId: order.orderId,
      status: order.status,
      driver,
    });

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /orders/:orderId/status (driver updates progress)
 * body: { status, location?: [lng, lat] }
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { status, location } = req.body;

    const validTransitions = [
      ORDER_STATUS.DRIVER_ARRIVING,
      ORDER_STATUS.ARRIVED_PICKUP,
      ORDER_STATUS.PICKED_UP,
      ORDER_STATUS.IN_TRANSIT,
      ORDER_STATUS.ARRIVED_DROP,
      ORDER_STATUS.DELIVERED,
    ];
    if (!validTransitions.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const driver = await Driver.findOne({ user: req.user._id });
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.driver?.equals(driver._id)) {
      return res.status(403).json({ success: false, message: 'Not your order' });
    }

    order.status = status;
    order.statusHistory.push({ status, location, timestamp: new Date() });

    if (status === ORDER_STATUS.PICKED_UP) order.pickedUpAt = new Date();

    if (status === ORDER_STATUS.DELIVERED) {
      order.deliveredAt = new Date();
      order.isDelayed = order.deliveredAt > order.promisedDeliveryTime;
      await settleOrder(order, driver);
    }

    await order.save();

    const customer = await User.findById(order.customer);
    sendOrderUpdate(customer, order, `Order ${status.replace(/_/g, ' ')}`);
    emitToOrder(order.orderId, 'order_status', {
      orderId: order.orderId,
      status,
      location,
    });

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /orders/:orderId/pickup-otp (driver verifies pickup OTP)
 */
export const verifyPickupOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const driver = await Driver.findOne({ user: req.user._id });
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order || !order.driver?.equals(driver._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.pickupOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /orders/:orderId/pod (driver uploads Proof of Delivery)
 * body: { type: 'pickup'|'drop', imageUrl }
 */
export const uploadPOD = async (req, res, next) => {
  try {
    const { type, imageUrl } = req.body;
    if (!['pickup', 'drop'].includes(type) || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Invalid POD data' });
    }

    const driver = await Driver.findOne({ user: req.user._id });
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order || !order.driver?.equals(driver._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (type === 'pickup') order.podPickupImage = imageUrl;
    else order.podDropImage = imageUrl;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /orders/:orderId/cancel (customer or assigned driver)
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const cancellableStates = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.DRIVER_ASSIGNED,
      ORDER_STATUS.DRIVER_ARRIVING,
    ];
    if (!cancellableStates.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
    }

    const isCustomer = order.customer.equals(req.user._id);
    if (!isCustomer) {
      const driver = await Driver.findOne({ user: req.user._id });
      if (!driver || !order.driver?.equals(driver._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledBy = isCustomer ? 'customer' : 'driver';
    order.cancellationReason = reason;
    order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note: reason });
    await order.save();

    await refundCoinsOnCancel(order);

    emitToOrder(order.orderId, 'order_cancelled', {
      orderId: order.orderId,
      by: order.cancelledBy,
    });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /orders/:orderId/rate (customer rates driver)
 */
export const rateOrder = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order || !order.customer.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status !== ORDER_STATUS.DELIVERED) {
      return res.status(400).json({ success: false, message: 'Can only rate delivered orders' });
    }

    if (order.driver) {
      const driver = await Driver.findById(order.driver);
      const newCount = driver.ratingCount + 1;
      driver.rating = +(((driver.rating * driver.ratingCount) + rating) / newCount).toFixed(2);
      driver.ratingCount = newCount;
      await driver.save();
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};