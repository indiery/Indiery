import mongoose from 'mongoose';

/**
 * Transaction records all wallet movements (deposits, payments, refunds).
 */
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'payment', 'refund', 'withdrawal'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    paymentId: { type: String }, // Razorpay payment ID
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);