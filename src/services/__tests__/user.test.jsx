/**
 * @fileoverview Test suite for userService
 *
 * This file mocks 'axios' and 'localStorage' to test all
 * methods within the userService object. It follows the same
 * structure as previous examples, testing all success and error paths.
 */

import userService from '../user'; // Import the module we are testing
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
const mockToken = 'mock-jwt-token-for-user';
const mockAuthHeader = { Authorization: `Bearer ${mockToken}` };

// Mock data for getMe (returns res.data.data)
const mockUserData = { id: 'user-1', username: 'testuser', role: 'USER' };
const mockApiResponseData = { data: { data: mockUserData } };

// Mock data for upgrade methods (returns res.data)
const mockPlainResponseData = { status: 'success', message: 'Email sent' };
const mockPlainResponse = { data: mockPlainResponseData };

// --- Test Suite ---

describe('userService', () => {
  let localStorageGetItemSpy; // Declare the spy

  // Before each test, reset all mocks and set up default successful implementations
  beforeEach(() => {
    jest.clearAllMocks();

    // Spy on localStorage.getItem using the robust __proto__ method
    localStorageGetItemSpy = jest.spyOn(window.localStorage.__proto__, 'getItem');
    localStorageGetItemSpy.mockReturnValue(mockToken); // Set default token

    // Set default mock implementations for axios
    axios.get.mockResolvedValue(mockApiResponseData); // Default for getMe
    axios.post.mockResolvedValue(mockPlainResponse); // Default for upgrade methods
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

      await userService.getMe();

      // Check that axios was called with empty headers
      expect(axios.get).toHaveBeenCalledWith(
        '/api/users/me', // Assumes default BASE = '/api'
        {
          headers: {}, // Key check: headers are empty
        }
      );
    });
  });

  // --- getMe ---
  describe('getMe', () => {
    it('should fetch user data successfully', async () => {
      const result = await userService.getMe();

      // Check that axios.get was called correctly
      expect(axios.get).toHaveBeenCalledWith('/api/users/me', {
        headers: mockAuthHeader,
      });
      // Check that authHeader logic ran
      expect(localStorageGetItemSpy).toHaveBeenCalledWith('jwt_token');
      // Check that it returns the nested data
      expect(result).toEqual(mockUserData);
    });

    // --- Test All Error Cases ---

    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(userService.getMe()).rejects.toThrow('Session expired. Please login again');
    });

    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(userService.getMe()).rejects.toThrow('User not found');
    });

    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(userService.getMe()).rejects.toThrow('Server error. Please try again later');
    });

    it('should throw other http errors with server message', async () => {
      axios.get.mockRejectedValue(createHttpError(403, 'Forbidden'));
      await expect(userService.getMe()).rejects.toThrow('Forbidden');
    });

    it('should throw default http error message', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(userService.getMe()).rejects.toThrow('Failed to fetch user info');
    });

    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      await expect(userService.getMe()).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.get.mockRejectedValue(new Error()); // Error with no message
      await expect(userService.getMe()).rejects.toThrow('Failed to fetch user info');
    });
  });

  // --- upgradeToAuthorEmail ---
  describe('upgradeToAuthorEmail', () => {
    const email = 'test@example.com';

    it('should send author verification email successfully', async () => {
      const result = await userService.upgradeToAuthorEmail(email);

      // Check that axios.post was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        '/api/author/send-email-author-verification',
        { email: email }, // Body
        { headers: mockAuthHeader } // Config
      );
      // Check that authHeader logic ran
      expect(localStorageGetItemSpy).toHaveBeenCalledWith('jwt_token');
      // Check that it returns response.data
      expect(result).toEqual(mockPlainResponseData);
    });

    // --- Test All Error Cases ---

    it('should throw 400 error', async () => {
      axios.post.mockRejectedValue(createHttpError(400, 'Bad Request'));
      await expect(userService.upgradeToAuthorEmail(email)).rejects.toThrow('Bad Request');
    });

    it('should throw 401 error', async () => {
      axios.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(userService.upgradeToAuthorEmail(email)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 409 error (Conflict)', async () => {
      axios.post.mockRejectedValue(createHttpError(409, 'Conflict'));
      await expect(userService.upgradeToAuthorEmail(email)).rejects.toThrow('Conflict');
    });

    it('should throw 500 error', async () => {
      axios.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(userService.upgradeToAuthorEmail(email)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw other http errors with server message', async () => {
      axios.post.mockRejectedValue(createHttpError(403, 'Forbidden'));
      await expect(userService.upgradeToAuthorEmail(email)).rejects.toThrow('Forbidden');
    });

    it('should throw default http error message', async () => {
      axios.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(userService.upgradeToAuthorEmail(email)).rejects.toThrow(
        'Failed to send author verification email'
      );
    });

    it('should throw network error', async () => {
      axios.post.mockRejectedValue(createNetworkError());
      await expect(userService.upgradeToAuthorEmail(email)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });
  });

  // --- upgradeToAuthor ---
  describe('upgradeToAuthor', () => {
    const otp = '123456';

    it('should upgrade user to author successfully', async () => {
      const result = await userService.upgradeToAuthor(otp);

      // Check that axios.post was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        '/api/author/upgrade-to-author',
        { verificationCode: otp }, // Body
        { headers: mockAuthHeader } // Config
      );
      // Check that authHeader logic ran
      expect(localStorageGetItemSpy).toHaveBeenCalledWith('jwt_token');
      // Check that it returns response.data
      expect(result).toEqual(mockPlainResponseData);
    });

    // --- Test All Error Cases ---

    it('should throw 400 error', async () => {
      axios.post.mockRejectedValue(createHttpError(400, 'Bad Request'));
      await expect(userService.upgradeToAuthor(otp)).rejects.toThrow('Bad Request');
    });

    it('should throw 401 error', async () => {
      axios.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(userService.upgradeToAuthor(otp)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 409 error (Conflict)', async () => {
      axios.post.mockRejectedValue(createHttpError(409, 'Conflict'));
      await expect(userService.upgradeToAuthor(otp)).rejects.toThrow('Conflict');
    });

    it('should throw 500 error', async () => {
      axios.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(userService.upgradeToAuthor(otp)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw default http error message', async () => {
      axios.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(userService.upgradeToAuthor(otp)).rejects.toThrow('Failed to upgrade to author');
    });

    it('should throw network error', async () => {
      axios.post.mockRejectedValue(createNetworkError());
      await expect(userService.upgradeToAuthor(otp)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });
  });
});
