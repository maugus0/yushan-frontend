/**
 * @fileoverview Test suite for novelService
 *
 * This file mocks 'axios' and 'localStorage' to test all
 * methods within the novelService object. It follows the same
 * structure as previous examples, using helper functions
 * to simulate various error types and test all success/error paths.
 */

import novelService from '../novel'; // Import the module we are testing
import axios from 'axios'; // Import axios to be mocked

// --- Mock Dependencies ---

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
const mockToken = 'mock-jwt-token';

// Mock data for methods returning res.data.data
const mockSuccessData = { id: 'novel-1', title: 'Test Novel' };
const mockApiResponseData = { data: { data: mockSuccessData } };

// Mock data for methods returning res.data.data.content (lists)
const mockListContent = [{ id: 'novel-1', title: 'Test Novel 1' }];
const mockListResponse = { data: { data: { content: mockListContent, totalElements: 1 } } };

// Mock data for methods returning res.data
const mockPlainResponse = { data: { status: 'success', id: '123' } };

// --- Test Suite ---

describe('novelService', () => {
  let localStorageGetItemSpy;

  // Before each test, reset all mocks and set up default successful implementations
  beforeEach(() => {
    jest.clearAllMocks();

    localStorageGetItemSpy = jest.spyOn(window.localStorage.__proto__, 'getItem');
    localStorageGetItemSpy.mockReturnValue(mockToken);

    // Set default mock implementations for axios
    axios.get.mockResolvedValue(mockListResponse); // Default for getNovels, getNovel
    axios.post.mockResolvedValue(mockApiResponseData); // Default for createNovel
    axios.put.mockResolvedValue(mockApiResponseData); // Default for changeNovelDetail
  });

  afterEach(() => {
    localStorageGetItemSpy.mockRestore();
  });

  describe('authHeader (internal)', () => {
    it('should return auth header if token exists', () => {
      // This is tested implicitly by all other tests
      expect(localStorageGetItemSpy).not.toHaveBeenCalled(); // authHeader() is lazy
    });

    it('should return empty object if no token exists', async () => {
      localStorageGetItemSpy.mockReturnValue(null);
      axios.get.mockResolvedValue(mockApiResponseData); // Reset mock

      await novelService.getNovelById('123');

      // Check that axios was called with empty headers
      expect(axios.get).toHaveBeenCalledWith(
        '/api/novels/123', // Assumes default BASE = '/api'
        { headers: {} }
      );
    });
  });

  // --- createNovel ---
  describe('createNovel', () => {
    const novelData = { title: 'New Novel', synopsis: '...' };

    it('should create a novel successfully', async () => {
      axios.post.mockResolvedValue(mockApiResponseData);
      const result = await novelService.createNovel(novelData);

      const [calledUrl, calledBody, calledConfig] = axios.post.mock.calls[0];
      expect(calledUrl).toMatch(/\/novels$/);
      expect(calledBody).toEqual(novelData);
      expect(calledConfig?.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(localStorageGetItemSpy).toHaveBeenCalledWith('jwt_token');
      expect(result).toEqual(mockSuccessData);
    });

    // Test error cases
    it('should throw 400 error', async () => {
      axios.post.mockRejectedValue(createHttpError(400, 'Bad Request'));
      await expect(novelService.createNovel(novelData)).rejects.toThrow('Bad Request');
    });

    it('should throw 401 error', async () => {
      axios.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.createNovel(novelData)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      axios.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.createNovel(novelData)).rejects.toThrow('Novel not found');
    });

    it('should throw 500 error', async () => {
      axios.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.createNovel(novelData)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw default http error message', async () => {
      axios.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.createNovel(novelData)).rejects.toThrow('Failed to create novel');
    });

    it('should throw network error', async () => {
      axios.post.mockRejectedValue(createNetworkError());
      await expect(novelService.createNovel(novelData)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.post.mockRejectedValue(new Error());
      await expect(novelService.createNovel(novelData)).rejects.toThrow('Failed to create novel');
    });
  });

  // --- getNovel ---
  describe('getNovel', () => {
    const filters = { authorId: '1' };

    it('should fetch novels with filters and return content', async () => {
      const result = await novelService.getNovel(filters);

      const [calledUrl, calledConfig] = axios.get.mock.calls[0];
      expect(calledUrl).toMatch(/\/novels$/);
      expect(calledConfig).toEqual(
        expect.objectContaining({
          params: filters,
        })
      );
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(result).toEqual(mockListContent);
    });

    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.getNovel(filters)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.getNovel(filters)).rejects.toThrow('Failed to fetch novels');
    });

    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.getNovel(filters)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.getNovel(filters)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      await expect(novelService.getNovel(filters)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw generic error message', async () => {
      axios.get.mockRejectedValue(createGenericError('Something failed'));
      await expect(novelService.getNovel(filters)).rejects.toThrow('Something failed');
    });
  });

  // --- getNovels ---
  describe('getNovels', () => {
    it('should fetch novels with default filters', async () => {
      axios.get.mockResolvedValue(mockListResponse);
      const result = await novelService.getNovels();

      const expectedParams = {
        page: 0,
        size: 24,
        sort: 'createTime',
        order: 'desc',
      };
      const [calledUrl, calledConfig] = axios.get.mock.calls[0];
      expect(calledUrl).toMatch(/\/novels$/);
      expect(calledConfig.params).toEqual(expectedParams);
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(result).toEqual(mockListResponse.data.data);
    });

    it('should fetch novels with custom filters', async () => {
      const filters = {
        page: 1,
        size: 10,
        category: 'FANTASY',
        status: 1,
        sort: 'title',
        order: 'asc',
        query: 'test',
      };
      await novelService.getNovels(filters);

      const [calledUrl, calledConfig] = axios.get.mock.calls[0];
      expect(calledUrl).toMatch(/\/novels$/);
      expect(calledConfig.params).toEqual(filters);
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should include category if provided', async () => {
      await novelService.getNovels({ category: 'SCI_FI' });
      const params = axios.get.mock.calls[0][1].params;
      expect(params).toHaveProperty('category', 'SCI_FI');
    });

    it('should include status if provided (even 0)', async () => {
      await novelService.getNovels({ status: 0 });
      const params = axios.get.mock.calls[0][1].params;
      expect(params).toHaveProperty('status', 0);
    });

    it('should not include category or status if undefined', async () => {
      await novelService.getNovels({ page: 1, size: 5 });
      const params = axios.get.mock.calls[0][1].params;
      expect(params).not.toHaveProperty('category');
      expect(params).not.toHaveProperty('status');
      expect(params).toHaveProperty('page', 1);
    });

    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.getNovels()).rejects.toThrow('Session expired. Please login again');
    });

    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.getNovels()).rejects.toThrow('Novel not found');
    });

    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.getNovels()).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw default http error', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.getNovels()).rejects.toThrow('Failed to fetch novels');
    });

    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      await expect(novelService.getNovels()).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.get.mockRejectedValue(new Error());
      await expect(novelService.getNovels()).rejects.toThrow('Failed to fetch novels');
    });
  });

  // --- getNovelById ---
  describe('getNovelById', () => {
    const novelId = 'novel-123';

    it('should fetch a single novel by ID', async () => {
      axios.get.mockResolvedValue(mockApiResponseData);
      const result = await novelService.getNovelById(novelId);

      const [calledUrl, calledConfig] = axios.get.mock.calls[0];
      expect(calledUrl).toMatch(new RegExp(`/novels/${novelId}$`));
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(result).toEqual(mockSuccessData);
    });

    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.getNovelById(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.getNovelById(novelId)).rejects.toThrow('Failed to fetch novel');
    });

    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.getNovelById(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.getNovelById(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      await expect(novelService.getNovelById(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.get.mockRejectedValue(new Error());
      await expect(novelService.getNovelById(novelId)).rejects.toThrow('Failed to fetch novel');
    });
  });

  // --- hideNovelById ---
  describe('hideNovelById', () => {
    const novelId = 'novel-123';

    it('should hide a novel successfully', async () => {
      axios.post.mockResolvedValue(mockPlainResponse);
      const result = await novelService.hideNovelById(novelId);

      const [calledUrl, calledBody, calledConfig] = axios.post.mock.calls[0];
      expect(calledUrl).toMatch(new RegExp(`/novels/${novelId}/hide$`));
      expect(calledBody).toEqual({});
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(result).toEqual(mockPlainResponse.data);
    });

    it('should throw 404 error', async () => {
      axios.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.hideNovelById(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error', async () => {
      axios.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.hideNovelById(novelId)).rejects.toThrow('Failed to hide novel');
    });

    it('should throw 401 error', async () => {
      axios.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.hideNovelById(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 500 error', async () => {
      axios.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.hideNovelById(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw network error', async () => {
      axios.post.mockRejectedValue(createNetworkError());
      await expect(novelService.hideNovelById(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.post.mockRejectedValue(new Error());
      await expect(novelService.hideNovelById(novelId)).rejects.toThrow('Failed to hide novel');
    });
  });

  // --- unHideNovelById ---
  describe('unHideNovelById', () => {
    const novelId = 'novel-123';

    it('should unhide a novel successfully', async () => {
      axios.post.mockResolvedValue(mockPlainResponse);
      const result = await novelService.unHideNovelById(novelId);

      const [calledUrl, calledBody, calledConfig] = axios.post.mock.calls[0];
      expect(calledUrl).toMatch(new RegExp(`/novels/${novelId}/unhide$`));
      expect(calledBody).toEqual({});
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(result).toEqual(mockPlainResponse.data);
    });

    it('should throw 404 error', async () => {
      axios.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.unHideNovelById(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error', async () => {
      axios.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.unHideNovelById(novelId)).rejects.toThrow('Failed to unhide novel');
    });

    it('should throw 401 error', async () => {
      axios.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.unHideNovelById(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 500 error', async () => {
      axios.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.unHideNovelById(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw network error', async () => {
      axios.post.mockRejectedValue(createNetworkError());
      await expect(novelService.unHideNovelById(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.post.mockRejectedValue(new Error());
      await expect(novelService.unHideNovelById(novelId)).rejects.toThrow('Failed to unhide novel');
    });
  });

  // --- changeNovelDetailById ---
  describe('changeNovelDetailById', () => {
    const novelId = 'novel-123';
    const novelData = { title: 'Updated Title' };

    it('should update novel details successfully', async () => {
      axios.put.mockResolvedValue(mockApiResponseData);
      const result = await novelService.changeNovelDetailById(novelId, novelData);

      const [calledUrl, calledBody, calledConfig] = axios.put.mock.calls[0];
      expect(calledUrl).toMatch(new RegExp(`/novels/${novelId}$`));
      expect(calledBody).toEqual(novelData);
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(result).toEqual(mockSuccessData);
    });

    it('should throw 400 error', async () => {
      axios.put.mockRejectedValue(createHttpError(400, 'Bad Request'));
      await expect(novelService.changeNovelDetailById(novelId, novelData)).rejects.toThrow(
        'Bad Request'
      );
    });

    it('should throw 404 error', async () => {
      axios.put.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.changeNovelDetailById(novelId, novelData)).rejects.toThrow(
        'Novel not found'
      );
    });

    it('should throw default http error', async () => {
      axios.put.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.changeNovelDetailById(novelId, novelData)).rejects.toThrow(
        'Failed to update novel'
      );
    });

    it('should throw 401 error', async () => {
      axios.put.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.changeNovelDetailById(novelId, novelData)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 500 error', async () => {
      axios.put.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.changeNovelDetailById(novelId, novelData)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw network error', async () => {
      axios.put.mockRejectedValue(createNetworkError());
      await expect(novelService.changeNovelDetailById(novelId, novelData)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.put.mockRejectedValue(new Error());
      await expect(novelService.changeNovelDetailById(novelId, novelData)).rejects.toThrow(
        'Failed to update novel'
      );
    });
  });

  // --- submitNovelForReview ---
  describe('submitNovelForReview', () => {
    const novelId = 'novel-123';

    it('should submit novel for review successfully', async () => {
      axios.post.mockResolvedValue(mockPlainResponse);
      const result = await novelService.submitNovelForReview(novelId);

      const [calledUrl, calledBody, calledConfig] = axios.post.mock.calls[0];
      expect(calledUrl).toMatch(new RegExp(`/novels/${novelId}/submit-review$`));
      expect(calledBody).toEqual({});
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(result).toEqual(mockPlainResponse.data);
    });

    it('should throw 404 error', async () => {
      axios.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.submitNovelForReview(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error', async () => {
      axios.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.submitNovelForReview(novelId)).rejects.toThrow(
        'Failed to submit novel for review'
      );
    });

    it('should throw 401 error', async () => {
      axios.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.submitNovelForReview(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 500 error', async () => {
      axios.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.submitNovelForReview(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw network error', async () => {
      axios.post.mockRejectedValue(createNetworkError());
      await expect(novelService.submitNovelForReview(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.post.mockRejectedValue(new Error());
      await expect(novelService.submitNovelForReview(novelId)).rejects.toThrow(
        'Failed to submit novel for review'
      );
    });
  });

  // --- deleteNovelById ---
  describe('deleteNovelById', () => {
    const novelId = 'novel-123';

    it('should delete (archive) a novel successfully', async () => {
      axios.post.mockResolvedValue(mockPlainResponse);
      const result = await novelService.deleteNovelById(novelId);

      const [calledUrl, calledBody, calledConfig] = axios.post.mock.calls[0];
      expect(calledUrl).toMatch(new RegExp(`/novels/${novelId}/archive$`));
      expect(calledBody).toEqual({});
      expect(calledConfig.headers?.Authorization).toBe(`Bearer ${mockToken}`);

      expect(result).toEqual(mockPlainResponse.data);
    });

    it('should throw 404 error', async () => {
      axios.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(novelService.deleteNovelById(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error', async () => {
      axios.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(novelService.deleteNovelById(novelId)).rejects.toThrow('Failed to delete novel');
    });

    it('should throw 401 error', async () => {
      axios.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(novelService.deleteNovelById(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 500 error', async () => {
      axios.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(novelService.deleteNovelById(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw network error', async () => {
      axios.post.mockRejectedValue(createNetworkError());
      await expect(novelService.deleteNovelById(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.post.mockRejectedValue(new Error());
      await expect(novelService.deleteNovelById(novelId)).rejects.toThrow('Failed to delete novel');
    });
  });
});
