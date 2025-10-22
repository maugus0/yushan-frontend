/**
 * @fileoverview Test suite for reviewsApi
 *
 * This file mocks the '_http' module to test all
 * methods within the reviewsApi object. It verifies
 * correct function calls and basic error propagation.
 */

import reviewsApi from '../reviews'; // Import the module we are testing
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
const mockSuccessData = { id: 'review-1', content: 'Success' };
const mockApiResponse = { data: { data: mockSuccessData } };
const mockError = createGenericError('Network Request Failed');

// --- Test Suite ---

describe('reviewsApi', () => {
  // Before each test, reset all mocks and set up default successful implementations
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authHeader to return a dummy token
    authHeader.mockReturnValue(mockAuthHeader);

    // Mock all http methods to resolve with a standard success response
    http.get.mockResolvedValue(mockApiResponse);
    http.post.mockResolvedValue(mockApiResponse);
    http.put.mockResolvedValue(mockApiResponse);
    http.delete.mockResolvedValue(mockApiResponse);
  });

  // --- listByNovel ---
  describe('listByNovel', () => {
    const novelId = 'novel-123';

    it('should list reviews with default params', async () => {
      const result = await reviewsApi.listByNovel(novelId);

      // Check that http.get was called with correct default params
      expect(http.get).toHaveBeenCalledWith(`/reviews/novel/${novelId}`, {
        params: { page: 0, size: 10, sort: 'createTime', order: 'desc' },
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    it('should list reviews with custom params', async () => {
      const options = { page: 2, size: 5, sort: 'rating' };
      await reviewsApi.listByNovel(novelId, options);

      // Check that http.get was called with custom params
      expect(http.get).toHaveBeenCalledWith(`/reviews/novel/${novelId}`, {
        params: {
          page: 2,
          size: 5,
          sort: 'rating',
          order: 'desc', // 'order' uses default
        },
        headers: mockAuthHeader,
      });
    });

    it('should throw an error if http.get fails', async () => {
      http.get.mockRejectedValue(mockError);
      await expect(reviewsApi.listByNovel(novelId)).rejects.toThrow(mockError.message);
    });
  });

  // --- create ---
  describe('create', () => {
    const payload = {
      novelId: 'novel-123',
      rating: 5,
      text: 'Great novel!',
      isSpoiler: true,
    };

    it('should create a review successfully', async () => {
      const result = await reviewsApi.create(payload);

      // Check that the body was correctly formatted
      const expectedBody = {
        novelId: 'novel-123',
        rating: 5,
        title: 'Great novel!', // Mapped from 'text'
        content: 'Great novel!', // Mapped from 'text'
        isSpoiler: true, // Boolean-casted
      };

      expect(http.post).toHaveBeenCalledWith('/reviews', expectedBody, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    it('should correctly handle falsey isSpoiler', async () => {
      const falseyPayload = { ...payload, isSpoiler: undefined };
      await reviewsApi.create(falseyPayload);

      // Check that isSpoiler is coerced to false
      expect(http.post.mock.calls[0][1].isSpoiler).toBe(false);
    });

    it('should throw an error if http.post fails', async () => {
      http.post.mockRejectedValue(mockError);
      await expect(reviewsApi.create(payload)).rejects.toThrow(mockError.message);
    });
  });

  // --- edit ---
  describe('edit', () => {
    const reviewId = 'review-1';
    const payload = {
      rating: 4,
      title: 'New Title',
      content: 'New Content',
      isSpoiler: false,
    };

    it('should edit a review successfully', async () => {
      const result = await reviewsApi.edit(reviewId, payload);

      expect(http.put).toHaveBeenCalledWith(`/reviews/${reviewId}`, payload, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    it('should throw an error if http.put fails', async () => {
      http.put.mockRejectedValue(mockError);
      await expect(reviewsApi.edit(reviewId, payload)).rejects.toThrow(mockError.message);
    });
  });

  // --- delete ---
  describe('delete', () => {
    const reviewId = 'review-1';

    it('should delete a review successfully', async () => {
      const result = await reviewsApi.delete(reviewId);

      expect(http.delete).toHaveBeenCalledWith(`/reviews/${reviewId}`, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    it('should throw an error if http.delete fails', async () => {
      http.delete.mockRejectedValue(mockError);
      await expect(reviewsApi.delete(reviewId)).rejects.toThrow(mockError.message);
    });
  });

  // --- like ---
  describe('like', () => {
    const reviewId = 'review-1';

    it('should like a review successfully', async () => {
      const result = await reviewsApi.like(reviewId);

      expect(http.post).toHaveBeenCalledWith(
        `/reviews/${reviewId}/like`,
        {},
        { headers: mockAuthHeader }
      );
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    it('should throw an error if http.post fails', async () => {
      http.post.mockRejectedValue(mockError);
      await expect(reviewsApi.like(reviewId)).rejects.toThrow(mockError.message);
    });
  });

  // --- unlike ---
  describe('unlike', () => {
    const reviewId = 'review-1';

    it('should unlike a review successfully', async () => {
      const result = await reviewsApi.unlike(reviewId);

      expect(http.post).toHaveBeenCalledWith(
        `/reviews/${reviewId}/unlike`,
        {},
        { headers: mockAuthHeader }
      );
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    it('should throw an error if http.post fails', async () => {
      http.post.mockRejectedValue(mockError);
      await expect(reviewsApi.unlike(reviewId)).rejects.toThrow(mockError.message);
    });
  });

  // --- getMyReview ---
  describe('getMyReview', () => {
    const novelId = 'novel-123';

    it('should get my review for a novel successfully', async () => {
      const result = await reviewsApi.getMyReview(novelId);

      expect(http.get).toHaveBeenCalledWith(`/reviews/my-reviews/novel/${novelId}`, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    it('should throw an error if http.get fails', async () => {
      http.get.mockRejectedValue(mockError);
      await expect(reviewsApi.getMyReview(novelId)).rejects.toThrow(mockError.message);
    });
  });
});
