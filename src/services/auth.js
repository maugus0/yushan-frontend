import axios from 'axios';
import dayjs from 'dayjs';
import store from '../store';
import { logout, setAuthenticated } from '../store/slices/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Add gender mapping constants
const GENDER_CODES = {
  male: 0,
  female: 1,
  other: 2,
  prefer_not_to_say: 3,
};

const TOKEN_KEY = 'jwt_token';

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
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
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

    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
    }
    return response.data;
  },

  logout() {
    this.clearToken();
    window.location.href = '/login';
  },

  // AC5: Handle Token Expiration
  handleUnauthorized() {
    this.clearToken();
    window.location.href = '/login?expired=true';
  },

  async sendVerificationEmail(email) {
    try {
      console.log('Sending email verification request:', { email });
      const response = await axios.post(
        `${API_URL}/auth/sendEmail`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Email verification response:', response.data);
      return response.data;
    } catch (error) {
      // Log detailed error information
      console.error('Send Email Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
        message: error.message,
      });
      throw error;
    }
  },
};

export default authService;
