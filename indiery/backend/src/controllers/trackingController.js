import Order from '../models/Order.js';
import Driver from '../models/Driver.js';

/**
 * GET /orders/:orderId/track — current driver location + order status
 * (real-time updates flow through Socket.io; this is a fallback REST endpoint)
 */
export const getOrderTracking = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('driver', 'currentLocation lastLocationUpdate ownerName vehicleNumber rating')
      .lean();

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorize: only customer or assigned driver can track
    const isCustomer = order.customer.toString() === req.user._id.toString();
    let isDriver = false;
    if (!isCustomer) {
      const driver = await Driver.findOne({ user: req.user._id });
      isDriver = driver && order.driver?._id?.toString() === driver._id.toString();
    }
    if (!isCustomer && !isDriver) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      tracking: {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
        eta: order.eta,
        promisedDeliveryTime: order.promisedDeliveryTime,
        pickup: order.pickup,
        drop: order.drop,
        driverLocation: order.driver?.currentLocation || null,
        lastLocationUpdate: order.driver?.lastLocationUpdate || null,
        driver: order.driver
          ? {
              name: order.driver.ownerName,
              vehicleNumber: order.driver.vehicleNumber,
              rating: order.driver.rating,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /tracking/nearby-drivers?lng=&lat=&radius=&vehicleType=
 * Returns nearby online drivers for the customer's "vehicles available" preview.
 */
export const getNearbyDrivers = async (req, res, next) => {
  try {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const radius = parseInt(req.query.radius) || 5000;
    const { vehicleType } = req.query;

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const query = {
      isOnline: true,
      verificationStatus: 'verified',
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    };
    if (vehicleType) query.vehicleType = vehicleType;

    const drivers = await Driver.find(query)
      .select('currentLocation vehicleType rating')
      .limit(20);

    res.json({
      success: true,
      drivers: drivers.map((d) => ({
        id: d._id,
        coordinates: d.currentLocation.coordinates,
        vehicleType: d.vehicleType,
        rating: d.rating,
      })),
    });
  } catch (err) {
    next(err);
  }
};