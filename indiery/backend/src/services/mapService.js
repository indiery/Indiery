import axios from 'axios';
import { MAPPLS_CLIENT_ID, MAPPLS_CLIENT_SECRET, MAPPLS_REST_KEY } from '../config/env.js';
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
        client_id: MAPPLS_CLIENT_ID,
        client_secret: MAPPLS_CLIENT_SECRET,
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
  logger.info(`getDistanceMatrix called with origin=${JSON.stringify(origin)}, destination=${JSON.stringify(destination)}`);
  
  try {
    const token = await getMapplsToken();
    const url = `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_REST_KEY}/distance_matrix/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });

    logger.info(`Mappls response: ${JSON.stringify(res.data)}`);
    
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
    logger.info(`Haversine fallback distance: ${distanceKm} km`);
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
    logger.warn(`Mappls geocode failed, falling back to Nominatim: ${err.message}`);
    // Fallback to Nominatim (OpenStreetMap) - free geocoding
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'IndieryApp/1.0' },
        timeout: 10000,
      });
      if (res.data && res.data.length > 0) {
        return [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)];
      }
      throw new Error('No results found');
    } catch (fallbackErr) {
      logger.error(`Nominatim fallback also failed: ${fallbackErr.message}`);
      throw new Error('Address geocoding failed');
    }
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