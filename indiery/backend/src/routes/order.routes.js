import { Router } from 'express';
import {
  createOrder,
  getOrder,
  acceptOrder,
  updateStatus,
  verifyPickupOtp,
  uploadPOD,
  cancelOrder,
  rateOrder,
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
router.post('/:orderId/cancel', cancelOrder); // both roles can cancel
router.post('/:orderId/rate', requireRole('individual'), rateOrder);

// Driver
router.post('/:orderId/accept', requireRole('driver'), acceptOrder);
router.post('/:orderId/status', requireRole('driver'), updateStatus);
router.post('/:orderId/pickup-otp', requireRole('driver'), verifyPickupOtp);
router.post('/:orderId/pod', requireRole('driver'), uploadPOD);

// Shared
router.get('/nearby-drivers', getNearbyDrivers);
router.get('/:orderId', getOrder);
router.get('/:orderId/track', getOrderTracking);

export default router;