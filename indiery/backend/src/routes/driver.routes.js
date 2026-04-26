import { Router } from 'express';
import {
  getDriverProfile,
  updateDriverProfile,
  toggleOnline,
  updateLocation,
  getEarnings,
  getMyOrders,
  getActiveOrder,
} from '../controllers/driverController.js';
import {
  verifyFirebaseToken,
  requireUser,
  requireRole,
} from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyFirebaseToken, requireUser, requireRole('driver'));

router.get('/me', getDriverProfile);
router.patch('/me', updateDriverProfile);
router.post('/online', toggleOnline);
router.post('/location', updateLocation);
router.get('/earnings', getEarnings);
router.get('/orders', getMyOrders);
router.get('/active-order', getActiveOrder);

export default router;