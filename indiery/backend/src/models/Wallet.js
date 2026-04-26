import mongoose from 'mongoose';

/**
 * Wallet aggregates current balance and credit coins for a user.
 * Mirrors the user.walletBalance / creditCoins fields, used as a ledger anchor
 * when we need transactional updates separate from the User doc.
 */
const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0 },     // ₹ wallet balance
    creditCoins: { type: Number, default: 0 }, // refund coins (1 coin = ₹1)
    lifetimeCredit: { type: Number, default: 0 },
    lifetimeDebit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Wallet', walletSchema);