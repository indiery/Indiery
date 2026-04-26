import User from '../models/User.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';

/**
 * PATCH /users/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'profileImage', 'address', 'whatsappOptIn', 'fcmToken'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /users/wallet
 */
export const getWallet = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);

    res.json({
      success: true,
      walletBalance: req.user.walletBalance,
      creditCoins: req.user.creditCoins,
      transactions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /users/orders — customer order history
 */
export const getOrderHistory = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { customer: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(+limit)
      .populate('driver', 'ownerName vehicleNumber rating');

    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total, page: +page });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /users/me — soft delete (mark inactive)
 */
export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false, fcmToken: null });
    res.json({ success: true, message: 'Account deactivated' });
  } catch (err) {
    next(err);
  }
};