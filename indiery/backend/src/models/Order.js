import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },

    tripType: { type: String, enum: ['intracity', 'intercity'], default: 'intracity' },
    vehicleType: {
      type: String,
      enum: ['bike', 'mini_truck_500', 'mini_truck_750'],
      required: true,
    },

    pickup: {
      address: { type: String, required: true },
      coordinates: { type: [Number], required: true },
      contactName: String,
      contactPhone: String,
    },
    drop: {
      address: { type: String, required: true },
      coordinates: { type: [Number], required: true },
      contactName: String,
      contactPhone: String,
    },
    distanceKm: { type: Number, required: true },
    estimatedDurationMin: Number,

    goodsType: {
      type: String,
      enum: ['glass', 'medicine', 'household', 'documents', 'electronics', 'food', 'other'],
      default: 'other',
    },
    goodsDescription: String,
    weight: Number,

    pricing: {
      basePrice: Number,
      distancePrice: Number,
      subtotal: Number,
      gst: Number,
      discount: { type: Number, default: 0 },
      coinDiscount: { type: Number, default: 0 },
      total: Number,
      driverCommission: Number,
      indieryCommission: Number,
      reserveAmount: Number,
    },

    couponCode: String,
    coinsUsed: { type: Number, default: 0 },

    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'wallet'], default: 'upi' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,

    status: {
      type: String,
      enum: [
        'pending', 'driver_assigned', 'driver_arriving',
        'arrived_pickup', 'picked_up', 'in_transit',
        'arrived_drop', 'delivered', 'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        location: [Number],
      },
    ],

    eta: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    promisedDeliveryTime: Date,
    isDelayed: { type: Boolean, default: false },

    podPickupImage: String,
    podDropImage: String,

    refundAmount: { type: Number, default: 0 },
    refundProcessed: { type: Boolean, default: false },

    pickupOtp: String,
    cancelledBy: { type: String, enum: ['customer', 'driver', 'system'] },
    cancellationReason: String,
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ driver: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);