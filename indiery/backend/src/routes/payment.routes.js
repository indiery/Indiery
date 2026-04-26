import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  razorpayWebhook,
} from '../controllers/paymentController.js';
import {
  verifyFirebaseToken,
  requireUser,
  requireRole,
} from '../middleware/authMiddleware.js';

const router = Router();

// Webhook is unauthenticated (Razorpay will call it)
router.post('/webhook', razorpayWebhook);

router.use(verifyFirebaseToken, requireUser, requireRole('individual'));

router.post('/create', createPaymentOrder);
router.post('/verify', verifyPayment);

export default router;