/**
 * @fileoverview Test suite for voteService
 *
 * This file mocks 'axios' and 'localStorage' to test all
 * methods within the voteService object. It follows the same
 * structure as previous examples, testing all success and error paths
 * (assuming a standard try-catch block is intended).
 */

import voteService from '../vote'; // Import the module we are testing
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

// --- Define reusable mock data ---
const mockToken = 'mock-jwt-token-for-votes';
const mockAuthHeader = { Authorization: `Bearer ${mockToken}` };

// Mock data for getVotes (returns res.data.data)
const mockSuccessData = { totalVotes: 10, votesRemaining: 5 };
const mockApiResponse = { data: { data: mockSuccessData } };

// --- Test Suite ---

describe('voteService', () => {
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

    it('should call axios with empty headers if no token exists', async () => {
      localStorageGetItemSpy.mockReturnValue(null); // Override spy

      // We still mock a success response
      axios.get.mockResolvedValue(mockApiResponse);

      await voteService.getVotes();

      // Check that axios was called with empty headers
      expect(axios.get).toHaveBeenCalledWith(
        '/api/users/votes', // Assumes default BASE = '/api'
        {
          headers: {}, // Key check: headers are empty
        }
      );
    });
  });

  // --- getVotes ---
  describe('getVotes', () => {
    it('should fetch votes successfully', async () => {
      const result = await voteService.getVotes();

      // Check that axios.get was called correctly
      expect(axios.get).toHaveBeenCalledWith('/api/users/votes', {
        headers: mockAuthHeader,
      });
      // Check that authHeader logic ran
      expect(localStorageGetItemSpy).toHaveBeenCalledWith('jwt_token');
      // Check that it returns the nested data
      expect(result).toEqual(mockSuccessData);
    });

    /**
     * NOTE: The following tests assume that voteService.getVotes
     * *should* have a try...catch block identical to your other
     * services (like userService.getMe).
     */

    // --- Test All Error Cases (as requested) ---

    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      // This test assumes you want the standard 401 message
      await expect(voteService.getVotes()).rejects.toThrow('Unauthorized');
    });

    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      // This test assumes a logical error message for this context
      await expect(voteService.getVotes()).rejects.toThrow('Not Found');
    });

    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      // This test assumes the standard 500 message
      await expect(voteService.getVotes()).rejects.toThrow('Server Error');
    });

    it('should throw other http errors with server message', async () => {
      axios.get.mockRejectedValue(createHttpError(403, 'Forbidden'));
      // This test assumes the server's message is passed through
      await expect(voteService.getVotes()).rejects.toThrow('Forbidden');
    });

    it('should throw default http error message', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      // This test assumes a logical default message
      await expect(voteService.getVotes()).rejects.toThrow('HTTP Error');
    });

    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      // This test assumes the standard network error message
      await expect(voteService.getVotes()).rejects.toThrow('Network error');
    });
  });
});
