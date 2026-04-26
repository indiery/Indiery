import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Wallet from '../models/Wallet.js';
import { generateReferralCode } from '../utils/helpers.js';

/**
 * POST /auth/register
 * Body: { role, name?, whatsappOptIn?, fcmToken? }
 * Header: Authorization: Bearer <Firebase ID Token>
 */
export const registerOrLogin = async (req, res, next) => {
  try {
    const { uid, email, phone_number, name: fbName, picture } = req.firebaseUser;
    const { role, name, whatsappOptIn, fcmToken } = req.body;

    if (!['individual', 'driver'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      user.lastLogin = new Date();
      if (fcmToken) user.fcmToken = fcmToken;
      
      // Update role if provided and different
      if (role && role !== user.role) {
        user.role = role;
        
        // Auto-create driver profile if switching to driver
        if (role === 'driver') {
          const existingDriver = await Driver.findOne({ user: user._id });
          if (!existingDriver) {
            await Driver.create({
              user: user._id,
              firebaseUid: uid,
              ownerName: user.name || 'New Driver',
              city: 'Unknown',
              vehicleType: 'bike',
              referralCode: generateReferralCode(user.name),
            });
          }
        }
      }
      
      await user.save();
      return res.json({ success: true, user, isNew: false });
    }

    user = await User.create({
      firebaseUid: uid,
      email: email || null,
      phone: phone_number || null,
      name: name || fbName || '',
      profileImage: picture || null,
      role,
      whatsappOptIn: !!whatsappOptIn,
      lastLogin: new Date(),
      fcmToken: fcmToken || null,
    });

    // Create wallet
    await Wallet.create({ user: user._id });

    // Auto-create driver profile shell if registering as driver
    if (role === 'driver') {
      await Driver.create({
        user: user._id,
        firebaseUid: uid,
        ownerName: user.name || 'New Driver',
        city: 'Unknown',
        vehicleType: 'bike',
        referralCode: generateReferralCode(user.name),
      });
    }

    res.status(201).json({ success: true, user, isNew: true });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not registered' });
    }
    const extra = {};
    if (req.user.role === 'driver') {
      extra.driver = await Driver.findOne({ user: req.user._id });
    }
    res.json({ success: true, user: req.user, ...extra });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.fcmToken = null;
      await req.user.save();
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};