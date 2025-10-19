import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const userService = {
  async getMe() {
    try {
      const response = await axios.get(`${BASE}/users/me`, { headers: authHeader() });
      return response.data.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('User not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch user info');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch user info');
      }
    }
  },
  async upgradeToAuthorEmail(authorData) {
    try {
      const response = await axios.post(
        `${BASE}/author/send-email-author-verification`,
        { email: authorData },
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 400) {
          throw new Error(message || 'Invalid email address');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 409) {
          throw new Error(message || 'Email already in use');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to send author verification email');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to send author verification email');
      }
    }
  },
  async upgradeToAuthor(otp) {
    try {
      const response = await axios.post(
        `${BASE}/author/upgrade-to-author`,
        { verificationCode: otp },
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 400) {
          throw new Error(message || 'Invalid verification code');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 409) {
          throw new Error(message || 'Verification code expired or invalid');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to upgrade to author');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to upgrade to author');
      }
    }
  },
};

export default userService;
