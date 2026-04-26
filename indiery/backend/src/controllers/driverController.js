import Driver from '../models/Driver.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';

export const getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone profileImage'
    );
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    res.json({ success: true, driver });
  } catch (err) {
    next(err);
  }
};

export const updateDriverProfile = async (req, res, next) => {
  try {
    const allowed = [
      'ownerName', 'city', 'pan', 'selfieUrl',
      'vehicleType', 'drivingLicenceUrl', 'vehicleRegistrationUrl',
      'vehicleInsuranceUrl', 'vehicleNumber', 'bankDetails',
    ];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true }
    );
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    res.json({ success: true, driver });
  } catch (err) {
    next(err);
  }
};

export const toggleOnline = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (driver.verificationStatus !== 'verified' && req.body.isOnline) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please complete document verification.',
      });
    }

    driver.isOnline = !!req.body.isOnline;
    await driver.save();
    res.json({ success: true, isOnline: driver.isOnline });
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { lng, lat } = req.body;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      {
        currentLocation: { type: 'Point', coordinates: [lng, lat] },
        lastLocationUpdate: new Date(),
      },
      { new: true }
    );
    res.json({ success: true, driver });
  } catch (err) {
    next(err);
  }
};

export const getEarnings = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const [todayAgg] = await Transaction.aggregate([
      {
        $match: {
          user: driver.user,
          type: 'driver_payout',
          status: 'success',
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const [weekAgg] = await Transaction.aggregate([
      {
        $match: {
          user: driver.user,
          type: 'driver_payout',
          status: 'success',
          createdAt: { $gte: weekStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      walletBalance: driver.walletBalance,
      totalEarnings: driver.totalEarnings,
      totalTrips: driver.totalTrips,
      rating: driver.rating,
      todayEarnings: todayAgg?.total || 0,
      todayTrips: todayAgg?.count || 0,
      weekEarnings: weekAgg?.total || 0,
      weekTrips: weekAgg?.count || 0,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    const { status, limit = 20 } = req.query;
    const query = { driver: driver._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort('-createdAt')
      .limit(+limit)
      .populate('customer', 'name phone profileImage');

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /drivers/active-order — currently in-progress order for this driver
 */
export const getActiveOrder = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const activeStatuses = [
      'driver_assigned', 'driver_arriving', 'arrived_pickup',
      'picked_up', 'in_transit', 'arrived_drop',
    ];
    const order = await Order.findOne({
      driver: driver._id,
      status: { $in: activeStatuses },
    }).populate('customer', 'name phone profileImage');

    res.json({ success: true, order: order || null });
  } catch (err) {
    next(err);
  }
};