import client from './client';

export const driverApi = {
  // Get driver profile
  getProfile: async () => {
    const response = await client.get('/drivers/me');
    return response.data;
  },

  // Update driver profile
  updateProfile: async (profileData) => {
    const response = await client.patch('/drivers/me', profileData);
    return response.data;
  },

  // Toggle online status
  toggleOnline: async (isOnline) => {
    const response = await client.post('/drivers/online', { isOnline });
    return response.data;
  },

  // Update driver location
  updateLocation: async (location) => {
    const response = await client.post('/drivers/location', location);
    return response.data;
  },

  // Get earnings
  getEarnings: async (startDate, endDate) => {
    const response = await client.get('/drivers/earnings', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get driver's orders
  getOrders: async (params = {}) => {
    const response = await client.get('/drivers/orders', {
      params,
    });
    return response.data;
  },

  // Get active order
  getActiveOrder: async () => {
    const response = await client.get('/drivers/active-order');
    return response.data;
  },
};

export default driverApi;