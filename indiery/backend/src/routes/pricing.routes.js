import { Router } from 'express';
import {
  getEstimate,
  listVehicles,
  listGoodsTypes,
} from '../controllers/pricingController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = Router();

// Public-ish: vehicles & goods are open
router.get('/vehicles', listVehicles);
router.get('/goods', listGoodsTypes);

// Estimate is auth-protected (so we can use customer's coin balance)
router.post('/estimate', verifyFirebaseToken, getEstimate);

export default router;