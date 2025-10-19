import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const chapterService = {
  async createChapters(chapterData) {
    try {
      const response = await axios.post(`${BASE}/chapters`, chapterData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 400) {
          throw new Error(message || 'Invalid chapter data');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel or chapter not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to create chapter');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to create chapter');
      }
    }
  },
  async editChapters(chapterData) {
    try {
      const response = await axios.put(`${BASE}/chapters`, chapterData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 400) {
          throw new Error(message || 'Invalid chapter data');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Chapter not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to edit chapter');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to edit chapter');
      }
    }
  },
  async getChapterByNovelId(novelId, page, pageSize) {
    try {
      const response = await axios.get(`${BASE}/chapters/novel/${novelId}`, {
        params: { page, pageSize },
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Novel or chapters not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch chapters');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch chapters');
      }
    }
  },
  async getNextChapterNumber(novelId) {
    try {
      const response = await axios.get(`${BASE}/chapters/novel/${novelId}/next-number`, {
        headers: authHeader(),
      });
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
          throw new Error(message || 'Failed to get next chapter number');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to get next chapter number');
      }
    }
  },
  async deleteChapterByChapterId(chapterId) {
    try {
      const response = await axios.delete(`${BASE}/chapters/${chapterId}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Chapter not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to delete chapter');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to delete chapter');
      }
    }
  },
  async getChapterByChapterId(chapterId) {
    try {
      const response = await axios.get(`${BASE}/chapters/${chapterId}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Chapter not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch chapter');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch chapter');
      }
    }
  },
};

export default chapterService;
