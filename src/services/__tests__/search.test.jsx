/**
 * @fileoverview Test suite for searchService
 *
 * This file mocks the '_http' module to test
 * methods within the searchService object. It verifies
 * correct parameter passing, response data parsing (nested vs. flat),
 * and that errors are caught and default values are returned.
 */

import searchService from '../search'; // Import the module we are testing
import { http, authHeader } from '../_http'; // Import dependencies to be mocked

// --- Mock Dependencies ---

// Mock the '../_http' module
jest.mock('../_http', () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  authHeader: jest.fn(),
}));

// --- Test Setup ---

// Helper function to create a generic JavaScript error
const createGenericError = (message) => {
  return new Error(message);
};

// --- Define reusable mock data ---
const mockAuthHeader = { Authorization: 'Bearer mock-token' };
const mockError = createGenericError('Internal Server Error');

// Mock data for searchUsers
const mockUserData = {
  users: [{ id: 1, username: 'testuser' }],
  userCount: 1,
};
const mockUserResponseNested = { data: { data: mockUserData } }; // Nested format
const mockUserResponseFlat = { data: mockUserData }; // Flat format

// Mock data for searchNovels
const mockNovelData = {
  novels: [{ id: 1, title: 'Test Novel' }],
  novelCount: 1,
};
const mockNovelResponseNested = { data: { data: mockNovelData } }; // Nested format
const mockNovelResponseFlat = { data: mockNovelData }; // Flat format

// --- Test Suite ---

describe('searchService', () => {
  let consoleErrorSpy;

  // Before each test, reset all mocks and spy on console.error
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authHeader to return a dummy token
    authHeader.mockReturnValue(mockAuthHeader);

    // Spy on console.error to silence it and verify it's called
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set a default successful response
    http.get.mockResolvedValue(mockUserResponseNested);
  });

  // After each test, restore the console.error spy
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- searchUsers ---
  describe('searchUsers', () => {
    const defaultUserParams = {
      keyword: 'test',
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    };

    it('should search users with correct default params', async () => {
      const result = await searchService.searchUsers('test');

      expect(http.get).toHaveBeenCalledWith('/search/users', {
        params: defaultUserParams,
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserData);
    });

    it('should search users with custom pagination', async () => {
      await searchService.searchUsers('test', 2, 5);

      expect(http.get).toHaveBeenCalledWith('/search/users', {
        params: {
          ...defaultUserParams,
          page: 2,
          pageSize: 5,
        },
        headers: mockAuthHeader,
      });
    });

    it('should handle nested response format (res.data.data)', async () => {
      http.get.mockResolvedValue(mockUserResponseNested);
      const result = await searchService.searchUsers('test');
      expect(result).toEqual(mockUserData);
    });

    it('should handle flat response format (res.data)', async () => {
      http.get.mockResolvedValue(mockUserResponseFlat);
      const result = await searchService.searchUsers('test');
      expect(result).toEqual(mockUserData);
    });

    it('should return default state if data is missing', async () => {
      http.get.mockResolvedValue({ data: null }); // API returns nothing
      const result = await searchService.searchUsers('test');
      expect(result).toEqual({ users: [], userCount: 0 });
    });

    it('should return default state if data properties are null', async () => {
      http.get.mockResolvedValue({
        data: { data: { users: null, userCount: null } },
      });
      const result = await searchService.searchUsers('test');
      expect(result).toEqual({ users: [], userCount: 0 });
    });

    it('should return default state and log error on API failure', async () => {
      http.get.mockRejectedValue(mockError); // Simulate API error
      const result = await searchService.searchUsers('test');

      // Check that it returns the default empty state
      expect(result).toEqual({ users: [], userCount: 0 });
      // Check that the error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search users error:', mockError);
    });
  });

  // --- searchNovels ---
  describe('searchNovels', () => {
    const defaultNovelParams = {
      keyword: 'test',
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    };

    it('should search novels with correct default params', async () => {
      http.get.mockResolvedValue(mockNovelResponseNested);
      const result = await searchService.searchNovels('test');

      expect(http.get).toHaveBeenCalledWith('/search/novels', {
        params: defaultNovelParams,
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNovelData);
    });

    it('should search novels with custom pagination', async () => {
      http.get.mockResolvedValue(mockNovelResponseNested);
      await searchService.searchNovels('test', 2, 5);

      expect(http.get).toHaveBeenCalledWith('/search/novels', {
        params: {
          ...defaultNovelParams,
          page: 2,
          pageSize: 5,
        },
        headers: mockAuthHeader,
      });
    });

    it('should handle nested response format (res.data.data)', async () => {
      http.get.mockResolvedValue(mockNovelResponseNested);
      const result = await searchService.searchNovels('test');
      expect(result).toEqual(mockNovelData);
    });

    it('should handle flat response format (res.data)', async () => {
      http.get.mockResolvedValue(mockNovelResponseFlat);
      const result = await searchService.searchNovels('test');
      expect(result).toEqual(mockNovelData);
    });

    it('should return default state if data is missing', async () => {
      http.get.mockResolvedValue({ data: { data: null } });
      const result = await searchService.searchNovels('test');
      expect(result).toEqual({ novels: [], novelCount: 0 });
    });

    it('should return default state and log error on API failure', async () => {
      http.get.mockRejectedValue(mockError);
      const result = await searchService.searchNovels('test');

      // Check that it returns the default empty state
      expect(result).toEqual({ novels: [], novelCount: 0 });
      // Check that the error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search novels error:', mockError);
    });
  });

  // --- searchAll ---
  describe('searchAll', () => {
    it('should call both searchUsers and searchNovels and aggregate results', async () => {
      // Make http.get return different values based on the URL
      http.get.mockImplementation(async (url) => {
        if (url.includes('/search/users')) {
          return mockUserResponseNested;
        }
        if (url.includes('/search/novels')) {
          return mockNovelResponseNested;
        }
      });

      const result = await searchService.searchAll('test', 1, 10);

      // Check that both endpoints were called
      expect(http.get).toHaveBeenCalledWith('/search/users', expect.anything());
      expect(http.get).toHaveBeenCalledWith('/search/novels', expect.anything());
      // Check that authHeader was called twice (once by each sub-call)
      expect(authHeader).toHaveBeenCalledTimes(2);
      // Check that the results are aggregated
      expect(result).toEqual({
        ...mockUserData,
        ...mockNovelData,
      });
      // No "Search all" error should be logged
      expect(consoleErrorSpy).not.toHaveBeenCalledWith('Search all error:', expect.anything());
    });

    it('should aggregate results even if searchUsers fails', async () => {
      // Make searchUsers fail, but searchNovels succeed
      http.get.mockImplementation(async (url) => {
        if (url.includes('/search/users')) {
          throw mockError;
        }
        if (url.includes('/search/novels')) {
          return mockNovelResponseNested;
        }
      });

      const result = await searchService.searchAll('test');

      // Check that the result contains default user data and real novel data
      expect(result).toEqual({
        users: [],
        userCount: 0,
        ...mockNovelData,
      });
      // Check that the *user* search error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search users error:', mockError);
      // Check that the *all* search error was NOT logged (since Promise.all resolved)
      expect(consoleErrorSpy).not.toHaveBeenCalledWith('Search all error:', expect.anything());
    });

    it('should aggregate results even if searchNovels fails', async () => {
      // Make searchNovels fail, but searchUsers succeed
      http.get.mockImplementation(async (url) => {
        if (url.includes('/search/users')) {
          return mockUserResponseNested;
        }
        if (url.includes('/search/novels')) {
          throw mockError;
        }
      });

      const result = await searchService.searchAll('test');

      // Check that the result contains real user data and default novel data
      expect(result).toEqual({
        ...mockUserData,
        novels: [],
        novelCount: 0,
      });
      // Check that the *novel* search error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search novels error:', mockError);
    });

    it('should return default state if both sub-searches fail', async () => {
      // Make both calls fail
      http.get.mockRejectedValue(mockError);

      const result = await searchService.searchAll('test');

      // Check for the full default state
      expect(result).toEqual({
        users: [],
        userCount: 0,
        novels: [],
        novelCount: 0,
      });
      // Check that both sub-errors were logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search users error:', mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search novels error:', mockError);
    });

    it('should log "Search all error" if an unexpected error occurs', async () => {
      // Spy on searchUsers and make it throw a synchronous error
      const internalError = new Error('Internal breakdown');
      const searchUsersSpy = jest.spyOn(searchService, 'searchUsers').mockImplementation(() => {
        throw internalError; // Synchronous throw
      });

      const result = await searchService.searchAll('test');

      // Check that it returns the default state
      expect(result).toEqual({
        users: [],
        userCount: 0,
        novels: [],
        novelCount: 0,
      });
      // Check that the *Search all* error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search all error:', internalError);

      // Restore the spy
      searchUsersSpy.mockRestore();
    });
  });
});
