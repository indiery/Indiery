require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrations = `
-- Users (customers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  firebase_uid VARCHAR(255) UNIQUE,
  coin_balance NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(15) UNIQUE,
  pan VARCHAR(20),
  selfie_url TEXT,
  dl_url TEXT,
  rc_url TEXT,
  insurance_url TEXT,
  bank_account VARCHAR(30),
  bank_ifsc VARCHAR(15),
  bank_name VARCHAR(100),
  vehicle_type VARCHAR(20) CHECK (vehicle_type IN ('bike','mini_truck_500','mini_truck_750')),
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending','approved','rejected')),
  is_online BOOLEAN DEFAULT FALSE,
  current_lat NUMERIC(10,7),
  current_lng NUMERIC(10,7),
  rating NUMERIC(3,2) DEFAULT 5.0,
  wallet_balance NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_type VARCHAR(20) NOT NULL,
  goods_type VARCHAR(100),
  pickup_address TEXT NOT NULL,
  pickup_lat NUMERIC(10,7),
  pickup_lng NUMERIC(10,7),
  drop_address TEXT NOT NULL,
  drop_lat NUMERIC(10,7),
  drop_lng NUMERIC(10,7),
  distance_km NUMERIC(6,2),
  base_fare NUMERIC(8,2),
  total_fare NUMERIC(8,2),
  gst_amount NUMERIC(8,2),
  coins_used NUMERIC(8,2) DEFAULT 0,
  coupon_discount NUMERIC(8,2) DEFAULT 0,
  final_amount NUMERIC(8,2),
  status VARCHAR(30) DEFAULT 'created'
    CHECK (status IN ('created','accepted','pickup','in_transit','delivered','cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending','captured','refunded','failed')),
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  pod_pickup_url TEXT,
  pod_drop_url TEXT,
  is_late BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  pickup_at TIMESTAMPTZ,
  in_transit_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  estimated_delivery_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  order_id UUID REFERENCES orders(id),
  type VARCHAR(30) CHECK (type IN ('coin_credit','coin_debit','driver_earning','driver_penalty','reserve_bonus')),
  amount NUMERIC(10,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC review log
CREATE TABLE IF NOT EXISTS kyc_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  reviewer_id UUID,
  action VARCHAR(20) CHECK (action IN ('approved','rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications log
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  driver_id UUID,
  order_id UUID,
  title VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
`;

pool.query(migrations)
  .then(() => { console.log('✅ Migrations complete'); process.exit(0); })
  .catch(err => { console.error('Migration failed:', err); process.exit(1); });
