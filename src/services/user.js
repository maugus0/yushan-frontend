import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const userService = {
  async getMe() {
    const response = await axios.get(`/users/me`);
    return response.data.data;
  },
  async upgradeToAuthorEmail(authorData) {
    const response = await axios.post(`/author/send-email-author-verification`, {
      email: authorData,
    });
    return response.data;
  },
  async upgradeToAuthor(otp) {
    const response = await axios.post(`/author/upgrade-to-author`, { verificationCode: otp });
    return response.data;
  },
};

export default userService;
