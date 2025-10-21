import axios from 'axios';
import { http, authHeader } from './_http';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';

const handleError = (error, messages) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;

    if (status === 401) {
      throw new Error('Session expired. Please login again');
    } else if (status === 404) {
      throw new Error(messages.notFound || 'Resource not found');
    } else if (status === 500) {
      throw new Error('Server error. Please try again later');
    } else {
      throw new Error(message || messages.generic || 'An unexpected error occurred');
    }
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('Network error. Please check your internet connection');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

const historyApi = {
  async list({ page = 0, size = 20 } = {}) {
    try {
      const res = await http.get(`/history`, { params: { page, size }, headers: authHeader() });
      return res?.data?.data;
    } catch (error) {
      handleError(error, {
        notFound: 'History not found',
        generic: 'Failed to fetch reading history',
      });
    }
  },

  async lastForNovel(novelId) {
    try {
      // The API call is within this.list, so the try block wraps the entire logic.
      const data = await this.list({ page: 0, size: 50 });
      const list = Array.isArray(data?.content) ? data.content : [];
      list.sort((a, b) => new Date(b.viewTime || 0) - new Date(a.viewTime || 0));
      return list.find((it) => Number(it.novelId) === Number(novelId)) || null;
    } catch (error) {
      // Re-throw the error from this.list or catch any other processing errors.
      throw new Error(`Failed to find last read chapter: ${error.message}`);
    }
  },

  async getHistoryNovels(filters) {
    try {
      const response = await axios.get(`${BASE}/history`, {
        headers: authHeader(),
        params: filters,
      });
      return response.data.data;
    } catch (error) {
      handleError(error, {
        notFound: 'History not found',
        generic: 'Failed to fetch history novels',
      });
    }
  },

  async deleteHistoryById(historyId) {
    try {
      const response = await axios.delete(`${BASE}/history/${historyId}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      handleError(error, {
        notFound: 'History item not found',
        generic: 'Failed to delete history item',
      });
    }
  },

  async clearHistory() {
    try {
      const response = await axios.delete(`${BASE}/history/clear`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleError(error, {
        notFound: 'Could not clear history',
        generic: 'Failed to clear history',
      });
    }
  },

  async recordRead(novelId, chapterId) {
    try {
      const res = await http.post(
        `/history/novels/${novelId}/chapters/${chapterId}`,
        {},
        { headers: authHeader() }
      );

      // After successfully recording reading history, if the novel is in user's library
      // update the library progress (PATCH /api/library/{novelId}/progress).
      // We keep this best-effort and swallow any errors here so history recording
      // does not fail due to library-related issues.
      try {
        const checkRes = await http.get(`/library/check/${novelId}`, {
          headers: authHeader(),
        });
        const inLibrary = checkRes?.data?.data === true;
        if (inLibrary) {
          await http.patch(
            `/library/${novelId}/progress`,
            { progress: chapterId }, // progress is chapter id according to API note
            { headers: authHeader() }
          );
        }
      } catch (libErr) {
        // ignore library update errors (network/auth etc.) — history recording succeeded already
      }

      return res?.data?.data;
    } catch (error) {
      handleError(error, {
        notFound: 'Novel or chapter not found',
        generic: 'Failed to record reading history',
      });
    }
  },
};

export default historyApi;
