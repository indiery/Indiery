import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Transaction from '../models/Transaction.js';
import {
  calculateDelayRefund,
  calculateOnTimePayout,
} from './pricingService.js';
import logger from '../utils/logger.js';

/**
 * Settle an order on delivery — process payout (on-time) or refund (delayed).
 * Refund is credited to customer as coins (1 coin = ₹1).
 */
export const settleOrder = async (order, driver) => {
  const subtotal = order.pricing.subtotal;

  if (order.isDelayed) {
    const { refund, finalDriver } = calculateDelayRefund(subtotal);
    order.refundAmount = refund;
    order.refundProcessed = true;

    await User.findByIdAndUpdate(order.customer, { $inc: { creditCoins: refund } });

    driver.walletBalance += finalDriver;
    driver.totalEarnings += finalDriver;
    driver.totalTrips += 1;
    await driver.save();

    await Transaction.create([
      {
        user: order.customer,
        order: order._id,
        type: 'coin_credit',
        amount: refund,
        status: 'success',
        description: 'Late delivery refund (coins)',
      },
      {
        user: driver.user,
        order: order._id,
        type: 'driver_payout',
        amount: finalDriver,
        status: 'success',
        description: 'Trip earnings (delayed)',
      },
    ]);

    logger.info(`Order ${order.orderId} delayed. Refund: ₹${refund}, Driver: ₹${finalDriver}`);
    return { delayed: true, refund, driverPayout: finalDriver };
  }

  // On-time
  const { driverPayout, reserveBonus } = calculateOnTimePayout(subtotal);
  driver.walletBalance += driverPayout;
  driver.totalEarnings += driverPayout;
  driver.totalTrips += 1;
  await driver.save();

  await Transaction.create({
    user: driver.user,
    order: order._id,
    type: 'driver_payout',
    amount: driverPayout,
    status: 'success',
    description: `Trip earnings (on-time, +₹${reserveBonus} reward)`,
  });

  logger.info(`Order ${order.orderId} on-time. Driver: ₹${driverPayout}`);
  return { delayed: false, driverPayout, reserveBonus };
};

/**
 * On cancel, return coins used to customer.
 */
export const refundCoinsOnCancel = async (order) => {
  if (order.coinsUsed > 0) {
    await User.findByIdAndUpdate(order.customer, {
      $inc: { creditCoins: order.coinsUsed },
    });
    await Transaction.create({
      user: order.customer,
      order: order._id,
      type: 'coin_credit',
      amount: order.coinsUsed,
      status: 'success',
      description: 'Coins refunded on cancellation',
    });
  }
};