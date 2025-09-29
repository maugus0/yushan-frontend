import axios from 'axios';
import dayjs from 'dayjs';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Add gender mapping constants
const GENDER_CODES = {
  male: 0,
  female: 1,
  other: 2,
  prefer_not_to_say: 3
};

const authService = {
  async login(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
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
      code: values.otp  // Changed from otp to code
    };

    console.log('Sending registration data:', formattedData);

    const response = await axios.post(
      `${API_URL}/auth/register`,
      formattedData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('jwt_token');
  },

  getCurrentToken() {
    return localStorage.getItem('jwt_token');
  },

  async sendVerificationEmail(email) {
    try {
      console.log('Sending email verification request:', { email });
      const response = await axios.post(`${API_URL}/auth/sendEmail`, 
        { email },
        {
          headers: {
            'Content-Type': 'application/json'
          }
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
          data: error.config?.data
        },
        message: error.message
      });
      throw error;
    }
  }
};

export default authService;