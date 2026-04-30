import client from './client';

export const pricingApi = {
  // Geocode address to coordinates
  geocode: async (address) => {
    const response = await client.post('/pricing/geocode', { address });
    return response.data;
  },

  // Get price estimate
  getEstimate: async (pickup, drop, vehicleType, deliveryType = 'intracity', goodsType, weight) => {
    const response = await client.post('/pricing/estimate', {
      pickup,
      drop,
      vehicleType,
      deliveryType,
      goodsType,
      weight,
    });
    return response.data;
  },

  // List available vehicles
  getVehicles: async (deliveryType = 'intracity') => {
    const response = await client.get(`/pricing/vehicles?deliveryType=${deliveryType}`);
    return response.data;
  },

  // List goods types
  getGoodsTypes: async () => {
    const response = await client.get('/pricing/goods');
    return response.data;
  },
};

export default pricingApi;