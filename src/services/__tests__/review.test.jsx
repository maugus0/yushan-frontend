/**
 * @fileoverview Test suite for reviewService
 *
 * This file mocks 'axios' and 'localStorage' to test all
 * methods within the reviewService object. It follows the same
 * structure as previous examples, testing all success and error paths.
 */

import reviewService from '../review'; // Import the module we are testing
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
const mockToken = 'mock-jwt-token-for-reviews';
const mockAuthHeader = { Authorization: `Bearer ${mockToken}` };

// Mock data for methods returning res.data.data
const mockSuccessData = [
  { id: 'review-1', content: 'Great novel!' },
  { id: 'review-2', content: 'Could be better.' },
];
const mockApiResponse = { data: { data: mockSuccessData } };

// --- Test Suite ---

describe('reviewService', () => {
  let localStorageGetItemSpy; // Declare the spy

  // Before each test, reset all mocks and set up default successful implementations
  beforeEach(() => {
    jest.clearAllMocks();

    // Spy on localStorage.getItem using the robust __proto__ method
    localStorageGetItemSpy = jest.spyOn(window.localStorage.__proto__, 'getItem');
    localStorageGetItemSpy.mockReturnValue(mockToken); // Set default token

    // Set default mock implementations for axios
    axios.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    // Restore the spy to avoid cross-test contamination
    localStorageGetItemSpy.mockRestore();
  });

  describe('authHeader (internal)', () => {
    it('should not be called if no service method is invoked', () => {
      // Test that authHeader() is lazy
      expect(localStorageGetItemSpy).not.toHaveBeenCalled();
    });

    it('should return empty object if no token exists', async () => {
      localStorageGetItemSpy.mockReturnValue(null); // Override spy

      await reviewService.getReviewsByNovelId({ novelId: '123' });

      // Check that axios was called with empty headers
      expect(axios.get).toHaveBeenCalledWith(
        '/api/reviews', // Assumes default BASE = '/api'
        {
          params: { novelId: '123' },
          headers: {}, // Key check: headers are empty
        }
      );
    });
  });

  // --- getReviewsByNovelId ---
  describe('getReviewsByNovelId', () => {
    const filters = { novelId: 'novel-123', page: 0, size: 10 };

    it('should fetch reviews successfully', async () => {
      const result = await reviewService.getReviewsByNovelId(filters);

      // Check that axios.get was called correctly
      expect(axios.get).toHaveBeenCalledWith(
        '/api/reviews', // Assumes default BASE = '/api'
        {
          params: filters,
          headers: mockAuthHeader,
        }
      );
      // Check that authHeader logic ran
      expect(localStorageGetItemSpy).toHaveBeenCalledWith('jwt_token');
      // Check that it returns the nested data
      expect(result).toEqual(mockSuccessData);
    });

    // --- Test All Error Cases (as requested) ---

    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(reviewService.getReviewsByNovelId(filters)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(reviewService.getReviewsByNovelId(filters)).rejects.toThrow(
        'Novel or reviews not found'
      );
    });

    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(reviewService.getReviewsByNovelId(filters)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw other http errors with server message', async () => {
      // Tests the `else` block when a message is provided
      axios.get.mockRejectedValue(createHttpError(403, 'Forbidden'));
      await expect(reviewService.getReviewsByNovelId(filters)).rejects.toThrow(
        'Forbidden' // The message from the server
      );
    });

    it('should throw default http error message', async () => {
      // Tests the `else` block when no message is provided
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(reviewService.getReviewsByNovelId(filters)).rejects.toThrow(
        'Failed to fetch reviews' // The default message
      );
    });

    it('should throw network error', async () => {
      // Tests the `else if (error.request)` block
      axios.get.mockRejectedValue(createNetworkError());
      await expect(reviewService.getReviewsByNovelId(filters)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw generic error with message', async () => {
      // Tests the final `else` block when error.message exists
      axios.get.mockRejectedValue(createGenericError('Something failed'));
      await expect(reviewService.getReviewsByNovelId(filters)).rejects.toThrow('Something failed');
    });

    it('should throw default generic error', async () => {
      // Tests the final `else` block when error.message is missing
      axios.get.mockRejectedValue(new Error()); // Error with no message
      await expect(reviewService.getReviewsByNovelId(filters)).rejects.toThrow(
        'Failed to fetch reviews'
      );
    });
  });
});
