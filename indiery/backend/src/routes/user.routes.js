import { Router } from 'express';
import {
  updateProfile,
  getWallet,
  getOrderHistory,
  deleteAccount,
} from '../controllers/userController.js';
import {
  verifyFirebaseToken,
  requireUser,
  requireRole,
} from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyFirebaseToken, requireUser);

router.patch('/profile', updateProfile);
router.get('/wallet', getWallet);
router.get('/orders', requireRole('individual'), getOrderHistory);
router.delete('/me', deleteAccount);

export default router;