import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const userService = {
  async getCurrentUser() {
    const response = await axios.get(`${API_URL}/users/me`);
    return response.data;
  },

  async updateProfile(userId, profileData) {
    const formData = new FormData();

    // Add fields to FormData if they exist
    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.gender !== undefined) formData.append('gender', profileData.gender);
    if (profileData.profileDetail) formData.append('profileDetail', profileData.profileDetail);
    if (profileData.avatarFile) formData.append('avatar', profileData.avatarFile);

    const response = await axios.put(`${API_URL}/users/${userId}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async sendEmailChangeVerification(email) {
    const response = await axios.post(`${API_URL}/users/send-email-change-verification`, { email });
    return response.data;
  },
};

export default userService;
