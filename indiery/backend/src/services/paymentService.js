import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: env.RAZORPAY.KEY_ID,
      key_secret: env.RAZORPAY.KEY_SECRET,
    });
  }
  return razorpay;
};

export const createRazorpayOrder = async (amountINR, receipt) => {
  try {
    return await getRazorpay().orders.create({
      amount: Math.round(amountINR * 100), // paise
      currency: 'INR',
      receipt,
      payment_capture: 1,
    });
  } catch (err) {
    logger.error(`Razorpay order create error: ${err.message}`);
    throw new Error('Payment initialization failed');
  }
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY.KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};