import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
} from '../services/paymentService.js';
import env from '../config/env.js';

/**
 * POST /payments/create
 * body: { orderId }
 * Creates a Razorpay order and returns the order id + key for the client SDK.
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ orderId });
    if (!order || !order.customer.equals(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Already paid' });
    }

    const rzp = await createRazorpayOrder(order.pricing.total, order.orderId);
    order.razorpayOrderId = rzp.id;
    await order.save();

    res.json({
      success: true,
      razorpayOrderId: rzp.id,
      amount: rzp.amount,
      currency: rzp.currency,
      keyId: env.RAZORPAY.KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /payments/verify
 * body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const valid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    await Transaction.create({
      user: req.user._id,
      order: order._id,
      type: 'payment',
      amount: order.pricing.total,
      status: 'success',
      razorpayPaymentId,
      razorpayOrderId,
      description: `Payment for ${orderId}`,
    });

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /payments/webhook — Razorpay webhook receiver
 * Configure on Razorpay dashboard with the same secret.
 */
export const razorpayWebhook = async (req, res) => {
  // Lightweight handler — sign verification recommended in production
  const event = req.body?.event;
  // For now, just acknowledge. Extend to handle refunds, payment.failed, etc.
  res.json({ success: true, received: event });
};