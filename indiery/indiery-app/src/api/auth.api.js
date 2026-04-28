import client from './client';

export const authApi = {
  // Register or login with Firebase token
  register: async (firebaseToken, options = {}) => {
    const response = await client.post('/auth/register', options, {
      headers: { Authorization: `Bearer ${firebaseToken}` },
    });
    return response.data;
  },

  // Complete registration (add role after initial login)
  completeRegistration: async (firebaseToken, data) => {
    const response = await client.post('/auth/complete-registration', data, {
      headers: { Authorization: `Bearer ${firebaseToken}` },
    });
    return response.data.user;
  },

  // Get current user profile
  getMe: async () => {
    const response = await client.get('/auth/me');
    return response.data.user;
  },

  // Logout
  logout: async () => {
    const response = await client.post('/auth/logout');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await client.put('/auth/profile', data);
    return response.data;
  },

  // Update WhatsApp preference
  updateWhatsappOptIn: async (optIn) => {
    const response = await client.put('/auth/whatsapp', { whatsappOptIn: optIn });
    return response.data;
  },
};

export default authApi;