/**
 * Indiery Pricing Engine — Phase 1
 * Formula: Price = Base Fare + (distance - 1) * per_km_rate
 * Minimum charge = Base Fare (covers first 1 km)
 */

const VEHICLE_CONFIG = {
  bike: {
    label: 'Two-Wheeler (Bike)',
    maxWeight: 20,
    baseFare: 40,
    perKmRate: 10,
  },
  mini_truck_500: {
    label: 'Mini Truck (≤500 kg)',
    maxWeight: 500,
    baseFare: 200,
    perKmRate: 20,
  },
  mini_truck_750: {
    label: 'Mini Truck (≤750 kg)',
    maxWeight: 750,
    baseFare: 300,
    perKmRate: 30,
  },
};

const GST_RATE = 0.18;

/**
 * Calculate fare for a given vehicle type and distance.
 * @param {string} vehicleType - 'bike' | 'mini_truck_500' | 'mini_truck_750'
 * @param {number} distanceKm
 * @param {number} coinsUsed - Indiery Coins to deduct (1 coin = ₹1)
 * @param {number} couponDiscount - flat discount in ₹
 * @returns {object} fare breakdown
 */
function calculateFare(vehicleType, distanceKm, coinsUsed = 0, couponDiscount = 0) {
  const config = VEHICLE_CONFIG[vehicleType];
  if (!config) throw new Error(`Unknown vehicle type: ${vehicleType}`);

  const distance = Math.max(distanceKm, 1);
  const baseFare = config.baseFare;
  const distanceCharge = (distance - 1) * config.perKmRate;
  const subtotal = baseFare + distanceCharge;

  const gstAmount = parseFloat((subtotal * GST_RATE).toFixed(2));
  const totalBeforeDiscount = parseFloat((subtotal + gstAmount).toFixed(2));

  const totalDiscount = Math.min(coinsUsed + couponDiscount, totalBeforeDiscount);
  const finalAmount = parseFloat((totalBeforeDiscount - totalDiscount).toFixed(2));

  return {
    vehicleType,
    distanceKm: distance,
    baseFare,
    distanceCharge: parseFloat(distanceCharge.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    gstAmount,
    totalBeforeDiscount,
    coinsUsed,
    couponDiscount,
    finalAmount,
  };
}

/**
 * Commission split on every order.
 * Driver: 80%, Indiery: 15%, Reserve: 5%
 */
function calculateCommission(orderAmount) {
  const driverShare = parseFloat((orderAmount * 0.80).toFixed(2));
  const indieryShare = parseFloat((orderAmount * 0.15).toFixed(2));
  const reserve = parseFloat((orderAmount * 0.05).toFixed(2));
  return { driverShare, indieryShare, reserve };
}

/**
 * On-time delivery: driver gets reserve bonus.
 * Late delivery: driver penalised, customer gets Coin refund.
 */
function settleLateOrOnTime(orderAmount, isLate) {
  const { driverShare, indieryShare, reserve } = calculateCommission(orderAmount);

  if (!isLate) {
    return {
      isLate: false,
      driverEarning: parseFloat((driverShare + reserve).toFixed(2)), // 85%
      indieryEarning: indieryShare,
      customerCoinRefund: 0,
    };
  }

  // Late: driver loses 5% of their 80%, Indiery loses 5% of their 15%
  const driverPenalty = parseFloat((driverShare * 0.05).toFixed(2));
  const indieryPenalty = parseFloat((indieryShare * 0.05).toFixed(2));
  const customerCoinRefund = parseFloat((driverPenalty + indieryPenalty).toFixed(2));

  return {
    isLate: true,
    driverEarning: parseFloat((driverShare - driverPenalty).toFixed(2)),
    indieryEarning: parseFloat((indieryShare - indieryPenalty).toFixed(2)),
    customerCoinRefund,
  };
}

module.exports = { VEHICLE_CONFIG, calculateFare, calculateCommission, settleLateOrOnTime };
