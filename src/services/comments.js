import { http, authHeader } from './_http';
import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';

const commentsApi = {
  async listByChapter(chapterId, { page = 0, size = 20 } = {}) {
    try {
      const res = await http.get(`/comments/chapter/${chapterId}`, {
        params: { page, size, sort: 'createTime', order: 'desc' },
        headers: authHeader(),
      });
      return res?.data?.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Comments not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch comments');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch comments');
      }
    }
  },
  async create({ chapterId, content }) {
    try {
      const res = await http.post(
        `/comments`,
        { chapterId, content, isSpoiler: false },
        { headers: authHeader() }
      );
      return res?.data?.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 400) {
          throw new Error(message || 'Invalid comment data');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Chapter not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to create comment');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to create comment');
      }
    }
  },
  async getCommentsByNovelId(filters) {
    try {
      const { novelId, ...restFilters } = filters;
      const response = await axios.get(`${BASE}/comments/novel/${novelId}`, {
        params: restFilters,
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
          throw new Error('Comments not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to fetch comments');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to fetch comments');
      }
    }
  },
  async like(commentId) {
    try {
      const res = await http.post(`/comments/${commentId}/like`, {}, { headers: authHeader() });
      return res?.data?.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Comment not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to like comment');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to like comment');
      }
    }
  },
  async unlike(commentId) {
    try {
      const res = await http.post(`/comments/${commentId}/unlike`, {}, { headers: authHeader() });
      return res?.data?.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Comment not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to unlike comment');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to unlike comment');
      }
    }
  },
  async edit(commentId, { content, isSpoiler }) {
    try {
      const res = await http.put(
        `/comments/${commentId}`,
        { content, isSpoiler },
        { headers: authHeader() }
      );
      return res?.data?.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 400) {
          throw new Error(message || 'Invalid comment data');
        } else if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Comment not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to edit comment');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to edit comment');
      }
    }
  },
  async delete(commentId) {
    try {
      const res = await http.delete(`/comments/${commentId}`, { headers: authHeader() });
      return res?.data?.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        if (status === 401) {
          throw new Error('Session expired. Please login again');
        } else if (status === 404) {
          throw new Error('Comment not found');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(message || 'Failed to delete comment');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to delete comment');
      }
    }
  },
};

export default commentsApi;
