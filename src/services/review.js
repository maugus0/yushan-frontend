import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reviewService = {
  async getReviewsByNovelId(filters) {
    try {
      const response = await axios.get(`${BASE}/reviews`, {
        params: filters,
        headers: authHeader(),
      });
      return response.data.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel or reviews not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch reviews');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch reviews');
      }
    }
  },
};

export default reviewService;
