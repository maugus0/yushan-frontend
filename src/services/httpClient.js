// src/utils/httpClient.js
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { setupAxiosInterceptors } from '../utils/axios-interceptor';

// Base configuration for axios
const baseConfig = {
  timeout: 10000, // 10 second timeout
  maxContentLength: 10000000, // 10MB max response size
  maxBodyLength: 10000000, // 10MB max request size
};

// Create different clients for different use cases
const createRateLimitedClient = (maxRequests, perMilliseconds) => {
  const baseClient = axios.create(baseConfig);

  const rateLimitedClient = rateLimit(baseClient, {
    maxRequests,
    perMilliseconds,
    maxRPS: Math.floor(maxRequests / (perMilliseconds / 1000)), // Calculate RPS
  });

  // Setup auth interceptors for automatic token refresh
  setupAxiosInterceptors(rateLimitedClient);

  return rateLimitedClient;
};

// Default client - moderate rate limiting
export const httpClient = createRateLimitedClient(60, 60000); // 60 requests per minute

// Conservative client for heavy operations (file uploads, etc.)
export const heavyClient = createRateLimitedClient(10, 60000); // 10 requests per minute

// Light client for frequent operations (search, autocomplete, etc.)
export const lightClient = createRateLimitedClient(120, 60000); // 120 requests per minute

// Add rate limit interceptors to all clients
const addRateLimitInterceptors = (client, clientName = 'httpClient') => {
  // Response interceptor for rate limit specific handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'ECONNABORTED') {
        console.error(`${clientName}: Request timeout - resource exhaustion prevented`);
      }

      if (error.message?.includes('rate limit')) {
        console.warn(`${clientName}: Rate limit exceeded - throttling in effect`);
      }

      return Promise.reject(error);
    }
  );
};

// Apply rate limit interceptors to all clients
addRateLimitInterceptors(httpClient, 'httpClient');
addRateLimitInterceptors(heavyClient, 'heavyClient');
addRateLimitInterceptors(lightClient, 'lightClient');

// Default export for backward compatibility
export default httpClient;
