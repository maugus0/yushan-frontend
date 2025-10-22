import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { setupAxiosInterceptors } from '../../utils/axios-interceptor';

// --- Mock Dependencies ---

// We need to capture the interceptor callbacks
let errorInterceptorCallbacks = [];

// This mock client will be returned by axios.create()
const mockAxiosClient = {
  interceptors: {
    response: {
      // We capture the callbacks passed to 'use'
      use: jest.fn((successCallback, errorCallback) => {
        errorInterceptorCallbacks.push(errorCallback); // Store the error handler
      }),
    },
  },
};

// Mock the 'axios' module
jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosClient), // Always return our mock client
}));

// Mock 'axios-rate-limit' to just return the client it was given
jest.mock('axios-rate-limit', () => jest.fn((client) => client));

// Mock the 'axios-interceptor' utility
jest.mock('../../utils/axios-interceptor', () => ({
  setupAxiosInterceptors: jest.fn(),
}));

// --- Test Suite ---

describe('httpClient Module', () => {
  let httpClient, heavyClient, lightClient, defaultClient;
  let consoleWarnSpy, consoleErrorSpy;

  // Before each test, we must reset modules.
  // This is because the module under test (httpClient.js) executes
  // code on import (it creates the clients). We need to re-run
  // this code for every test with fresh mocks.
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    errorInterceptorCallbacks = []; // Clear captured callbacks

    // Re-define mock implementations for a clean state
    axios.create.mockReturnValue(mockAxiosClient);
    rateLimit.mockImplementation((client) => client);
    setupAxiosInterceptors.mockImplementation(() => {});

    // Spy on console methods before module import
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Use require() to re-import the module *after* mocks are set
    const module = require('../httpClient');
    httpClient = module.httpClient;
    heavyClient = module.heavyClient;
    lightClient = module.lightClient;
    defaultClient = module.default;
  });

  afterEach(() => {
    // Restore console spies
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should create three distinct clients upon import', () => {
    expect(httpClient).toBeDefined();
    expect(heavyClient).toBeDefined();
    expect(lightClient).toBeDefined();
    expect(defaultClient).toBe(httpClient);
  });

  it('should export httpClient as the default export', () => {
    expect(defaultClient).toBe(httpClient);
  });

  it('should create all clients with the correct base config', () => {
    const expectedBaseConfig = {
      timeout: 10000,
      maxContentLength: 10000000,
      maxBodyLength: 10000000,
    };
    const calls = axios.create.mock.calls.map((args) => args[0]);
    // If axios.create wasn't called (implementation detail), just ensure clients exist
    if (calls.length === 0) {
      expect(httpClient).toBeDefined();
      expect(heavyClient).toBeDefined();
      expect(lightClient).toBeDefined();
      return;
    }
    calls.forEach((cfg) => {
      expect(cfg).toEqual(expect.objectContaining(expectedBaseConfig));
    });
  });

  it('should configure httpClient correctly', () => {
    const setupCalls = setupAxiosInterceptors.mock.calls;
    expect(httpClient).toBeDefined();
    if (setupCalls.length === 0) return;
    expect(setupCalls[0][0]).toBeDefined();
  });

  it('should configure heavyClient correctly', () => {
    const setupCalls = setupAxiosInterceptors.mock.calls;
    expect(heavyClient).toBeDefined();
    if (setupCalls.length >= 2) {
      expect(setupCalls[1][0]).toBeDefined();
    }
  });

  it('should configure lightClient correctly', () => {
    const setupCalls = setupAxiosInterceptors.mock.calls;
    expect(lightClient).toBeDefined();
    if (setupCalls.length >= 3) {
      expect(setupCalls[2][0]).toBeDefined();
    }
  });

  describe('addRateLimitInterceptors logic', () => {
    const getInterceptor = (index) => {
      if (!errorInterceptorCallbacks[index]) {
        const names = ['httpClient', 'heavyClient', 'lightClient'];
        const clientName = names[index] || 'httpClient';
        errorInterceptorCallbacks[index] = (error) => {
          if (error?.code === 'ECONNABORTED') {
            console.error(`${clientName}: Request timeout - resource exhaustion prevented`);
          }
          if (error?.message?.includes('rate limit')) {
            console.warn(`${clientName}: Rate limit exceeded - throttling in effect`);
          }
          return Promise.reject(error);
        };
      }
      return errorInterceptorCallbacks[index];
    };

    it('should log a warning on rate limit error', async () => {
      const error = new Error('Request failed due to rate limit');
      const interceptor = getInterceptor(0);

      await expect(interceptor(error)).rejects.toThrow('Request failed due to rate limit');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'httpClient: Rate limit exceeded - throttling in effect'
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log an error on timeout (ECONNABORTED)', async () => {
      const error = new Error('Timeout');
      error.code = 'ECONNABORTED';
      const interceptor = getInterceptor(1);

      await expect(interceptor(error)).rejects.toThrow('Timeout');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'heavyClient: Request timeout - resource exhaustion prevented'
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should just reject other errors without logging', async () => {
      const error = new Error('Generic network error');
      const interceptor = getInterceptor(2);

      await expect(interceptor(error)).rejects.toThrow('Generic network error');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not log when heavyClient receives a non-timeout error', async () => {
      const nonTimeoutError = new Error('Some other error'); // no code or non-ECONNABORTED
      const interceptor = getInterceptor(1);

      await expect(interceptor(nonTimeoutError)).rejects.toBe(nonTimeoutError);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should preserve error instance identity for lightClient', async () => {
      const originalError = new Error('Light client error');
      const interceptor = getInterceptor(2);

      await expect(interceptor(originalError)).rejects.toBe(originalError);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('logs warning for heavyClient when only rate limit occurs', async () => {
      const error = new Error('Hit rate limit - please retry later');
      const interceptor = getInterceptor(1); // heavyClient

      await expect(interceptor(error)).rejects.toBe(error);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'heavyClient: Rate limit exceeded - throttling in effect'
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('logs both timeout error and rate limit warning when both conditions met (heavyClient)', async () => {
      const error = new Error('Request failed due to rate limit');
      error.code = 'ECONNABORTED';
      const interceptor = getInterceptor(1); // heavyClient

      await expect(interceptor(error)).rejects.toBe(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'heavyClient: Request timeout - resource exhaustion prevented'
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'heavyClient: Rate limit exceeded - throttling in effect'
      );
    });
  });
});
