import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { getToken } from './token';

// Create an axios instance with timeout and security configs
const baseAxios = axios.create({
  timeout: 10000, // 10 second timeout
  maxContentLength: 10000000, // 10MB max response size
  maxBodyLength: 10000000, // 10MB max request size
  // Add other default configs here if needed
});

// Apply rate limiting using axios-rate-limit
const apiClient = rateLimit(baseAxios, {
  maxRequests: 60, // Maximum 60 requests
  perMilliseconds: 60000, // Per minute (60000ms)
  maxRPS: 1, // 1 request per second average
});

// Keep your existing custom rate limiting as additional protection
let requestCount = 0;
const maxRequestsPerMinute = 60;
const requestTimes = [];

// Request interceptor with enhanced rate limiting
apiClient.interceptors.request.use(
  (config) => {
    // JWT token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const now = Date.now();

    // Remove requests older than 1 minute
    const oneMinuteAgo = now - 60000;
    const recentRequests = requestTimes.filter((time) => time > oneMinuteAgo);

    // Update the requestTimes array
    requestTimes.length = 0;
    requestTimes.push(...recentRequests, now);

    // Check if we exceed the custom limit (backup protection)
    if (recentRequests.length >= maxRequestsPerMinute) {
      return Promise.reject(new Error('Rate limit exceeded - too many requests'));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - possible resource exhaustion prevented');
    }
    if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
      console.error('Rate limit exceeded - throttling in effect');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
