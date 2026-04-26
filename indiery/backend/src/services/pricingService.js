import { COMMISSION, GST_PERCENT, PRICING } from '../utils/constants.js';
import { round2 } from '../utils/helpers.js';

/**
 * Intracity price per spec:
 *   bike: ₹40 first km, then ₹10/km
 *   mini_truck_500: ₹200 first km, then ₹20/km
 *   mini_truck_750: ₹300 first km, then ₹30/km
 *
 * Examples (bike):
 *   1km -> 40
 *   2km -> 40 + 10 = 50
 *   3km -> 40 + 20 = 60
 */
export const calculateIntracityPrice = (vehicleType, distanceKm) => {
  const config = PRICING.intracity[vehicleType];
  if (!config) throw new Error(`Invalid vehicle type: ${vehicleType}`);

  const dist = Math.max(distanceKm, 0.1);
  const basePrice = config.basePrice;
  const extraKm = Math.max(0, Math.ceil(dist) - 1);
  const distancePrice = extraKm * config.perKm;

  return { basePrice, distancePrice, perKm: config.perKm };
};

/**
 * Intercity price per spec (Full Truck Load):
 *   truck_2_tonne: ₹35 per km (up to 2 tonnes)
 *   truck_3_10_tonne: ₹40 per km (3-10 tonnes)
 */
export const calculateIntercityPrice = (vehicleType, distanceKm) => {
  const config = PRICING.intercity[vehicleType];
  if (!config) throw new Error(`Invalid intercity vehicle type: ${vehicleType}`);

  const dist = Math.max(distanceKm, 1);
  const totalPrice = round2(dist * config.pricePerKm);

  return {
    basePrice: 0,
    distancePrice: totalPrice,
    perKm: config.pricePerKm,
    totalPrice,
  };
};

/**
 * Build full price breakdown including GST, discounts, and commission split.
 */
export const buildPriceBreakdown = ({
  vehicleType,
  distanceKm,
  deliveryType = 'intracity', // 'intracity' or 'intercity'
  couponDiscount = 0,
  coinsUsed = 0,
}) => {
  let basePrice, distancePrice, perKm;

  if (deliveryType === 'intercity') {
    const intercity = calculateIntercityPrice(vehicleType, distanceKm);
    basePrice = intercity.basePrice;
    distancePrice = intercity.distancePrice;
    perKm = intercity.perKm;
  } else {
    const intracity = calculateIntracityPrice(vehicleType, distanceKm);
    basePrice = intracity.basePrice;
    distancePrice = intracity.distancePrice;
    perKm = intracity.perKm;
  }

  const subtotal = basePrice + distancePrice;

  // Coin usage capped at 50% of subtotal
  const maxCoinDiscount = Math.floor(subtotal * 0.5);
  const coinDiscount = Math.min(coinsUsed, maxCoinDiscount);

  const afterDiscount = Math.max(0, subtotal - couponDiscount - coinDiscount);
  const gst = round2(afterDiscount * (GST_PERCENT / 100));
  const total = round2(afterDiscount + gst);

  // Commission split (on subtotal after discounts, before tax)
  const driverCommission = round2(afterDiscount * COMMISSION.DRIVER);
  const indieryCommission = round2(afterDiscount * COMMISSION.INDIERY);
  const reserveAmount = round2(afterDiscount * COMMISSION.RESERVE);

  return {
    basePrice,
    distancePrice,
    perKm,
    subtotal,
    discount: couponDiscount,
    coinDiscount,
    gst,
    total,
    driverCommission,
    indieryCommission,
    reserveAmount,
    distanceKm: round2(distanceKm),
    deliveryType,
  };
};

/**
 * Refund on delay (per spec):
 *   5% deducted from driver's 80%
 *   5% deducted from Indiery's 15%
 *   5% reserve fully transferred to customer
 *
 * Example: subtotal = ₹100
 *   ₹4 (5% of ₹80) + ₹0.75 (5% of ₹15) + ₹5 reserve = ₹9.75 (~10%)
 */
export const calculateDelayRefund = (subtotal) => {
  const driverComm = subtotal * COMMISSION.DRIVER;
  const indieryComm = subtotal * COMMISSION.INDIERY;
  const reserve = subtotal * COMMISSION.RESERVE;

  const driverDeduct = round2(driverComm * 0.05);
  const indieryDeduct = round2(indieryComm * 0.05);

  const refund = round2(driverDeduct + indieryDeduct + reserve);
  const finalDriver = round2(driverComm - driverDeduct);
  const finalIndiery = round2(indieryComm - indieryDeduct);

  return { refund, finalDriver, finalIndiery };
};

/**
 * On-time payout: reserve goes to driver as reward.
 * Driver gets 80% + 5% reserve = 85% of subtotal.
 */
export const calculateOnTimePayout = (subtotal) => {
  const driverComm = subtotal * COMMISSION.DRIVER;
  const reserve = subtotal * COMMISSION.RESERVE;
  return {
    driverPayout: round2(driverComm + reserve),
    reserveBonus: round2(reserve),
    indieryPayout: round2(subtotal * COMMISSION.INDIERY),
  };
};