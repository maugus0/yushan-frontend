import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'https://yushan-backend-staging.up.railway.app/api';

// Map string gender from API to numeric values
const GENDER_MAP = {
  MALE: 1,
  FEMALE: 2,
  UNKNOWN: 0,
};

// Map numeric gender to string for API
const GENDER_REVERSE_MAP = {
  0: 'UNKNOWN',
  1: 'MALE',
  2: 'FEMALE',
};

/**
 * Transform API response to match frontend user model
 */
const transformUserData = (apiData) => {
  return {
    uuid: apiData.uuid,
    email: apiData.email,
    username: apiData.username,
    avatarUrl: apiData.avatarUrl,
    profileDetail: apiData.profileDetail,
    birthday: apiData.birthday,
    gender: typeof apiData.gender === 'string' ? GENDER_MAP[apiData.gender] || 0 : apiData.gender,
    isAuthor: apiData.isAuthor,
    isAdmin: apiData.isAdmin,
    level: apiData.level,
    exp: apiData.exp,
    readTime: apiData.readTime,
    readBookNum: apiData.readBookNum,
    status: apiData.status,
    createTime: apiData.createTime,
    updateTime: apiData.updateTime,
    lastActive: apiData.lastActive,
    // Format createTime for display
    createDate: apiData.createTime ? new Date(apiData.createTime).toLocaleDateString() : '',
  };
};

const userProfileService = {
  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_URL}/users/me`);

      if (response.data.code === 200 && response.data.data) {
        return {
          ...response.data,
          data: transformUserData(response.data.data),
        };
      }

      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async updateProfile(userId, profileData) {
    try {
      const formData = new FormData();

      // Add fields to FormData if they exist
      if (profileData.username) formData.append('username', profileData.username);
      if (profileData.email) formData.append('email', profileData.email);

      // Convert numeric gender to string for API if needed
      if (profileData.gender !== undefined) {
        const genderValue =
          typeof profileData.gender === 'number'
            ? GENDER_REVERSE_MAP[profileData.gender]
            : profileData.gender;
        formData.append('gender', genderValue);
      }

      if (profileData.profileDetail !== undefined) {
        formData.append('profileDetail', profileData.profileDetail || '');
      }

      if (profileData.avatarFile) {
        formData.append('avatar', profileData.avatarFile);
      }

      if (profileData.verificationCode) {
        formData.append('verificationCode', profileData.verificationCode);
      }

      // Debug: Log FormData contents
      console.log('=== UPDATE PROFILE DEBUG ===');
      console.log('User ID:', userId);
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log('===========================');

      const response = await axios.put(`${API_URL}/users/${userId}/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.code === 200 && response.data.data) {
        // Backend returns data.profile instead of just data
        const profileData = response.data.data.profile || response.data.data;
        return {
          ...response.data,
          data: transformUserData(profileData),
          emailChanged: response.data.data.emailChanged,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
        };
      }

      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async sendEmailChangeVerification(email) {
    try {
      const response = await axios.post(`${API_URL}/users/send-email-change-verification`, {
        email,
      });
      return response.data;
    } catch (error) {
      console.error('Send email verification error:', error);
      throw error;
    }
  },
};

export default userProfileService;
