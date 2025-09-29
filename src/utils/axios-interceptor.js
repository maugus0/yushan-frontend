import axios from 'axios';
import authService from '../services/auth';
import { message } from 'antd';

// AC2: Add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// AC5: Handle token expiration
axios.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    if (error.response?.status === 401) {
      authService.handleUnauthorized();
      message.error('Your session has expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

// Add default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default axios;
