import commentsApi from '../comments'; // Import the module we are testing
import { http, authHeader } from '../_http'; // Import dependencies to be mocked
import axios from 'axios'; // Import axios to be mocked

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

// Define reusable mock data
const mockAuthHeader = { Authorization: 'Bearer mock-token' };
const mockSuccessData = { id: 1, content: 'Success' };
const mockApiResponse = { data: { data: mockSuccessData } };

// --- Test Suite ---

describe('commentsApi', () => {
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

    // Mock axios.get (used by getCommentsByNovelId)
    axios.get.mockResolvedValue(mockApiResponse);
  });

  // --- listByChapter ---
  describe('listByChapter', () => {
    const chapterId = 'chap-123';

    it('should fetch comments with default pagination', async () => {
      const result = await commentsApi.listByChapter(chapterId);

      // Check that http.get was called with the correct URL, params, and headers
      expect(http.get).toHaveBeenCalledWith(`/comments/chapter/${chapterId}`, {
        params: { page: 0, size: 20, sort: 'createTime', order: 'desc' },
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      // Check that it returns the nested data
      expect(result).toEqual(mockSuccessData);
    });

    it('should fetch comments with custom pagination', async () => {
      await commentsApi.listByChapter(chapterId, { page: 2, size: 50 });

      // Check that the custom page and size are used
      expect(http.get).toHaveBeenCalledWith(`/comments/chapter/${chapterId}`, {
        params: { page: 2, size: 50, sort: 'createTime', order: 'desc' },
        headers: mockAuthHeader,
      });
    });

    // Test error cases
    it('should throw 401 error', async () => {
      http.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(commentsApi.listByChapter(chapterId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      http.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(commentsApi.listByChapter(chapterId)).rejects.toThrow('Comments not found');
    });

    it('should throw 500 error', async () => {
      http.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(commentsApi.listByChapter(chapterId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw other http errors with server message', async () => {
      http.get.mockRejectedValue(createHttpError(403, 'Forbidden'));
      await expect(commentsApi.listByChapter(chapterId)).rejects.toThrow('Forbidden');
    });

    it('should throw default http error message', async () => {
      // Simulate an error with no message/error field
      http.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(commentsApi.listByChapter(chapterId)).rejects.toThrow(
        'Failed to fetch comments'
      );
    });

    it('should throw network error', async () => {
      http.get.mockRejectedValue(createNetworkError());
      await expect(commentsApi.listByChapter(chapterId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw generic error with message', async () => {
      http.get.mockRejectedValue(createGenericError('Something failed'));
      await expect(commentsApi.listByChapter(chapterId)).rejects.toThrow('Something failed');
    });

    it('should throw default generic error', async () => {
      http.get.mockRejectedValue(new Error()); // Error with no message
      await expect(commentsApi.listByChapter(chapterId)).rejects.toThrow(
        'Failed to fetch comments'
      );
    });
  });

  // --- create ---
  describe('create', () => {
    const payload = { chapterId: 'chap-123', content: 'Great chapter!' };

    it('should create a comment successfully', async () => {
      const result = await commentsApi.create(payload);

      // Check that http.post was called with the correct URL, body, and headers
      expect(http.post).toHaveBeenCalledWith(
        `/comments`,
        { ...payload, isSpoiler: false }, // Verifies isSpoiler is added
        { headers: mockAuthHeader }
      );
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    // Test error cases
    it('should throw 400 error', async () => {
      http.post.mockRejectedValue(createHttpError(400, 'Bad Request'));
      await expect(commentsApi.create(payload)).rejects.toThrow('Bad Request');
    });

    it('should throw 401 error', async () => {
      http.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(commentsApi.create(payload)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      http.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(commentsApi.create(payload)).rejects.toThrow('Chapter not found');
    });

    it('should throw 500 error', async () => {
      http.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(commentsApi.create(payload)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw default http error message', async () => {
      http.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(commentsApi.create(payload)).rejects.toThrow('Failed to create comment');
    });

    it('should throw network error', async () => {
      http.post.mockRejectedValue(createNetworkError());
      await expect(commentsApi.create(payload)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      http.post.mockRejectedValue(new Error());
      await expect(commentsApi.create(payload)).rejects.toThrow('Failed to create comment');
    });
  });

  // --- getCommentsByNovelId ---
  describe('getCommentsByNovelId', () => {
    // This method uses axios directly, so we test the axios.get mock
    // It also assumes BASE is '/api' as process.env is not set in test
    const filters = { novelId: 'novel-456', page: 1, size: 10 };

    it('should fetch comments and strip novelId from params', async () => {
      const result = await commentsApi.getCommentsByNovelId(filters);

      // Check that axios.get was called correctly
      expect(axios.get).toHaveBeenCalledWith(
        `/api/comments/novel/novel-456`, // Assumes default BASE = '/api'
        {
          params: { page: 1, size: 10 }, // novelId is correctly removed
          headers: mockAuthHeader,
        }
      );
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    // Test error cases (these mock axios.get)
    it('should throw 401 error', async () => {
      axios.get.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(commentsApi.getCommentsByNovelId(filters)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      axios.get.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(commentsApi.getCommentsByNovelId(filters)).rejects.toThrow('Comments not found');
    });

    it('should throw 500 error', async () => {
      axios.get.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(commentsApi.getCommentsByNovelId(filters)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw default http error message', async () => {
      axios.get.mockRejectedValue(createHttpError(403, undefined));
      await expect(commentsApi.getCommentsByNovelId(filters)).rejects.toThrow(
        'Failed to fetch comments'
      );
    });

    it('should throw network error', async () => {
      axios.get.mockRejectedValue(createNetworkError());
      await expect(commentsApi.getCommentsByNovelId(filters)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      axios.get.mockRejectedValue(new Error());
      await expect(commentsApi.getCommentsByNovelId(filters)).rejects.toThrow(
        'Failed to fetch comments'
      );
    });
  });

  // --- like ---
  describe('like', () => {
    const commentId = 'comment-1';

    it('should like a comment successfully', async () => {
      const result = await commentsApi.like(commentId);

      expect(http.post).toHaveBeenCalledWith(
        `/comments/${commentId}/like`,
        {}, // Empty body
        { headers: mockAuthHeader }
      );
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    // Test error cases
    it('should throw 401 error', async () => {
      http.post.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(commentsApi.like(commentId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      http.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(commentsApi.like(commentId)).rejects.toThrow('Comment not found');
    });

    it('should throw 500 error', async () => {
      http.post.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(commentsApi.like(commentId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw default http error message', async () => {
      http.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(commentsApi.like(commentId)).rejects.toThrow('Failed to like comment');
    });

    it('should throw network error', async () => {
      http.post.mockRejectedValue(createNetworkError());
      await expect(commentsApi.like(commentId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      http.post.mockRejectedValue(new Error());
      await expect(commentsApi.like(commentId)).rejects.toThrow('Failed to like comment');
    });
  });

  // --- unlike ---
  describe('unlike', () => {
    const commentId = 'comment-2';

    it('should unlike a comment successfully', async () => {
      const result = await commentsApi.unlike(commentId);

      expect(http.post).toHaveBeenCalledWith(
        `/comments/${commentId}/unlike`,
        {}, // Empty body
        { headers: mockAuthHeader }
      );
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    // Error cases are identical to 'like' but with a different default message
    it('should throw 404 error', async () => {
      http.post.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(commentsApi.unlike(commentId)).rejects.toThrow('Comment not found');
    });

    it('should throw default http error message', async () => {
      http.post.mockRejectedValue(createHttpError(403, undefined));
      await expect(commentsApi.unlike(commentId)).rejects.toThrow('Failed to unlike comment');
    });

    it('should throw network error', async () => {
      http.post.mockRejectedValue(createNetworkError());
      await expect(commentsApi.unlike(commentId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      http.post.mockRejectedValue(new Error());
      await expect(commentsApi.unlike(commentId)).rejects.toThrow('Failed to unlike comment');
    });
  });

  // --- edit ---
  describe('edit', () => {
    const commentId = 'comment-3';
    const payload = { content: 'Updated content', isSpoiler: true };

    it('should edit a comment successfully', async () => {
      const result = await commentsApi.edit(commentId, payload);

      expect(http.put).toHaveBeenCalledWith(
        `/comments/${commentId}`,
        payload, // Body
        { headers: mockAuthHeader }
      );
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    // Test error cases
    it('should throw 400 error', async () => {
      http.put.mockRejectedValue(createHttpError(400, 'Bad Request'));
      await expect(commentsApi.edit(commentId, payload)).rejects.toThrow('Bad Request');
    });

    it('should throw 401 error', async () => {
      http.put.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(commentsApi.edit(commentId, payload)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      http.put.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(commentsApi.edit(commentId, payload)).rejects.toThrow('Comment not found');
    });

    it('should throw 500 error', async () => {
      http.put.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(commentsApi.edit(commentId, payload)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw default http error message', async () => {
      http.put.mockRejectedValue(createHttpError(403, undefined));
      await expect(commentsApi.edit(commentId, payload)).rejects.toThrow('Failed to edit comment');
    });

    it('should throw network error', async () => {
      http.put.mockRejectedValue(createNetworkError());
      await expect(commentsApi.edit(commentId, payload)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      http.put.mockRejectedValue(new Error());
      await expect(commentsApi.edit(commentId, payload)).rejects.toThrow('Failed to edit comment');
    });
  });

  // --- delete ---
  describe('delete', () => {
    const commentId = 'comment-4';

    it('should delete a comment successfully', async () => {
      const result = await commentsApi.delete(commentId);

      expect(http.delete).toHaveBeenCalledWith(`/comments/${commentId}`, {
        headers: mockAuthHeader,
      });
      expect(authHeader).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuccessData);
    });

    // Test error cases
    it('should throw 401 error', async () => {
      http.delete.mockRejectedValue(createHttpError(401, 'Unauthorized'));
      await expect(commentsApi.delete(commentId)).rejects.toThrow(
        'Session expired. Please login again'
      );
    });

    it('should throw 404 error', async () => {
      http.delete.mockRejectedValue(createHttpError(404, 'Not Found'));
      await expect(commentsApi.delete(commentId)).rejects.toThrow('Comment not found');
    });

    it('should throw 500 error', async () => {
      http.delete.mockRejectedValue(createHttpError(500, 'Server Error'));
      await expect(commentsApi.delete(commentId)).rejects.toThrow(
        'Server error. Please try again later'
      );
    });

    it('should throw default http error message', async () => {
      http.delete.mockRejectedValue(createHttpError(403, undefined));
      await expect(commentsApi.delete(commentId)).rejects.toThrow('Failed to delete comment');
    });

    it('should throw network error', async () => {
      http.delete.mockRejectedValue(createNetworkError());
      await expect(commentsApi.delete(commentId)).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should throw default generic error', async () => {
      http.delete.mockRejectedValue(new Error());
      await expect(commentsApi.delete(commentId)).rejects.toThrow('Failed to delete comment');
    });
  });
});
