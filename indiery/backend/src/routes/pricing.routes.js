import { Router } from 'express';
import {
  getEstimate,
  listVehicles,
  listGoodsTypes,
  geocode,
} from '../controllers/pricingController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = Router();

// Public-ish: vehicles & goods are open
router.get('/vehicles', listVehicles);
router.get('/goods', listGoodsTypes);

// Geocode address to coordinates (public)
router.post('/geocode', geocode);

// Estimate is temporarily public for testing
router.post('/estimate', getEstimate);

export default router;