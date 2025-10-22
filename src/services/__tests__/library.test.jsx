import libraryApi from '../library'; // Import the module we are testing
import { http, authHeader } from '../_http'; // Import dependencies to be mocked
import axios from 'axios'; // Import axios to be mocked

// --- Mock Dependencies ---

// Mock the './_http' module
jest.mock('../_http', () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
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

// --- Define reusable mock data ---
const mockAuthHeader = { Authorization: 'Bearer mock-token' };

// Mock data for 'http' methods (returns res.data.data)
const mockHttpSuccessData = { id: 1, status: 'success' };
const mockHttpApiResponse = { data: { data: mockHttpSuccessData } };

// Mock data for 'axios' methods (returns res.data)
const mockAxiosSuccessData = { content: [], totalElements: 0 };
const mockAxiosApiResponse = { data: mockAxiosSuccessData };

// --- Test Suite ---

describe('libraryApi', () => {
  // Before each test, reset all mocks and set up default successful implementations
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authHeader to return a dummy token
    authHeader.mockReturnValue(mockAuthHeader);

    // Mock http methods
    http.get.mockResolvedValue(mockHttpApiResponse);
    http.post.mockResolvedValue(mockHttpApiResponse);
    http.delete.mockResolvedValue(mockHttpApiResponse);

    // Mock axios methods
    axios.get.mockResolvedValue(mockAxiosApiResponse);
    axios.delete.mockResolvedValue(mockAxiosApiResponse);
  });

  // --- add ---
  describe('add', () => {
    const novelId = 'novel-123';

    it('should add a novel with default progress (1)', async () => {
      const result = await libraryApi.add(novelId);

      // Check that http.post was called with the correct URL, body, and headers
      expect(http.post).toHaveBeenCalledWith(
        `/library/${novelId}`,
        { progress: 1 }, // Default progress
        { headers: mockAuthHeader }
      );
      expect(authHeader).toHaveBeenCalledTimes(1);
      // Check that it returns the nested data
      expect(result).toEqual(mockHttpSuccessData);
    });

    it('should add a novel with custom progress', async () => {
      await libraryApi.add(novelId, 5);

      // Check that the custom progress is used
      expect(http.post).toHaveBeenCalledWith(
        `/library/${novelId}`,
        { progress: 5 },
        { headers: mockAuthHeader }
      );
    });

    // Test error cases
    it('should throw 400 error', async () => {
      http.post.mockRejectedValue(createHttpError(400, 'Bad Request'));
      await expect(libraryApi.add(novelId)).rejects.toThrow('Bad Request');
    });

    it('should throw 401 error', async () => {
      http.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(libraryApi.add(novelId)).rejects.toThrow('Session expired. Please login again');
    });

    it('should throw 404 error', async () => {
      http.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(libraryApi.add(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw 500 error', async () => {
      http.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(libraryApi.add(novelId)).rejects.toThrow('Server error. Please try again later');
    });

    it('should throw other http errors with server message', async () => {
      http.post.mockRejectedValue(createHttpError(409, 'Conflict'));
      await expect(libraryApi.add(novelId)).rejects.toThrow('Conflict');
    });

    it('should throw default http error message', async () => {
      http.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(libraryApi.add(novelId)).rejects.toThrow('Failed to add to library');
    });

    it('should throw network error', async () => {
      http.post.mockRejectedValue(createNetworkError());
      await expect(libraryApi.add(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      http.post.mockRejectedValue(new Error());
      await expect(libraryApi.add(novelId)).rejects.toThrow('Failed to add to library');
    });
  });

  // --- remove ---
  describe('remove', () => {
    const novelId = 'novel-123';

    it('should remove a novel successfully', async () => {
      const result = await libraryApi.remove(novelId);

      expect(http.delete).toHaveBeenCalledWith(`/library/${novelId}`, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHttpSuccessData);
    });

    // Test error cases
    it('should throw 401 error', async () => {
      http.delete.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(libraryApi.remove(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      http.delete.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(libraryApi.remove(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error message', async () => {
      http.delete.mockRejectedValue(createHttpError(403, undefined));
      await expect(libraryApi.remove(novelId)).rejects.toThrow('Failed to remove from library');
    });

    it('should throw network error', async () => {
      http.delete.mockRejectedValue(createNetworkError());
      await expect(libraryApi.remove(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    // NEW: 500 error mapping
    it('should throw 500 error', async () => {
      http.delete.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(libraryApi.remove(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    // NEW: default generic error
    it('should throw default generic error', async () => {
      http.delete.mockRejectedValue(new Error());
      await expect(libraryApi.remove(novelId)).rejects.toThrow('Failed to remove from library');
    });
  });

  // --- check ---
  describe('check', () => {
    const novelId = 'novel-123';

    it('should return true if novel is in library', async () => {
      // Override default mock for this specific test
      http.get.mockResolvedValue({ data: { data: true } });
      const result = await libraryApi.check(novelId);

      expect(http.get).toHaveBeenCalledWith(`/library/check/${novelId}`, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should return false if novel is not in library', async () => {
      // Override default mock
      http.get.mockResolvedValue({ data: { data: false } });
      const result = await libraryApi.check(novelId);
      expect(result).toBe(false);
    });

    it('should return false if response data is not explicitly true', async () => {
      // Override default mock
      http.get.mockResolvedValue({ data: { data: 'some-string' } });
      let result = await libraryApi.check(novelId);
      expect(result).toBe(false);

      http.get.mockResolvedValue({ data: { data: null } });
      result = await libraryApi.check(novelId);
      expect(result).toBe(false);
    });

    // Test error cases
    it('should throw 401 error', async () => {
      http.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(libraryApi.check(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      http.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(libraryApi.check(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error message', async () => {
      http.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(libraryApi.check(novelId)).rejects.toThrow('Failed to check library');
    });

    // NEW: 500 error mapping
    it('should throw 500 error', async () => {
      http.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(libraryApi.check(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    // NEW: network error mapping
    it('should throw network error', async () => {
      http.get.mockRejectedValue(createNetworkError());
      await expect(libraryApi.check(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    // NEW: default generic error
    it('should throw default generic error', async () => {
      http.get.mockRejectedValue(new Error());
      await expect(libraryApi.check(novelId)).rejects.toThrow('Failed to check library');
    });
  });

  // --- getLibraryNovels ---
  describe('getLibraryNovels', () => {
    const filters = { page: 0, size: 10 };

    it('should fetch library novels using axios', async () => {
      const result = await libraryApi.getLibraryNovels(filters);

      // Assumes default BASE = '/api'
      expect(axios.get).toHaveBeenCalledWith('/api/library', {
        headers: mockAuthHeader,
        params: filters,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      // Check that it returns response.data directly
      expect(result).toEqual(mockAxiosSuccessData);
    });

    // Test error cases
    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(libraryApi.getLibraryNovels(filters)).rejects.toThrow('Library not found');
    });

    it('should throw default http error message', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(libraryApi.getLibraryNovels(filters)).rejects.toThrow(
        'Failed to fetch library novels'
      );
    });

    // NEW: 401 error mapping
    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(libraryApi.getLibraryNovels(filters)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    // NEW: 500 error mapping
    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(libraryApi.getLibraryNovels(filters)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    // NEW: network error mapping
    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      await expect(libraryApi.getLibraryNovels(filters)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    // NEW: default generic error
    it('should throw default generic error', async () => {
      axios.get.mockRejectedValue(new Error());
      await expect(libraryApi.getLibraryNovels(filters)).rejects.toThrow(
        'Failed to fetch library novels'
      );
    });
  });

  // --- getNovelDetails ---
  describe('getNovelDetails', () => {
    const novelId = 'novel-123';

    it('should fetch novel details using axios', async () => {
      const result = await libraryApi.getNovelDetails(novelId);

      // Assumes default BASE = '/api'
      expect(axios.get).toHaveBeenCalledWith(`/api/library/${novelId}`, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      // Check that it returns response.data directly
      expect(result).toEqual(mockAxiosSuccessData);
    });

    // Test error cases
    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(libraryApi.getNovelDetails(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error message', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(libraryApi.getNovelDetails(novelId)).rejects.toThrow(
        'Failed to fetch novel details'
      );
    });

    // NEW: 401 error mapping
    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(libraryApi.getNovelDetails(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    // NEW: 500 error mapping
    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(libraryApi.getNovelDetails(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    // NEW: network error mapping
    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      await expect(libraryApi.getNovelDetails(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    // NEW: default generic error
    it('should throw default generic error', async () => {
      axios.get.mockRejectedValue(new Error());
      await expect(libraryApi.getNovelDetails(novelId)).rejects.toThrow(
        'Failed to fetch novel details'
      );
    });
  });

  // --- deleteNovelFromLibrary ---
  describe('deleteNovelFromLibrary', () => {
    const novelId = 'novel-123';

    it('should delete a novel using axios', async () => {
      const result = await libraryApi.deleteNovelFromLibrary(novelId);

      // Assumes default BASE = '/api'
      expect(axios.delete).toHaveBeenCalledWith(`/api/library/${novelId}`, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      // Check that it returns response.data directly
      expect(result).toEqual(mockAxiosSuccessData);
    });

    // Test error cases
    it('should throw 404 error', async () => {
      axios.delete.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(libraryApi.deleteNovelFromLibrary(novelId)).rejects.toThrow('Novel not found');
    });

    it('should throw default http error message', async () => {
      axios.delete.mockRejectedValue(createHttpError(403, undefined));
      await expect(libraryApi.deleteNovelFromLibrary(novelId)).rejects.toThrow(
        'Failed to delete novel from library'
      );
    });

    // NEW: 401 error mapping
    it('should throw 401 error', async () => {
      axios.delete.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(libraryApi.deleteNovelFromLibrary(novelId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    // NEW: 500 error mapping
    it('should throw 500 error', async () => {
      axios.delete.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(libraryApi.deleteNovelFromLibrary(novelId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    // NEW: network error mapping
    it('should throw network error', async () => {
      axios.delete.mockRejectedValue(createNetworkError());
      await expect(libraryApi.deleteNovelFromLibrary(novelId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    // NEW: default generic error
    it('should throw default generic error', async () => {
      axios.delete.mockRejectedValue(new Error());
      await expect(libraryApi.deleteNovelFromLibrary(novelId)).rejects.toThrow(
        'Failed to delete novel from library'
      );
    });
  });
});
