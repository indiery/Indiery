import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  acceptOrder,
  updateStatus,
  verifyPickupOtp,
  uploadPOD,
  cancelOrder,
  rateOrder,
  getAvailableOrders,
} from '../controllers/orderController.js';
import {
  getOrderTracking,
  getNearbyDrivers,
} from '../controllers/trackingController.js';
import {
  verifyFirebaseToken,
  requireUser,
  requireRole,
} from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyFirebaseToken, requireUser);

// Customer
router.post('/', requireRole('individual'), createOrder);
router.get('/my-orders', requireRole('individual'), getMyOrders);
router.post('/:orderId/cancel', cancelOrder); // both roles can cancel
router.post('/:orderId/rate', requireRole('individual'), rateOrder);

// Driver
router.get('/available', requireRole('driver'), getAvailableOrders);
router.post('/:orderId/accept', requireRole('driver'), acceptOrder);
router.post('/:orderId/status', requireRole('driver'), updateStatus);
router.post('/:orderId/pickup-otp', requireRole('driver'), verifyPickupOtp);
router.post('/:orderId/pod', requireRole('driver'), uploadPOD);

// Shared
router.get('/nearby-drivers', getNearbyDrivers);
router.get('/:orderId', getOrder);
router.get('/:orderId/track', getOrderTracking);

export default router;