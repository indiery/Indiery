const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { updateDriverLocation, getDriverLocation } = require('../services/driverMatching');

// GET /api/tracking/:driverId — get driver's current location
router.get('/:driverId', verifyFirebaseToken, async (req, res) => {
  const loc = await getDriverLocation(req.params.driverId);
  if (!loc) return res.status(404).json({ error: 'Location not found' });
  res.json(loc);
});

// POST /api/tracking/update — driver pushes their location (REST fallback from WebSocket)
router.post('/update', verifyFirebaseToken, async (req, res) => {
  const { driverId, lat, lng } = req.body;
  await updateDriverLocation(driverId, lat, lng);
  res.json({ ok: true });
});

module.exports = router;
