import axios from 'axios';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import { haversineKm, round2 } from '../utils/helpers.js';

let cachedToken = null;
let tokenExpiry = 0;

const getMapplsToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  try {
    const res = await axios.post(
      'https://outpost.mappls.com/api/security/oauth/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: env.MAPPLS.CLIENT_ID,
        client_secret: env.MAPPLS.CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    cachedToken = res.data.access_token;
    tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
    return cachedToken;
  } catch (err) {
    logger.error(`Mappls token error: ${err.message}`);
    throw new Error('Failed to authenticate with map service');
  }
};

/**
 * Distance + duration. Falls back to haversine if Mappls fails.
 */
export const getDistanceMatrix = async (origin, destination) => {
  try {
    const token = await getMapplsToken();
    const url = `https://apis.mappls.com/advancedmaps/v1/${env.MAPPLS.REST_KEY}/distance_matrix/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });

    const result = res.data?.results;
    if (result?.distances && result?.durations) {
      return {
        distanceKm: round2(result.distances[0][1] / 1000),
        durationMin: Math.round(result.durations[0][1] / 60),
        source: 'mappls',
      };
    }
    throw new Error('Invalid Mappls response');
  } catch (err) {
    logger.warn(`Mappls failed, falling back to haversine: ${err.message}`);
    const distanceKm = round2(haversineKm(origin, destination));
    return {
      distanceKm,
      durationMin: Math.ceil((distanceKm / 25) * 60),
      source: 'haversine',
    };
  }
};

export const geocodeAddress = async (address) => {
  try {
    const token = await getMapplsToken();
    const url = `https://atlas.mappls.com/api/places/geocode?address=${encodeURIComponent(address)}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });
    const r = res.data?.copResults;
    if (r?.latitude && r?.longitude) return [r.longitude, r.latitude];
    throw new Error('No results found');
  } catch (err) {
    logger.error(`Geocode error: ${err.message}`);
    throw new Error('Address geocoding failed');
  }
};

export const reverseGeocode = async (lng, lat) => {
  try {
    const url = `https://apis.mappls.com/advancedmaps/v1/${env.MAPPLS.REST_KEY}/rev_geocode?lng=${lng}&lat=${lat}`;
    const res = await axios.get(url, { timeout: 8000 });
    return res.data?.results?.[0]?.formatted_address || '';
  } catch (err) {
    logger.error(`Reverse geocode error: ${err.message}`);
    return '';
  }
};