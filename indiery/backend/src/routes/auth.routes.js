import { Router } from 'express';
import { registerOrLogin, getMe, logout, completeRegistration } from '../controllers/authController.js';
import { verifyFirebaseToken, requireUser } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', verifyFirebaseToken, registerOrLogin);
router.post('/complete-registration', verifyFirebaseToken, completeRegistration);
router.get('/me', verifyFirebaseToken, requireUser, getMe);
router.post('/logout', verifyFirebaseToken, requireUser, logout);

export default router;