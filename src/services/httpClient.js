// src/utils/httpClient.js
import axios from 'axios';
import rateLimit from 'axios-rate-limit';

// Base configuration for axios
const baseConfig = {
  timeout: 10000,           // 10 second timeout
  maxContentLength: 10000000, // 10MB max response size
  maxBodyLength: 10000000,    // 10MB max request size
  // Add your base URL if you have one
  // baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
};

// Create different clients for different use cases
const createRateLimitedClient = (maxRequests, perMilliseconds) => {
  const baseClient = axios.create(baseConfig);
  
  return rateLimit(baseClient, {
    maxRequests,
    perMilliseconds,
    maxRPS: Math.floor(maxRequests / (perMilliseconds / 1000)) // Calculate RPS
  });
};

// Default client - moderate rate limiting
export const httpClient = createRateLimitedClient(60, 60000); // 60 requests per minute

// Conservative client for heavy operations (file uploads, etc.)
export const heavyClient = createRateLimitedClient(10, 60000); // 10 requests per minute

// Light client for frequent operations (search, autocomplete, etc.)
export const lightClient = createRateLimitedClient(120, 60000); // 120 requests per minute

// Add common interceptors to all clients
const addInterceptors = (client, clientName = 'httpClient') => {
  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add any common headers here
      // config.headers.Authorization = `Bearer ${getToken()}`;
      return config;
    },
    (error) => {
      console.error(`${clientName} request error:`, error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'ECONNABORTED') {
        console.error(`${clientName}: Request timeout - resource exhaustion prevented`);
      }
      
      if (error.message?.includes('rate limit')) {
        console.warn(`${clientName}: Rate limit exceeded - throttling in effect`);
        // You could dispatch a toast notification here
      }

      if (error.response?.status === 401) {
        // Handle authentication errors
        console.error(`${clientName}: Authentication required`);
        // You could redirect to login here
      }

      return Promise.reject(error);
    }
  );
};

// Apply interceptors to all clients
addInterceptors(httpClient, 'httpClient');
addInterceptors(heavyClient, 'heavyClient');
addInterceptors(lightClient, 'lightClient');

// Default export for backward compatibility
export default httpClient;