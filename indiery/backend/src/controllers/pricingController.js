import { getDistanceMatrix } from '../services/mapService.js';
import { buildPriceBreakdown } from '../services/pricingService.js';
import { GOODS_TYPES, NON_DELIVERABLE_GOODS, PRICING } from '../utils/constants.js';

/**
 * POST /pricing/estimate
 * body: { vehicleType, pickup: {coordinates}, drop: {coordinates}, deliveryType?, couponDiscount?, coinsUsed? }
 */
export const getEstimate = async (req, res, next) => {
  try {
    const { vehicleType, pickup, drop, deliveryType = 'intracity', couponDiscount = 0, coinsUsed = 0 } = req.body;

    if (!vehicleType || !pickup || !drop) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (!Array.isArray(pickup.coordinates) || !Array.isArray(drop.coordinates)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const { distanceKm, durationMin } = await getDistanceMatrix(
      pickup.coordinates,
      drop.coordinates
    );

    const breakdown = buildPriceBreakdown({
      vehicleType,
      distanceKm,
      deliveryType,
      couponDiscount,
      coinsUsed,
    });

    res.json({
      success: true,
      estimate: {
        ...breakdown,
        distanceKm,
        estimatedDurationMin: durationMin,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /pricing/vehicles — list of supported vehicles + pricing
 */
export const listVehicles = async (req, res, next) => {
  try {
    const { deliveryType = 'intracity' } = req.query;
    
    const pricingConfig = deliveryType === 'intercity' ? PRICING.intercity : PRICING.intracity;
    
    const vehicles = Object.entries(pricingConfig).map(([code, cfg]) => {
      const labels = {
        bike: 'Bike (up to 20kg)',
        mini_truck_500: 'Mini Truck (up to 500kg)',
        mini_truck_750: 'Mini Truck (up to 750kg)',
        truck_2_tonne: 'Truck (up to 2 tonnes)',
        truck_3_10_tonne: 'Truck (3-10 tonnes)',
      };
      
      return {
        code,
        label: labels[code] || code,
        weightLimitKg: cfg.weightLimitKg || cfg.maxWeightKg,
        basePrice: cfg.basePrice || 0,
        perKm: cfg.perKm || cfg.pricePerKm,
        deliveryType,
      };
    });
    
    res.json({ success: true, vehicles, deliveryType });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /pricing/goods — list of allowed goods types and non-deliverable items
 */
export const listGoodsTypes = async (req, res) => {
  res.json({
    success: true,
    allowed: GOODS_TYPES,
    notAllowed: NON_DELIVERABLE_GOODS,
  });
};