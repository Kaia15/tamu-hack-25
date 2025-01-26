import axios from 'axios';

const API_KEY = import.meta.env.VITE_CAPITAL_ONE_API_KEY;
const BASE_URL = 'http://api.nessieisreal.com';  // Remove /api

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add API key to all requests
api.interceptors.request.use(config => {
  // Add API key to URL params
  config.params = {
    ...config.params,
    key: API_KEY
  };
  console.log('Making request to:', config.url, 'with params:', config.params);
  return config;
});

// Add response interceptor for better error logging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
);

export const capitalOneApi = {
  // Test connection
  testConnection: async () => {
    try {
      const response = await api.get('/accounts');
      console.log('API Connection test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Connection test failed:', error);
      throw error;
    }
  },

  // Get all accounts for a customer
  getAccounts: async (customerId) => {
    try {
      console.log('Fetching accounts for customer:', customerId);
      const response = await api.get(`/customers/${customerId}/accounts`);
      console.log('Accounts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },

  // Account endpoints
  getAccountById: async (accountId) => {
    try {
      const response = await api.get(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  },

  getCustomerAccounts: async (customerId) => {
    try {
      const response = await api.get(`/customers/${customerId}/accounts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer accounts:', error);
      throw error;
    }
  },

  createAccount: async (customerId, accountData) => {
    try {
      const response = await api.post(`/customers/${customerId}/accounts`, accountData);
      return response.data;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  updateAccount: async (accountId, updateData) => {
    try {
      const response = await api.put(`/accounts/${accountId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },

  deleteAccount: async (accountId) => {
    try {
      const response = await api.delete(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Customer endpoints
  getCustomers: async () => {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  getCustomerById: async (customerId) => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Get purchases for an account
  getPurchases: async (accountId) => {
    try {
      const response = await api.get(`/accounts/${accountId}/purchases`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  },

  getPurchasesByMerchant: async (merchantId) => {
    try {
      const response = await api.get(`/merchants/${merchantId}/purchases`);
      return response.data;
    } catch (error) {
      console.error('Error fetching merchant purchases:', error);
      throw error;
    }
  },

  getPurchaseById: async (purchaseId) => {
    try {
      const response = await api.get(`/purchases/${purchaseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase:', error);
      throw error;
    }
  },

  // Create a purchase
  createPurchase: async (accountId, purchaseData) => {
    try {
      const response = await api.post(`/accounts/${accountId}/purchases`, purchaseData);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  updatePurchase: async (purchaseId, updateData) => {
    try {
      const response = await api.put(`/purchases/${purchaseId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating purchase:', error);
      throw error;
    }
  },

  deletePurchase: async (purchaseId) => {
    try {
      const response = await api.delete(`/purchases/${purchaseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }
  },

  // Merchant purchase endpoints
  getMerchantAccountPurchases: async (merchantId, accountId) => {
    try {
      const response = await api.get(`/merchants/${merchantId}/accounts/${accountId}/purchases`);
      return response.data;
    } catch (error) {
      console.error('Error fetching merchant account purchases:', error);
      throw error;
    }
  },

  // Get merchants
  getMerchants: async () => {
    try {
      const response = await api.get('/merchants');
      return response.data;
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  }
}; 