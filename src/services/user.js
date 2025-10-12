import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const userService = {
  async getMe() {
    const response = await axios.get(`${BASE}/users/me`, { headers: authHeader() });
    return response.data.data;
  },
  async upgradeToAuthorEmail(authorData) {
    const response = await axios.post(
      `${BASE}/author/send-email-author-verification`,
      { email: authorData },
      { headers: authHeader() }
    );
    return response.data;
  },
  async upgradeToAuthor(otp) {
    const response = await axios.post(
      `${BASE}/author/upgrade-to-author`,
      { verificationCode: otp },
      { headers: authHeader() }
    );
    return response.data;
  },
};

export default userService;
