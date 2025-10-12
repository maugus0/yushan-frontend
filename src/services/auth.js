import axios from 'axios';
import dayjs from 'dayjs';
import store from '../store';
import { login, logout, setAuthenticated } from '../store/slices/user';

const API_URL = process.env.REACT_APP_API_URL || ''; // remove localhost fallback to avoid GH Pages hitting localhost
const TOKEN_KEY = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Add gender mapping constants
const GENDER_CODES = {
  male: 1,
  female: 2,
  unknown: 0,
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

  setTokens(accessToken, refreshToken, expiresIn) {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      store.dispatch(setAuthenticated(true));

      // Store token expiry time if provided (in milliseconds)
      if (expiresIn) {
        const expiryTime = Date.now() + expiresIn;
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    delete axios.defaults.headers.common['Authorization'];
    store.dispatch(logout());
  },

  getTokenExpiry() {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  },

  isTokenExpired() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;
    return Date.now() > expiry;
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
    const { accessToken, refreshToken, expiresIn, ...userData } = response.data.data;
    this.setTokens(accessToken, refreshToken, expiresIn);
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
    }
  },

  // AC5: Handle Token Expiration
  handleUnauthorized() {
    this.clearToken();
    // Note: Navigation should be handled by the caller/component
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

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Make refresh request - this should NOT go through the interceptor retry logic
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // Skip the retry interceptor for this request
          _retry: true,
        }
      );

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data;

      // Update tokens in storage and axios headers
      this.setTokens(accessToken, newRefreshToken, expiresIn);

      console.log('Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      // Clear invalid tokens
      this.clearTokens();
      throw error;
    }
  },
};

export default authService;
