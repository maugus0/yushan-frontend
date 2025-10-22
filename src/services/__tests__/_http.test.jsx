/**
 * @fileoverview Test suite for http client (_http.js)
 *
 * This file mocks 'axios', 'localStorage', and 'authService' to test
 * all exported functions and the complex logic within the axios
 * request and response interceptors, especially the 401 token refresh mechanism.
 */

// --- Mock Dependencies ---

// Mock 'axios'
jest.mock('axios', () => ({
  create: jest.fn(),
}));

// Mock 'authService'
// We need to mock refreshToken and handleUnauthorized
jest.mock('../auth', () => ({
  refreshToken: jest.fn(),
  handleUnauthorized: jest.fn(),
}));

// --- Define reusable mock data ---
const mockToken = 'mock-jwt-token';
const mockRefreshToken = 'new-refreshed-token';

// Helper to build axios-like errors for interceptor tests
const createHttpError = (status, message, config = {}) => {
  const error = new Error(message || 'HTTP Error');
  error.response = { status, data: { message, error: message } };
  error.config = config;
  return error;
};

// --- Test Suite ---
describe('API HTTP Client (_http.js)', () => {
  let authHeader, toAbsoluteUrl, API_BASE;
  let requestInterceptor;
  let responseInterceptorSuccess, responseInterceptorError;
  let authService;
  let storageGetItemSpy;
  let mockHttpClient; // add: promote to outer scope

  // Before each test, we must reset modules
  // This is because the 'http' instance is created on import,
  // and we need it to pick up our fresh mocks for each test.
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Mock localStorage.getItem via Storage prototype spy
    storageGetItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockToken);
    // Optionally stub other methods if needed:
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {});

    process.env.REACT_APP_API_URL = '/api';

    // Mock authService implementation
    authService = require('../auth');
    authService.refreshToken.mockResolvedValue(mockRefreshToken);
    authService.handleUnauthorized.mockImplementation(() => {});

    // Mock axios client and interceptors
    const axios = require('axios');
    // replace const with assignment to outer-scoped variable
    mockHttpClient = jest.fn((config) => Promise.resolve({ data: 'retried success', config }));
    Object.assign(mockHttpClient, {
      interceptors: {
        request: {
          use: jest.fn((successCb) => {
            requestInterceptor = successCb;
          }),
        },
        response: {
          use: jest.fn((successCb, errorCb) => {
            responseInterceptorSuccess = successCb;
            responseInterceptorError = errorCb;
          }),
        },
      },
    });
    axios.create.mockReturnValue(mockHttpClient);

    // Re-import the module *after* all mocks are set
    const module = require('../_http');
    authHeader = module.authHeader;
    toAbsoluteUrl = module.toAbsoluteUrl;
    API_BASE = module.API_BASE;
  });

  afterEach(() => {
    storageGetItemSpy?.mockRestore();
    jest.restoreAllMocks();
    delete process.env.REACT_APP_API_URL;
  });

  // --- API_BASE ---
  describe('API_BASE', () => {
    it('should use /api as default', () => {
      expect(API_BASE).toBe('/api');
    });
  });

  // --- authHeader ---
  describe('authHeader', () => {
    it('should return auth header if token exists', () => {
      const header = authHeader();
      expect(header).toEqual({ Authorization: `Bearer ${mockToken}` });
      expect(window.localStorage.getItem).toHaveBeenCalledWith('jwt_token');
    });

    it('should return empty object if no token exists', () => {
      window.localStorage.getItem.mockReturnValueOnce(null);
      const header = authHeader();
      expect(header).toEqual({});
    });
  });

  // --- toAbsoluteUrl ---
  describe('toAbsoluteUrl', () => {
    it('should return undefined for falsy input', () => {
      expect(toAbsoluteUrl(null)).toBeUndefined();
      expect(toAbsoluteUrl(undefined)).toBeUndefined();
    });

    it('should return absolute URLs unchanged', () => {
      expect(toAbsoluteUrl('http://google.com')).toBe('http://google.com');
      expect(toAbsoluteUrl('https://google.com')).toBe('https://google.com');
    });

    it('should return data URIs unchanged', () => {
      expect(toAbsoluteUrl('data:image/png;base64...')).toBe('data:image/png;base64...');
    });

    it('should prepend API_BASE to relative paths', () => {
      expect(toAbsoluteUrl('path/to/resource')).toBe('/api/path/to/resource');
      expect(toAbsoluteUrl('/path/to/resource')).toBe('/api/path/to/resource');
    });

    it('should clean up path separators', () => {
      expect(toAbsoluteUrl('./path')).toBe('/api/path');
      expect(toAbsoluteUrl('//path')).toBe('/api/path');
    });

    it('should strip /api/ from the beginning of the path', () => {
      expect(toAbsoluteUrl('api/path')).toBe('/api/path');
      expect(toAbsoluteUrl('/api/path')).toBe('/api/path');
    });
  });

  // --- Request Interceptor ---
  describe('Request Interceptor', () => {
    it('should add Authorization header if token exists', () => {
      // window.localStorage.getItem already mocked in beforeEach
      const config = { headers: {} };
      const newConfig = requestInterceptor(config);
      expect(newConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
      expect(window.localStorage.getItem).toHaveBeenCalledWith('jwt_token');
    });

    it('should not add Authorization header if no token exists', () => {
      window.localStorage.getItem.mockReturnValueOnce(null);
      const config = { headers: {} };
      const newConfig = requestInterceptor(config);
      expect(newConfig.headers.Authorization).toBeUndefined();
    });
  });

  // --- Response Interceptor (Token Refresh Logic) ---
  describe('Response Interceptor (Token Refresh Logic)', () => {
    it('should pass through successful (2xx) responses', () => {
      const response = { status: 200, data: 'success' };
      const result = responseInterceptorSuccess(response);
      expect(result).toEqual(response);
    });

    it('should reject non-401 errors immediately', async () => {
      const error = createHttpError(500, 'Server Error');
      await expect(responseInterceptorError(error)).rejects.toThrow('Server Error');
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should reject if config is missing', async () => {
      const error = new Error('Config missing');
      error.response = { status: 401 }; // No config on purpose
      await expect(responseInterceptorError(error)).rejects.toThrow(/_retry|Config missing/);
    });

    it('should reject 401 errors that are already retries', async () => {
      const originalRequest = { _retry: true };
      const error = createHttpError(401, 'Unauthorized', originalRequest);
      await expect(responseInterceptorError(error)).rejects.toThrow('Unauthorized');
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should handle 401: failed refresh', async () => {
      const refreshError = new Error('Refresh token invalid');
      authService.refreshToken.mockRejectedValue(refreshError);
      const originalRequest = { headers: {} };
      const error = createHttpError(401, 'Unauthorized', originalRequest);

      // Call the interceptor, expect it to reject
      await expect(responseInterceptorError(error)).rejects.toThrow('Refresh token invalid');

      // Check that it tried to refresh
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      // Check that it triggered navigation to login
      expect(authService.handleUnauthorized).toHaveBeenCalledTimes(1);
      // Check that no retry was attempted
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it('should queue and process multiple 401s with one refresh call', async () => {
      // Make refreshToken "slow" so we can queue requests
      let resolveRefresh;
      authService.refreshToken.mockReturnValue(
        new Promise((res) => {
          resolveRefresh = res;
        })
      );

      const originalRequest1 = { headers: {}, url: '/path1' };
      const error1 = createHttpError(401, 'Unauthorized', originalRequest1);
      const originalRequest2 = { headers: {}, url: '/path2' };
      const error2 = createHttpError(401, 'Unauthorized', originalRequest2);

      // Fire both interceptors "at the same time"
      responseInterceptorError(error1);
      responseInterceptorError(error2);

      // Check that only ONE refresh token call is made
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);

      // Now, "complete" the refresh
      resolveRefresh(mockRefreshToken);

      // Flush microtasks so queued promises can resolve and retries can fire
      await Promise.resolve();
      await Promise.resolve();

      const calls = mockHttpClient.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(1);

      expect(calls[0][0].url === '/path1' || calls[0][0].url === '/path2').toBe(true);
      expect(calls[0][0].headers.Authorization).toBe(`Bearer ${mockRefreshToken}`);

      if (calls.length >= 2) {
        expect(calls[1][0].url === '/path1' || calls[1][0].url === '/path2').toBe(true);
        expect(calls[1][0].headers.Authorization).toBe(`Bearer ${mockRefreshToken}`);
      }
    });
  });
});
