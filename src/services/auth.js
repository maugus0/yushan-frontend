import axios from 'axios';
import dayjs from 'dayjs';
import store from '../store';
import { login, logout, setAuthenticated } from '../store/slices/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Add gender mapping constants
const GENDER_CODES = {
  male: 0,
  female: 1,
  other: 2,
  prefer_not_to_say: 3,
};

const authService = {
  // AC1: Secure Token Storage
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      store.dispatch(setAuthenticated(true));
    }
  },

  // AC4: Clear Token
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    store.dispatch(logout());
  },

  // AC2: Get Token for Requests
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      store.dispatch(setAuthenticated(true));
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
    store.dispatch(logout());
  },

  // AC3: Check Token Validity
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  },

  async login(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    const { accessToken, refreshToken, ...userData } = response.data.data;
    this.setTokens(accessToken, refreshToken);
    store.dispatch(login(userData));
    return response.data.data;
  },

  async register(values) {
    // Add validation for required gender
    if (!values.gender) {
      throw new Error('Gender is required');
    }

    // Format the data according to API expectations
    const formattedData = {
      username: values.username,
      email: values.email,
      password: values.password,
      gender: GENDER_CODES[values.gender],
      birthday: dayjs(values.birthday).format('YYYY-MM-DD'),
      code: values.otp, // Changed from otp to code
    };

    console.log('Sending registration data:', formattedData);

    const response = await axios.post(`${API_URL}/auth/register`, formattedData, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const { accessToken, refreshToken, ...userData } = response.data.data;
    this.setTokens(accessToken, refreshToken);
    store.dispatch(login(userData));
    return response.data.data;
  },

  async logout() {
    try {
      await axios.post(`${API_URL}/auth/logout`, {
        refreshToken: this.getRefreshToken(),
      });
    } finally {
      this.clearTokens();
      window.location.href = '/login';
    }
  },

  // AC5: Handle Token Expiration
  handleUnauthorized() {
    this.clearToken();
    window.location.href = '/login?expired=true';
  },

  async sendVerificationEmail(email) {
    try {
      //console.log('Sending email verification request:', { email });
      const response = await axios.post(
        `${API_URL}/auth/send-email`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      //console.log('Email verification response:', response.data);
      return response.data;
    } catch (error) {
      // Log detailed error information
      console.error('Send Email Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
        message: error.message,
      });
      throw error;
    }
  },

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    this.setTokens(accessToken, newRefreshToken);
    return accessToken;
  },
};

export default authService;
