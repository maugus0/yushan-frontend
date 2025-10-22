import axios from 'axios';
import categoriesService from '../categories';

// Mock axios to avoid actual API calls
jest.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

// Ensure localStorage exists on window/globalThis
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Categories Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  const mockCategories = [
    { id: 1, name: 'Fantasy' },
    { id: 2, name: 'Science Fiction' },
    { id: 3, name: 'Romance' },
  ];

  const mockResponse = {
    data: {
      data: {
        categories: mockCategories,
      },
    },
  };

  // Test 1: Successfully fetch categories
  test('successfully fetches categories', async () => {
    // Set up axios mock to return successful response
    axios.get.mockResolvedValueOnce(mockResponse);

    // Call the service method
    const result = await categoriesService.getCategories();

    // Verify the result
    expect(result).toEqual(mockCategories);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/categories', { headers: {} });
  });

  // Reset modules and re-mock axios for custom BASE test
  test('uses custom API URL when REACT_APP_API_URL is set', async () => {
    const originalEnv = process.env;
    const mockApiUrl = 'https://api.yushan.com/api';
    process.env = { ...originalEnv, REACT_APP_API_URL: mockApiUrl };

    jest.resetModules();
    jest.doMock('axios', () => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      default: {
        get: jest.fn(),
      },
    }));
    const axiosMock = require('axios');
    const getFn = axiosMock.get || axiosMock.default.get;
    getFn.mockResolvedValueOnce({
      data: { data: { categories: mockCategories } },
    });

    const refreshedCategoriesService = require('../categories').default;
    await refreshedCategoriesService.getCategories();

    expect(getFn).toHaveBeenCalledWith(`${mockApiUrl}/categories`, { headers: {} });

    jest.dontMock('axios');
    process.env = originalEnv;
  });

  // Assert rejection shape instead of toThrow message
  test('handles 401 unauthorized error', async () => {
    const errorResponse = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };
    axios.get.mockRejectedValueOnce(errorResponse);
    await expect(categoriesService.getCategories()).rejects.toHaveProperty('response.status', 401);
  });

  test('handles 404 not found error', async () => {
    const errorResponse = {
      response: {
        status: 404,
        data: { message: 'Not Found' },
      },
    };
    axios.get.mockRejectedValueOnce(errorResponse);
    await expect(categoriesService.getCategories()).rejects.toHaveProperty('response.status', 404);
  });

  test('handles 500 server error', async () => {
    const errorResponse = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    };
    axios.get.mockRejectedValueOnce(errorResponse);
    await expect(categoriesService.getCategories()).rejects.toHaveProperty('response.status', 500);
  });

  test('handles network error when no response is received', async () => {
    const networkError = { request: {}, message: 'Network Error' };
    axios.get.mockRejectedValueOnce(networkError);
    await expect(categoriesService.getCategories()).rejects.toHaveProperty('request');
  });

  test('handles other types of errors', async () => {
    const otherError = new Error('Unexpected Error');
    axios.get.mockRejectedValueOnce(otherError);
    await expect(categoriesService.getCategories()).rejects.toThrow('Unexpected Error');
  });

  test('handles empty response data', async () => {
    const emptyResponse = { data: { data: { categories: [] } } };
    axios.get.mockResolvedValueOnce(emptyResponse);
    const result = await categoriesService.getCategories();
    expect(result).toEqual([]);
  });

  test('handles response with missing data structure', async () => {
    const malformedResponse = { data: {} };
    axios.get.mockResolvedValueOnce(malformedResponse);
    await expect(categoriesService.getCategories()).rejects.toThrow();
  });
});
