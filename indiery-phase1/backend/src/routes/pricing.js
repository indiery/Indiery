const router = require('express').Router();
const { calculateFare, VEHICLE_CONFIG } = require('../services/pricing');

// GET /api/pricing/estimate?vehicleType=bike&distanceKm=5&coinsUsed=0&couponDiscount=0
router.get('/estimate', (req, res) => {
  const { vehicleType, distanceKm, coinsUsed = 0, couponDiscount = 0 } = req.query;
  if (!vehicleType || !distanceKm) return res.status(400).json({ error: 'vehicleType and distanceKm required' });

  try {
    const fare = calculateFare(vehicleType, parseFloat(distanceKm), parseFloat(coinsUsed), parseFloat(couponDiscount));
    res.json(fare);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/pricing/vehicles — list all vehicle options
router.get('/vehicles', (req, res) => {
  res.json(VEHICLE_CONFIG);
});

module.exports = router;
