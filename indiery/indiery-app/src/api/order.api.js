import client from './client';

export const orderApi = {
  // Create a new order (customer)
  createOrder: async (orderData) => {
    const response = await client.post('/orders', orderData);
    return response.data;
  },

  // Get order by ID
  getOrder: async (orderId) => {
    const response = await client.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get nearby drivers
  getNearbyDrivers: async (pickupLocation) => {
    const response = await client.get('/orders/nearby-drivers', {
      params: { lat: pickupLocation.lat, lng: pickupLocation.lng },
    });
    return response.data;
  },

  // Accept order (driver)
  acceptOrder: async (orderId) => {
    const response = await client.post(`/orders/${orderId}/accept`);
    return response.data;
  },

  // Update order status (driver)
  updateStatus: async (orderId, status) => {
    const response = await client.post(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Verify pickup OTP (driver)
  verifyPickupOtp: async (orderId, otp) => {
    const response = await client.post(`/orders/${orderId}/pickup-otp`, { otp });
    return response.data;
  },

  // Upload proof of delivery (driver)
  uploadPOD: async (orderId, formData) => {
    const response = await client.post(`/orders/${orderId}/pod`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await client.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Rate order (customer)
  rateOrder: async (orderId, rating, comment) => {
    const response = await client.post(`/orders/${orderId}/rate`, { rating, comment });
    return response.data;
  },

  // Track order
  getOrderTracking: async (orderId) => {
    const response = await client.get(`/orders/${orderId}/track`);
    return response.data;
  },
};

export default orderApi;