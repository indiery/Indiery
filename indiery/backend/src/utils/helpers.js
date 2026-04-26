import crypto from 'crypto';

export const generateOrderId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `IND${ts}${rand}`;
};

export const generateOTP = (length = 4) => {
  let otp = '';
  for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
  return otp;
};

export const generateReferralCode = (name = '') => {
  const prefix = name.replace(/\s+/g, '').slice(0, 4).toUpperCase() || 'IND';
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${rand}`;
};

// Haversine distance between two [lng, lat] coords (km)
export const haversineKm = (a, b) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export const round2 = (n) => Math.round(n * 100) / 100;