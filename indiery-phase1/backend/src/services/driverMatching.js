/**
 * Driver Matching Service — Phase 1
 * Simple nearest-available-driver algorithm using PostgreSQL + Redis location cache.
 */

const { getPool } = require('../db/pool');
const { getRedis } = require('../config/redis');

const SEARCH_RADIUS_KM = 10;

/**
 * Find the nearest available online driver for a given vehicle type and pickup location.
 */
async function findNearestDriver(vehicleType, pickupLat, pickupLng) {
  const db = getPool();

  // Use Haversine formula in SQL
  const { rows } = await db.query(
    `SELECT id, name, phone, current_lat, current_lng, rating,
       ( 6371 * acos(
           cos(radians($1)) * cos(radians(current_lat))
           * cos(radians(current_lng) - radians($2))
           + sin(radians($1)) * sin(radians(current_lat))
         )
       ) AS distance_km
     FROM drivers
     WHERE is_online = TRUE
       AND kyc_status = 'approved'
       AND vehicle_type = $3
       AND current_lat IS NOT NULL
       AND current_lng IS NOT NULL
     HAVING ( 6371 * acos(
           cos(radians($1)) * cos(radians(current_lat))
           * cos(radians(current_lng) - radians($2))
           + sin(radians($1)) * sin(radians(current_lat))
         )
       ) <= $4
     ORDER BY distance_km ASC
     LIMIT 10`,
    [pickupLat, pickupLng, vehicleType, SEARCH_RADIUS_KM]
  );

  if (rows.length === 0) return null;

  // Return nearest driver
  return rows[0];
}

/**
 * Update driver location in Redis (fast cache) and PostgreSQL (persistent).
 */
async function updateDriverLocation(driverId, lat, lng) {
  const redis = getRedis();
  const db = getPool();

  // Cache in Redis with 60s expiry
  await redis.setEx(`driver:location:${driverId}`, 60, JSON.stringify({ lat, lng, ts: Date.now() }));

  // Update DB
  await db.query(
    'UPDATE drivers SET current_lat = $1, current_lng = $2 WHERE id = $3',
    [lat, lng, driverId]
  );
}

/**
 * Get driver location from Redis cache, fallback to DB.
 */
async function getDriverLocation(driverId) {
  const redis = getRedis();
  const cached = await redis.get(`driver:location:${driverId}`);
  if (cached) return JSON.parse(cached);

  const db = getPool();
  const { rows } = await db.query(
    'SELECT current_lat AS lat, current_lng AS lng FROM drivers WHERE id = $1',
    [driverId]
  );
  return rows[0] || null;
}

module.exports = { findNearestDriver, updateDriverLocation, getDriverLocation };
