import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firebaseUid: { type: String, required: true, unique: true, index: true },

    // Owner
    ownerName: { type: String, required: true },
    city: { type: String, required: true },
    pan: { type: String, uppercase: true, trim: true },
    selfieUrl: String,

    // Vehicle
    vehicleType: {
      type: String,
      enum: ['bike', 'mini_truck_500', 'mini_truck_750'],
      required: true,
    },
    drivingLicenceUrl: String,
    vehicleRegistrationUrl: String,
    vehicleInsuranceUrl: String,
    vehicleNumber: { type: String, uppercase: true, trim: true },

    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationNotes: String,
    verifiedAt: Date,

    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    lastLocationUpdate: Date,

    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalTrips: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    ratingCount: { type: Number, default: 0 },

    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
  },
  { timestamps: true }
);

driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ isOnline: 1, verificationStatus: 1 });

export default mongoose.model('Driver', driverSchema);