import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const novelService = {
  async createNovel(novelData) {
    try {
      const response = await axios.post(`${BASE}/novels`, novelData, { headers: authHeader() });
      return response.data.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 400) {
          throw new Error(message || 'Invalid novel data');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to create novel');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to create novel');
      }
    }
  },
  async getNovel(filters) {
    try {
      const response = await axios.get(`${BASE}/novels`, {
        params: filters,
        headers: authHeader(),
      });
      return response.data.data.content;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch novels');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch novels');
      }
    }
  },
  async getNovels(filters = {}) {
    try {
      const {
        page = 0,
        size = 24,
        category,
        status,
        sort = 'createTime',
        order = 'desc',
        ...rest
      } = filters;
      const params = {
        page,
        size,
        sort,
        order,
        ...rest,
      };
      if (category) {
        params.category = category;
      }
      if (status !== undefined) {
        params.status = status;
      }
      const response = await axios.get(`${BASE}/novels`, {
        params,
        headers: authHeader(),
      });
      return response.data.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch novels');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch novels');
      }
    }
  },
  async getNovelById(novelId) {
    try {
      const response = await axios.get(`${BASE}/novels/${novelId}`, { headers: authHeader() });
      return response.data.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch novel');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch novel');
      }
    }
  },
  async hideNovelById(novelId) {
    try {
      const response = await axios.post(
        `${BASE}/novels/${novelId}/hide`,
        {},
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to hide novel');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to hide novel');
      }
    }
  },
  async unHideNovelById(novelId) {
    try {
      const response = await axios.post(
        `${BASE}/novels/${novelId}/unhide`,
        {},
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to unhide novel');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to unhide novel');
      }
    }
  },
  async changeNovelDetailById(novelId, novelData) {
    try {
      const response = await axios.put(`${BASE}/novels/${novelId}`, novelData, {
        headers: authHeader(),
      });
      return response.data.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 400) {
          throw new Error(message || 'Invalid novel data');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to update novel');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to update novel');
      }
    }
  },
  async submitNovelForReview(novelId) {
    try {
      const response = await axios.post(
        `${BASE}/novels/${novelId}/submit-review`,
        {},
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to submit novel for review');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to submit novel for review');
      }
    }
  },
  async deleteNovelById(novelId) {
    try {
      const response = await axios.post(
        `${BASE}/novels/${novelId}/archive`,
        {},
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to delete novel');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to delete novel');
      }
    }
  },
};

export default novelService;
