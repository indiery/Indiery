import client from './client';

export const walletApi = {
  // Get wallet details
  getWallet: async () => {
    const response = await client.get('/wallet');
    return response.data;
  },

  // Add money to wallet
  addMoney: async (amount) => {
    const response = await client.post('/wallet/add', { amount });
    return response.data;
  },

  // Get transaction history
  getTransactions: async (page = 1, limit = 20) => {
    const response = await client.get('/wallet/transactions', {
      params: { page, limit },
    });
    return response.data;
  },

  // Use coins for discount
  useCoins: async (orderId, coinAmount) => {
    const response = await client.post('/wallet/use-coins', { orderId, coinAmount });
    return response.data;
  },

  // Get coin balance
  getCoins: async () => {
    const response = await client.get('/wallet/coins');
    return response.data;
  },
};

export default walletApi;