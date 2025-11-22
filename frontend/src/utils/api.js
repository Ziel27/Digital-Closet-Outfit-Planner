import axios from 'axios';

// Set base URL for all API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://ec2-13-214-128-31.ap-southeast-1.compute.amazonaws.com:5000';
axios.defaults.baseURL = API_BASE_URL;

// Configure axios defaults
axios.defaults.withCredentials = true; // Include cookies in all requests

let csrfToken = null;

// Get CSRF token from server
export const getCsrfToken = async () => {
  if (!csrfToken) {
    try {
      // Use relative path - Vite proxy will handle it
      const response = await axios.get('/api/csrf-token', {
        withCredentials: true, // Include cookies for session
      });
      csrfToken = response.data.csrfToken;
    } catch (error) {
      // Silently fail - CSRF might not be critical for some requests
      if (error.code !== 'ECONNREFUSED' && error.code !== 'ERR_NETWORK') {
        console.error('Failed to get CSRF token:', error);
      }
    }
  }
  return csrfToken;
};

// Axios interceptor to add CSRF token to requests
axios.interceptors.request.use(async (config) => {
  // Skip CSRF for GET requests and public endpoints
  if (config.method !== 'get' && 
      config.method !== 'head' && 
      config.method !== 'options' &&
      !config.url?.includes('/public') &&
      !config.url?.includes('/auth/google') &&
      !config.url?.includes('/auth/exchange-code') &&
      !config.url?.includes('/csrf-token')) {
    
    const token = await getCsrfToken();
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle CSRF errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && 
        error.response?.data?.message?.includes('CSRF')) {
      // Clear token and retry once
      csrfToken = null;
      console.warn('CSRF token expired, refreshing...');
    }
    return Promise.reject(error);
  }
);

export default axios;

