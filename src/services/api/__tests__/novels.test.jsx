/**
 * @fileoverview Test suite for novels API service
 *
 * This file mocks 'httpClient' and 'imageUtils' to test all
 * methods within the novels service. It verifies correct parameter
 * construction, data transformation, filtering/slicing, and error handling.
 */

import {
  getNovels,
  getWeeklyFeaturedNovels,
  getOngoingNovels,
  getCompletedNovels,
  getNewestNovels,
} from '../novels'; // Import the module we are testing
import { httpClient } from '../../httpClient';
import { processImageUrl } from '../../../utils/imageUtils';

// --- Mock Dependencies ---

// Mock the '../../httpClient' module
jest.mock('../../httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

// Mock the '../../../utils/imageUtils' module
jest.mock('../../../utils/imageUtils', () => ({
  processImageUrl: jest.fn(),
}));

// Mock the fallback image asset
jest.mock('../../../assets/images/novel_default.png', () => 'fallbackImage');

// --- Test Setup ---

// Helper function to create a generic JavaScript error
const createGenericError = (message) => {
  return new Error(message);
};

// --- Define Reusable Mock Data ---

// 1. Mock raw API data
const mockApiOngoingNovel = {
  id: 1,
  title: 'Ongoing Novel',
  authorUsername: 'author1',
  coverImgUrl: 'ongoing.jpg',
  categoryName: 'FANTASY',
  isCompleted: false, // -> 'Ongoing'
  status: 'PUBLISHED',
  synopsis: 'Synopsis 1',
  avgRating: 4.75, // -> 4.8
  chapterCnt: 10,
  tags: ['FANTASY'],
  // Include all other fields for full transform test
  uuid: 'uuid-1',
  authorId: 101,
  categoryId: 1,
  wordCnt: 50000,
  reviewCnt: 10,
  viewCnt: 1000,
  voteCnt: 50,
  yuanCnt: 5,
  publishTime: '2025-10-01T12:00:00Z',
  createTime: '2025-10-01T12:00:00Z',
  updateTime: '2025-10-02T12:00:00Z',
};

const mockApiCompletedNovel = {
  id: 2,
  title: 'Completed Novel',
  authorUsername: 'author2',
  coverImgUrl: 'completed.jpg',
  categoryName: 'SCI_FI',
  isCompleted: true, // -> 'Completed'
  status: 'PUBLISHED',
  synopsis: 'Synopsis 2',
  avgRating: 3.12, // -> 3.1
  chapterCnt: 100,
  tags: ['SCI_FI'],
};

const mockApiDraftNovel = {
  id: 3,
  title: 'Draft Novel',
  authorUsername: 'author3',
  coverImgUrl: null, // -> fallback
  categoryName: 'ROMANCE',
  isCompleted: false,
  status: 'DRAFT', // Should be filtered out by most functions
  synopsis: 'Synopsis 3',
  avgRating: null, // -> 0
  chapterCnt: 1,
  tags: ['ROMANCE'],
};

// 2. Mock the full API response for getNovels
const mockNovelsApiResponse = {
  data: {
    // This is what getNovels() returns
    data: {
      // This is what specific functions use
      content: [mockApiOngoingNovel, mockApiCompletedNovel, mockApiDraftNovel],
      totalElements: 3,
    },
    message: 'Success',
  },
};

// 3. Mock a large response for slicing tests
const largeMockContent = Array(10).fill(mockApiOngoingNovel);
const mockLargeApiResponse = {
  data: {
    data: {
      content: largeMockContent,
      totalElements: 10,
    },
  },
};

// 4. Mock a generic error
const mockError = createGenericError('API Request Failed');

// --- Test Suite ---

describe('novelsApi', () => {
  // Create typed aliases for the mocks
  const mockedHttpClient = httpClient;
  const mockedImageUtils = processImageUrl;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the default successful response
    mockedHttpClient.get.mockResolvedValue(mockNovelsApiResponse);

    // Mock the image processing function
    mockedImageUtils.mockImplementation(
      (url, base, fallback) => (url ? `${base}/${url}` : fallback) // Simulate the util's logic
    );

    // Spy on console.error to verify logging
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- getNovels (Core Function) ---
  describe('getNovels', () => {
    it('should fetch novels with default params', async () => {
      await getNovels();
      const expectedParams = 'page=0&size=10&sort=createTime&order=desc';
      expect(mockedHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`/novels?${expectedParams}`)
      );
    });

    it('should fetch novels with custom params', async () => {
      await getNovels({ page: 2, size: 5, sort: 'title', order: 'asc' });
      const expectedParams = 'page=2&size=5&sort=title&order=asc';
      expect(mockedHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`/novels?${expectedParams}`)
      );
    });

    it('should filter out empty, null, or undefined params', async () => {
      await getNovels({
        page: 1,
        status: 'PUBLISHED',
        category: '',
        authorId: null,
      });
      // Should not include category or authorId
      const expectedParams = 'page=1&size=10&sort=createTime&order=desc&status=PUBLISHED';
      const calledUrl = mockedHttpClient.get.mock.calls[0][0];

      expect(calledUrl).toContain(expectedParams);
      expect(calledUrl).not.toContain('category=');
      expect(calledUrl).not.toContain('authorId=');
    });

    it('should return the raw response data on success', async () => {
      const result = await getNovels();
      expect(result).toEqual(mockNovelsApiResponse.data);
    });

    it('should re-throw and log error on failure', async () => {
      mockedHttpClient.get.mockRejectedValue(mockError);

      await expect(getNovels()).rejects.toThrow('API Request Failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching novels:', mockError);
    });
  });

  // --- getNewestNovels (Specific Function) ---
  describe('getNewestNovels', () => {
    it('should call getNovels with correct params', async () => {
      await getNewestNovels();
      const calledUrl = mockedHttpClient.get.mock.calls[0][0];

      expect(calledUrl).toContain('size=3');
      expect(calledUrl).toContain('sort=createTime');
      expect(calledUrl).toContain('order=desc');
      expect(calledUrl).toContain('status=PUBLISHED');
    });

    it('should handle null avgRating and coverImgUrl', async () => {
      // Mock data is complex, let's check the third novel from the original mock
      // Ah, the filter for 'DRAFT' removes it. Let's re-run with just that novel.
      const draftNovelResponse = { data: { data: { content: [mockApiDraftNovel] } } };
      mockedHttpClient.get.mockResolvedValue(draftNovelResponse);

      const draftResult = await getNewestNovels();
      const transformedDraft = draftResult.content[0];

      expect(transformedDraft.rating).toBe(0); // from avgRating: null
      expect(transformedDraft.cover).toBe('fallbackImage'); // from coverImgUrl: null
    });

    it('should return empty content and log error on failure', async () => {
      mockedHttpClient.get.mockRejectedValue(mockError);
      const result = await getNewestNovels();

      expect(result).toEqual({ content: [] });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching newest novels:', mockError);
    });
  });

  // --- getWeeklyFeaturedNovels ---
  describe('getWeeklyFeaturedNovels', () => {
    beforeEach(() => {
      // Use the large response for this test
      mockedHttpClient.get.mockResolvedValue(mockLargeApiResponse);
    });

    it('should call getNovels with correct params', async () => {
      await getWeeklyFeaturedNovels();
      const calledUrl = mockedHttpClient.get.mock.calls[0][0];

      expect(calledUrl).toContain('size=20');
      expect(calledUrl).toContain('sort=createTime');
      expect(calledUrl).toContain('status=PUBLISHED');
    });

    it('should slice the results to 8 items', async () => {
      const result = await getWeeklyFeaturedNovels();

      // Mock response has 10 items
      expect(result.content).toHaveLength(8);
    });

    it('should return empty content and log error on failure', async () => {
      mockedHttpClient.get.mockRejectedValue(mockError);
      const result = await getWeeklyFeaturedNovels();

      expect(result).toEqual({ content: [] });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching weekly featured novels:',
        mockError
      );
    });
  });

  // --- getOngoingNovels ---
  describe('getOngoingNovels', () => {
    it('should call getNovels with correct params', async () => {
      await getOngoingNovels();
      const calledUrl = mockedHttpClient.get.mock.calls[0][0];

      expect(calledUrl).toContain('size=20');
      expect(calledUrl).toContain('sort=createTime');
      expect(calledUrl).toContain('status=PUBLISHED');
    });

    it('should filter for PUBLISHED and !isCompleted novels', async () => {
      const result = await getOngoingNovels();

      // Original mock has 1 ongoing (published), 1 completed (published), 1 draft
      expect(result.content).toHaveLength(1);
      expect(result.content[0].id).toBe(mockApiOngoingNovel.id);
      expect(result.content[0].status).toBe('Ongoing');
    });

    it('should return empty content and log error on failure', async () => {
      mockedHttpClient.get.mockRejectedValue(mockError);
      const result = await getOngoingNovels();

      expect(result).toEqual({ content: [] });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching ongoing novels:', mockError);
    });
  });

  // --- getCompletedNovels ---
  describe('getCompletedNovels', () => {
    it('should call getNovels with correct params (note: order=asc)', async () => {
      await getCompletedNovels();
      const calledUrl = mockedHttpClient.get.mock.calls[0][0];

      expect(calledUrl).toContain('size=100');
      expect(calledUrl).toContain('sort=createTime');
      expect(calledUrl).toContain('order=asc'); // Specific to this function
      expect(calledUrl).toContain('status=PUBLISHED');
    });

    it('should filter for PUBLISHED and isCompleted novels', async () => {
      const result = await getCompletedNovels();

      // Original mock has 1 ongoing (published), 1 completed (published), 1 draft
      expect(result.content).toHaveLength(1);
      expect(result.content[0].id).toBe(mockApiCompletedNovel.id);
      expect(result.content[0].status).toBe('Completed');
    });

    it('should return empty content and log error on failure', async () => {
      mockedHttpClient.get.mockRejectedValue(mockError);
      const result = await getCompletedNovels();

      expect(result).toEqual({ content: [] });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching completed novels:', mockError);
    });
  });
});
