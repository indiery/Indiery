import { getDistanceMatrix, geocodeAddress } from '../services/mapService.js';
import { buildPriceBreakdown } from '../services/pricingService.js';
import { GOODS_TYPES, NON_DELIVERABLE_GOODS, PRICING } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * POST /pricing/estimate
 * body: { vehicleType, pickup: {coordinates}, drop: {coordinates}, deliveryType?, couponDiscount?, coinsUsed? }
 */
export const getEstimate = async (req, res, next) => {
  try {
    const { vehicleType, pickup, drop, deliveryType = 'intracity', couponDiscount = 0, coinsUsed = 0 } = req.body;

    logger.info(`Estimate request: vehicleType=${vehicleType}, deliveryType=${deliveryType}, pickup=${JSON.stringify(pickup)}, drop=${JSON.stringify(drop)}`);

    if (!vehicleType || !pickup || !drop) {
      return res.status(400).json({ success: false, message: 'Missing required fields: vehicleType, pickup, drop' });
    }
    if (!Array.isArray(pickup.coordinates) || !Array.isArray(drop.coordinates)) {
      logger.warn(`Invalid coordinates: pickup.coordinates=${JSON.stringify(pickup.coordinates)}, drop.coordinates=${JSON.stringify(drop.coordinates)}`);
      return res.status(400).json({ success: false, message: 'Invalid coordinates: must be arrays [lng, lat]' });
    }

    // Ensure deliveryType is valid
    const validDeliveryType = (deliveryType === 'intercity' || deliveryType === 'intracity') ? deliveryType : 'intracity';
    logger.info(`Using deliveryType: ${validDeliveryType}`);

    const { distanceKm, durationMin } = await getDistanceMatrix(
      pickup.coordinates,
      drop.coordinates
    );

    logger.info(`Distance calculated: ${distanceKm} km, duration: ${durationMin} min`);

    const breakdown = buildPriceBreakdown({
      vehicleType,
      distanceKm,
      deliveryType: validDeliveryType,
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

/**
 * POST /pricing/geocode — convert address to coordinates
 * body: { address: string }
 */
export const geocode = async (req, res, next) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address is required' });
    }
    const coordinates = await geocodeAddress(address);
    res.json({
      success: true,
      address,
      coordinates, // [lng, lat]
    });
  } catch (err) {
    logger.error(`Geocode endpoint error: ${err.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to geocode address. Please try a more specific address.' 
    });
  }
};