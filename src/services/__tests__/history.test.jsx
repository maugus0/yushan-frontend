import historyApi from '../history'; // Import the module we are testing
import { http, authHeader } from '../_http'; // Import dependencies to be mocked
import axios from 'axios'; // Import axios to be mocked

// --- Mock Dependencies ---

// Mock the './_http' module
jest.mock('../_http', () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(), // Not used by historyApi, but good to have
    patch: jest.fn(), // Used by recordRead
    delete: jest.fn(),
  },
  authHeader: jest.fn(),
}));

// Mock the 'axios' module
jest.mock('axios');

// --- Test Setup ---

// Helper function to create a standardized mock HTTP error
const createHttpError = (status, message, data = {}) => {
  const error = new Error(message || 'HTTP Error');
  error.response = {
    status,
    data: {
      message, // Used by `error.response.data?.message`
      error: message, // Used by `error.response.data?.error`
      ...data,
    },
  };
  return error;
};

// Helper function to create a mock network error (no response, but has request)
const createNetworkError = () => {
  const error = new Error('Network error');
  error.request = {}; // The presence of 'request' signifies a network error
  return error;
};

// Helper function to create a generic JavaScript error
const createGenericError = (message) => {
  return new Error(message);
};

// --- Define reusable mock data ---
const mockAuthHeader = { Authorization: 'Bearer mock-token' };
const mockSuccessData = { id: 1, content: 'Success' };
const mockApiResponse = { data: { data: mockSuccessData } };

// Mock data for list()
const mockHistoryList = [
  { novelId: '1', viewTime: '2025-10-20T10:00:00Z', id: 'a' },
  { novelId: '2', viewTime: '2025-10-20T12:00:00Z', id: 'b' },
  { novelId: '1', viewTime: '2025-10-20T08:00:00Z', id: 'c' },
];
const mockListData = { content: mockHistoryList, totalElements: 3 };
const mockListApiResponse = { data: { data: mockListData } };

// Mock data for axios delete responses (which return response.data)
const mockDeleteResponse = { data: { message: 'Success', status: 200 } };

// --- Test Suite ---

describe('historyApi', () => {
  // Before each test, reset all mocks and set up default successful implementations
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authHeader to return a dummy token
    authHeader.mockReturnValue(mockAuthHeader);

    // Mock http methods
    // Default to list response for http.get as it's used by list() and lastForNovel()
    http.get.mockResolvedValue(mockListApiResponse);
    http.post.mockResolvedValue(mockApiResponse);
    http.patch.mockResolvedValue(mockApiResponse); // For recordRead's library update
    http.delete.mockResolvedValue(mockApiResponse);

    // Mock axios methods
    axios.get.mockResolvedValue(mockApiResponse); // For getHistoryNovels
    axios.delete.mockResolvedValue(mockDeleteResponse); // For deleteHistoryById & clearHistory
  });

  // --- list ---
  describe('list', () => {
    it('should fetch history with default pagination', async () => {
      const result = await historyApi.list();

      // Check that http.get was called with the correct URL, params, and headers
      expect(http.get).toHaveBeenCalledWith('/history', {
        params: { page: 0, size: 20 },
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      // Check that it returns the nested data
      expect(result).toEqual(mockListData);
    });

    it('should fetch history with custom pagination', async () => {
      await historyApi.list({ page: 2, size: 50 });

      // Check that the custom page and size are used
      expect(http.get).toHaveBeenCalledWith('/history', {
        params: { page: 2, size: 50 },
        headers: mockAuthHeader,
      });
    });

    // Test error cases using handleError
    it('should throw 401 error', async () => {
      http.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(historyApi.list()).rejects.toThrow('Session expired. Please login again');
    });

    it('should throw 404 error', async () => {
      http.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(historyApi.list()).rejects.toThrow('History not found');
    });

    it('should throw 500 error', async () => {
      http.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(historyApi.list()).rejects.toThrow('Server error. Please try again later');
    });

    it('should throw other http errors with server message', async () => {
      http.get.mockRejectedValue(createHttpError(403, 'Forbidden'));
      await expect(historyApi.list()).rejects.toThrow('Forbidden');
    });

    it('should throw default generic http error message', async () => {
      // Simulate an error with no message/error field
      http.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(historyApi.list()).rejects.toThrow('Failed to fetch reading history');
    });

    it('should throw network error', async () => {
      http.get.mockRejectedValue(createNetworkError());
      await expect(historyApi.list()).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw generic error with message', async () => {
      http.get.mockRejectedValue(createGenericError('Something failed'));
      await expect(historyApi.list()).rejects.toThrow('Something failed');
    });

    it('should throw default generic error', async () => {
      http.get.mockRejectedValue(new Error()); // Error with no message
      await expect(historyApi.list()).rejects.toThrow('An unexpected error occurred');
    });
  });

  // --- lastForNovel ---
  describe('lastForNovel', () => {
    it('should call list() and find the most recent item for a novelId', async () => {
      // http.get is already mocked to return mockListApiResponse
      // The most recent for novelId '2' is id 'b'
      const result = await historyApi.lastForNovel('2');

      // Check that it called list() with correct params
      expect(http.get).toHaveBeenCalledWith('/history', {
        params: { page: 0, size: 50 },
        headers: mockAuthHeader,
      });
      // Check that it returned the correct item
      expect(result).toEqual(mockHistoryList[1]); // { novelId: '2', ..., id: 'b' }
    });

    it('should correctly find the most recent item when multiple exist', async () => {
      // The most recent for novelId '1' is id 'a', not 'c'
      const result = await historyApi.lastForNovel('1');
      expect(result).toEqual(mockHistoryList[0]); // { novelId: '1', ..., id: 'a' }
    });

    it('should handle numeric novelId comparison', async () => {
      // It should match '1' (string) with 1 (number)
      const result = await historyApi.lastForNovel(1);
      expect(result).toEqual(mockHistoryList[0]); // { novelId: '1', ..., id: 'a' }
    });

    it('should return null if novelId is not found', async () => {
      const result = await historyApi.lastForNovel('999');
      expect(result).toBeNull();
    });

    it('should return null if list data.content is not an array', async () => {
      http.get.mockResolvedValue({ data: { data: { content: null } } });
      const result = await historyApi.lastForNovel('1');
      expect(result).toBeNull();
    });

    it('should return null if list data is empty', async () => {
      http.get.mockResolvedValue({ data: { data: null } });
      const result = await historyApi.lastForNovel('1');
      expect(result).toBeNull();
    });

    it('should handle items with null or undefined viewTime', async () => {
      const listWithNullTime = [
        { novelId: '1', id: 'a' }, // viewTime is undefined, treated as 0
        { novelId: '1', viewTime: '2025-10-20T10:00:00Z', id: 'b' },
      ];
      http.get.mockResolvedValue({
        data: { data: { content: listWithNullTime } },
      });
      const result = await historyApi.lastForNovel('1');
      expect(result.id).toBe('b'); // 'b' is more recent than the one with no time
    });

    it('should re-throw error from list() with a new message', async () => {
      // Simulate an error from the underlying this.list() call
      http.get.mockRejectedValue(createHttpError(404, 'Not Found'));

      // The error from handleError is 'History not found'
      await expect(historyApi.lastForNovel('1')).rejects.toThrow(
        'Failed to find last read chapter: History not found'
      );
    });

    it('should re-throw network error from list()', async () => {
      http.get.mockRejectedValue(createNetworkError());
      await expect(historyApi.lastForNovel('1')).rejects.toThrow(
        'Failed to find last read chapter: Network error. Please check your internet connection'
      );
    });
  });

  // --- getHistoryNovels ---
  describe('getHistoryNovels', () => {
    it('should fetch history novels with filters (using axios)', async () => {
      const filters = { page: 1, size: 10, sort: 'title' };
      axios.get.mockResolvedValue(mockApiResponse);

      const result = await historyApi.getHistoryNovels(filters);

      // Check that axios.get was called with the correct URL, params, and headers
      // Assumes default BASE = '/api'
      expect(axios.get).toHaveBeenCalledWith('/api/history', {
        headers: mockAuthHeader,
        params: filters,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    // Test error cases (these mock axios.get)
    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(historyApi.getHistoryNovels({})).rejects.toThrow('History not found');
    });

    it('should throw default generic http error', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(historyApi.getHistoryNovels({})).rejects.toThrow(
        'Failed to fetch history novels'
      );
    });

    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      await expect(historyApi.getHistoryNovels({})).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });
  });

  // --- deleteHistoryById ---
  describe('deleteHistoryById', () => {
    it('should delete a history item by ID (using axios)', async () => {
      const historyId = 'hist-123';
      // mockDeleteResponse is set in beforeEach
      const result = await historyApi.deleteHistoryById(historyId);

      expect(axios.delete).toHaveBeenCalledWith(`/api/history/${historyId}`, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      // Check that it returns response.data directly
      expect(result).toEqual(mockDeleteResponse.data);
    });

    // Test error cases
    it('should throw 404 error', async () => {
      axios.delete.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(historyApi.deleteHistoryById('123')).rejects.toThrow('History item not found');
    });

    it('should throw default generic http error', async () => {
      axios.delete.mockRejectedValue(createHttpError(403, undefined));
      await expect(historyApi.deleteHistoryById('123')).rejects.toThrow(
        'Failed to delete history item'
      );
    });
  });

  // --- clearHistory ---
  describe('clearHistory', () => {
    it('should clear all history (using axios)', async () => {
      // mockDeleteResponse is set in beforeEach
      const result = await historyApi.clearHistory();

      expect(axios.delete).toHaveBeenCalledWith('/api/history/clear', {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      // Check that it returns response.data directly
      expect(result).toEqual(mockDeleteResponse.data);
    });

    // Test error cases
    it('should throw 404 error', async () => {
      axios.delete.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(historyApi.clearHistory()).rejects.toThrow('Could not clear history');
    });

    it('should throw default generic http error', async () => {
      axios.delete.mockRejectedValue(createHttpError(403, undefined));
      await expect(historyApi.clearHistory()).rejects.toThrow('Failed to clear history');
    });
  });

  // --- recordRead ---
  describe('recordRead', () => {
    const novelId = 'novel-1';
    const chapterId = 'chap-1';

    it('should record history AND update library if in library', async () => {
      // Call 1: http.post (record history)
      http.post.mockResolvedValue(mockApiResponse);
      // Call 2: http.get (check library) -> return true
      http.get.mockResolvedValue({ data: { data: true } });
      // Call 3: http.patch (update progress)
      http.patch.mockResolvedValue({ data: { data: { status: 'updated' } } });

      const result = await historyApi.recordRead(novelId, chapterId);

      // Verify all calls were made
      expect(http.post).toHaveBeenCalledWith(
        `/history/novels/${novelId}/chapters/${chapterId}`,
        {},
        { headers: mockAuthHeader }
      );
      expect(http.get).toHaveBeenCalledWith(`/library/check/${novelId}`, {
        headers: mockAuthHeader,
      });
      expect(http.patch).toHaveBeenCalledWith(
        `/library/${novelId}/progress`,
        { progress: chapterId },
        { headers: mockAuthHeader }
      );
      // Check authHeader was called for all 3 requests
      expect(authHeader).toHaveBeenCalledTimes(3);
      // Check it returns the result from the FIRST call (http.post)
      expect(result).toEqual(mockSuccessData);
    });

    it('should record history and NOT update library if not in library', async () => {
      // Call 1: http.post (record history)
      http.post.mockResolvedValue(mockApiResponse);
      // Call 2: http.get (check library) -> return false
      http.get.mockResolvedValue({ data: { data: false } });

      const result = await historyApi.recordRead(novelId, chapterId);

      // Verify first two calls were made
      expect(http.post).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledTimes(1);
      // Verify patch was NOT called
      expect(http.patch).not.toHaveBeenCalled();
      // AuthHeader called for post and get
      expect(authHeader).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockSuccessData);
    });

    it('should record history and SWALLOW library check error', async () => {
      // Call 1: http.post (record history)
      http.post.mockResolvedValue(mockApiResponse);
      // Call 2: http.get (check library) -> Fails
      http.get.mockRejectedValue(createHttpError(500, 'Library check failed'));

      // The function should still succeed and return the post data
      const result = await historyApi.recordRead(novelId, chapterId);

      expect(http.post).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledTimes(1);
      // Verify patch was NOT called
      expect(http.patch).not.toHaveBeenCalled();
      // Check it returns the result from the FIRST call
      expect(result).toEqual(mockSuccessData);
    });

    it('should record history and SWALLOW library patch error', async () => {
      // Call 1: http.post (record history)
      http.post.mockResolvedValue(mockApiResponse);
      // Call 2: http.get (check library) -> return true
      http.get.mockResolvedValue({ data: { data: true } });
      // Call 3: http.patch (update progress) -> Fails
      http.patch.mockRejectedValue(createHttpError(500, 'Patch failed'));

      // The function should still succeed and return the post data
      const result = await historyApi.recordRead(novelId, chapterId);

      expect(http.post).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.patch).toHaveBeenCalledTimes(1); // It was attempted
      // Check it returns the result from the FIRST call
      expect(result).toEqual(mockSuccessData);
    });

    it('should throw error if main history recording (http.post) fails', async () => {
      // Call 1: http.post (record history) -> Fails
      http.post.mockRejectedValue(createHttpError(404, 'Not Found'));

      // The error should be thrown and handled
      await expect(historyApi.recordRead(novelId, chapterId)).rejects.toThrow(
        'Novel or chapter not found'
      );

      // Verify that the library check and patch calls were never made
      expect(http.get).not.toHaveBeenCalled();
      expect(http.patch).not.toHaveBeenCalled();
    });

    it('should throw generic error if main history recording fails', async () => {
      http.post.mockRejectedValue(createHttpError(400, undefined));
      await expect(historyApi.recordRead(novelId, chapterId)).rejects.toThrow(
        'Failed to record reading history'
      );
    });
  });
});
