import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'https://yushan-backend-staging.up.railway.app/api';

// Map string gender from API to numeric values
const GENDER_MAP = {
  MALE: 1,
  FEMALE: 2,
  UNKNOWN: 0,
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
      // Check if we're uploading a file
      const hasFile = profileData.avatarFile instanceof File;

      let requestData;
      let headers = {};

      if (hasFile) {
        // Use FormData for file uploads
        const formData = new FormData();

        if (profileData.username) formData.append('username', profileData.username);
        if (profileData.email) formData.append('email', profileData.email);

        // Gender should be sent as uppercase string (MALE, FEMALE, UNKNOWN)
        if (profileData.gender !== undefined) {
          formData.append('gender', profileData.gender);
        }

        if (profileData.profileDetail !== undefined) {
          formData.append('profileDetail', profileData.profileDetail || '');
        }

        formData.append('avatar', profileData.avatarFile);

        if (profileData.verificationCode) {
          formData.append('verificationCode', profileData.verificationCode);
        }

        requestData = formData;
        headers['Content-Type'] = 'multipart/form-data';

        console.log('=== UPDATE PROFILE (WITH FILE) ===');
        console.log('User ID:', userId);
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, `File(${value.name}, ${value.type}, ${value.size} bytes)`);
          } else {
            console.log(`${key}:`, value);
          }
        }
      } else {
        // Use JSON for text-only updates
        const jsonData = {
          username: profileData.username,
          email: profileData.email,
          profileDetail: profileData.profileDetail || '',
        };

        // Gender should be sent as uppercase string (MALE, FEMALE, UNKNOWN)
        if (profileData.gender !== undefined) {
          jsonData.gender = profileData.gender;
        }

        if (profileData.verificationCode) {
          jsonData.verificationCode = profileData.verificationCode;
        }

        requestData = jsonData;
        headers['Content-Type'] = 'application/json';

        console.log('=== UPDATE PROFILE (JSON) ===');
        console.log('User ID:', userId);
        console.log('Request Data:', jsonData);
      }

      console.log('Content-Type:', headers['Content-Type']);
      console.log('===========================');

      const response = await axios.put(`${API_URL}/users/${userId}/profile`, requestData, {
        headers,
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

      // Enhanced error handling
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        console.error('Error response:', { status, message, data: error.response.data });

        // Check for specific email exists error
        if (message && message.toLowerCase().includes('email already')) {
          throw new Error('Email already exists. Please use a different email.');
        }

        if (status === 400) {
          throw new Error(message || 'Invalid profile data. Please check all fields');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 403) {
          throw new Error('You do not have permission to update this profile');
        } else if (status === 409) {
          throw new Error(message || 'Email already in use');
        } else if (status === 422) {
          throw new Error(message || 'Invalid verification code or code expired');
        } else if (status === 413) {
          throw new Error('Avatar file is too large. Maximum size is 5MB');
        } else if (status === 415) {
          throw new Error('Unsupported file type. Please upload an image file');
        } else if (status === 500) {
          // For 500 errors, show the actual backend message if available (helps with debugging)
          const errorDetail = message || 'Server error. Please try again later';
          console.error('Server error details:', error.response.data);
          throw new Error(errorDetail);
        } else {
          throw new Error(message || 'Failed to update profile');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to update profile');
      }
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

      // Enhanced error handling
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        // Check for specific email exists error
        if (message && message.toLowerCase().includes('email already')) {
          throw new Error('Email already exists. Please use a different email.');
        }

        if (status === 400) {
          throw new Error(message || 'Invalid email address');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 409) {
          throw new Error(message || 'Email already in use');
        } else if (status === 429) {
          throw new Error('Too many requests. Please wait before trying again');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to send verification email');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to send verification email');
      }
    }
  },
};

export default userProfileService;
