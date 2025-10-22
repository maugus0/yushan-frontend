/**
 * @fileoverview Test suite for reportsApi
 *
 * This file mocks the '_http' module to test
 * the methods within the reportsApi object.
 */

import reportsApi from '../reports'; // Import the module we are testing
import { http, authHeader } from '../_http'; // Import dependencies to be mocked

// --- Mock Dependencies ---

// Mock the './_http' module
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
const mockSuccessData = { id: 'report-1', status: 'SUBMITTED' };
const mockApiResponse = { data: { data: mockSuccessData } };

// --- Test Suite ---

describe('reportsApi', () => {
  // Before each test, reset all mocks and set up default successful implementations
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authHeader to return a dummy token
    authHeader.mockReturnValue(mockAuthHeader);

    // Mock http.post to resolve with a standard success response
    http.post.mockResolvedValue(mockApiResponse);
  });

  // --- reportNovel ---
  describe('reportNovel', () => {
    const novelId = 'novel-123';
    const reportData = {
      reportType: 'SPAM',
      reason: 'This is spam.',
    };

    it('should report a novel successfully', async () => {
      const result = await reportsApi.reportNovel(novelId, reportData);

      // Check that http.post was called with the correct URL, body, and headers
      expect(http.post).toHaveBeenCalledWith(
        `/reports/novel/${novelId}`, // URL
        reportData, // Body
        { headers: mockAuthHeader } // Config
      );

      // Check that authHeader was called
      expect(authHeader).toHaveBeenCalledTimes(1);

      // Check that it returns the nested data
      expect(result).toEqual(mockSuccessData);
    });

    it('should throw an error if http.post fails', async () => {
      const mockError = createGenericError('Network failed');
      // Mock http.post to reject
      http.post.mockRejectedValue(mockError);

      // Expect the reportNovel function to reject with the same error
      await expect(reportsApi.reportNovel(novelId, reportData)).rejects.toThrow('Network failed');

      // Verify http.post was still called correctly
      expect(http.post).toHaveBeenCalledWith(`/reports/novel/${novelId}`, reportData, {
        headers: mockAuthHeader,
      });
    });
  });
});
