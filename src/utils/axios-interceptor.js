import axios from 'axios';
import authService from '../services/auth';
import { message } from 'antd';

// Get the correct path with basename for GitHub Pages
const getRedirectPath = (path) => {
  const basename = process.env.NODE_ENV === 'production' ? '/yushan-frontend' : '';
  return `${basename}${path}`;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Setup axios interceptors for automatic token refresh
 * @param {Object} axiosInstance - The axios instance to setup interceptors for
 */
export const setupAxiosInterceptors = (axiosInstance) => {
  // Request interceptor - Add token to all requests
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log requests in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Request:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
        });
      }
      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token expiration and refresh
  axiosInstance.interceptors.response.use(
    (response) => {
      // Log successful responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Response:', {
          url: response.config.url,
          status: response.status,
        });
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Don't retry if:
      // 1. Not a 401 error
      // 2. Already retried this request
      // 3. Request is to the refresh endpoint itself (avoid infinite loops)
      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Access token expired, refreshing...');
        const newAccessToken = await authService.refreshToken();

        // Process queued requests with new token
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - tokens are invalid
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);

        // Clear tokens and redirect to login
        authService.clearTokens();

        // Show user-friendly message
        message.error('Your session has expired. Please log in again.');

        // Redirect to login
        setTimeout(() => {
          window.location.href = getRedirectPath('/login?expired=true');
        }, 500);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};

// Setup interceptors for the default axios instance
setupAxiosInterceptors(axios);

// Add default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default axios;
