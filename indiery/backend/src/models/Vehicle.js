import mongoose from 'mongoose';

/**
 * Vehicle catalog — used to render the vehicle selector in the customer app.
 * Seed this collection on first deploy or fall back to constants.
 */
const vehicleSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      enum: ['bike', 'mini_truck_500', 'mini_truck_750'],
      required: true,
      unique: true,
    },
    label: { type: String, required: true },         // "Bike"
    description: String,                              // "Up to 20 kg"
    weightLimitKg: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    perKm: { type: Number, required: true },
    iconUrl: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);