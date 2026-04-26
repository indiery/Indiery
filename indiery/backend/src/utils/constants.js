export const VEHICLE_TYPES = {
  // Intracity
  BIKE: 'bike',
  MINI_TRUCK_500: 'mini_truck_500',
  MINI_TRUCK_750: 'mini_truck_750',
  // Intercity - Full Truck Load
  TRUCK_2_TONNE: 'truck_2_tonne',   // up to 2 tonnes - ₹35/km
  TRUCK_3_10_TONNE: 'truck_3_10_tonne', // 3-10 tonnes - ₹40/km
};

// Pricing (intracity) — per spec
export const PRICING = {
  intracity: {
    bike: { basePrice: 40, perKm: 10, weightLimitKg: 20 },
    mini_truck_500: { basePrice: 200, perKm: 20, weightLimitKg: 500 },
    mini_truck_750: { basePrice: 300, perKm: 30, weightLimitKg: 750 },
  },
  // Intercity - Full Truck Load — per spec
  intercity: {
    truck_2_tonne: { pricePerKm: 35, weightLimitKg: 2000 },   // up to 2 tonnes
    truck_3_10_tonne: { pricePerKm: 40, weightLimitKg: 10000 }, // 3-10 tonnes
  },
};

// Commission split (per spec)
export const COMMISSION = {
  DRIVER: 0.80,    // 80%
  INDIERY: 0.15,   // 15%
  RESERVE: 0.05,   // 5%
};

export const REFUND_DEDUCTION = 0.05;
export const GST_PERCENT = 18;

export const ORDER_STATUS = {
  PENDING: 'pending',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_ARRIVING: 'driver_arriving',
  ARRIVED_PICKUP: 'arrived_pickup',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  ARRIVED_DROP: 'arrived_drop',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const NON_DELIVERABLE_GOODS = [
  'Illegal items',
  'Alcohol & drugs',
  'Hazardous chemicals',
  'Explosives',
  'Live pets or humans',
  'Firearms & ammunition',
  'Cash & jewelry above ₹50,000',
  'Toxic substances',
];

export const GOODS_TYPES = [
  'glass', 'medicine', 'household', 'documents',
  'electronics', 'food', 'other',
];

export const ROLES = {
  INDIVIDUAL: 'individual',
  DRIVER: 'driver',
};