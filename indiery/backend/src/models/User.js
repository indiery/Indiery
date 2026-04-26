import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    phone: { type: String, sparse: true, index: true },
    role: { type: String, enum: ['individual', 'driver'], required: true },
    profileImage: { type: String, default: null },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    walletBalance: { type: Number, default: 0 },
    creditCoins: { type: Number, default: 0 }, // 1 coin = ₹1
    whatsappOptIn: { type: Boolean, default: false },
    fcmToken: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);