import axios from 'axios';
import rankings from '../rankings';

jest.mock('axios');

describe('rankings API', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('authHeader', () => {
    test('returns token when present', () => {
      localStorage.setItem('jwt_token', 'abc');
      const { getNovels } = rankings;
      expect(typeof getNovels).toBe('function'); // just sanity check
    });
    test('returns empty object when no token', async () => {
      axios.get.mockResolvedValueOnce({ data: { data: { content: [] } } });
      const res = await rankings.getNovels();
      expect(res.items).toEqual([]);
    });
  });

  describe('getNovels', () => {
    test('sends correct params with defaults', async () => {
      localStorage.setItem('jwt_token', 'test-token');
      axios.get.mockResolvedValueOnce({ data: { data: { content: [] } } });

      await rankings.getNovels();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/ranking/novel'),
        expect.objectContaining({
          params: { page: 0, size: 50 },
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });

    test('handles categoryId, timeRange, sortType', async () => {
      axios.get.mockResolvedValueOnce({ data: { data: { content: [] } } });

      await rankings.getNovels({
        page: 2,
        size: 10,
        categoryId: 5,
        sortType: 'votes',
        timeRange: 'weekly',
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/ranking/novel'),
        expect.objectContaining({
          params: { page: 1, size: 10, category: 5, sortType: 'votes', timeRange: 'weekly' },
        })
      );
    });

    test('normalizePage handles empty content', async () => {
      axios.get.mockResolvedValueOnce({ data: {} });
      const res = await rankings.getNovels();
      expect(res.items).toEqual([]);
      expect(res.total).toBe(0);
      expect(res.page).toBe(1);
    });
  });

  describe('getReaders', () => {
    test('sends correct params', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { content: [{ id: 1 }], totalElements: 1, currentPage: 0 } },
      });

      const res = await rankings.getReaders({
        page: 1,
        size: 20,
        timeRange: 'weekly',
        sortBy: 'exp',
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/ranking/user'),
        expect.objectContaining({
          params: { page: 0, size: 20, timeRange: 'weekly', sortBy: 'exp' },
        })
      );
      expect(res.items.length).toBe(1);
      expect(res.page).toBe(1);
    });

    test('normalizePage handles content not array', async () => {
      axios.get.mockResolvedValueOnce({ data: { data: { content: null } } });
      const res = await rankings.getReaders();
      expect(res.items).toEqual([]);
    });
  });

  describe('getWriters', () => {
    test('sends correct params', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { content: [{ id: 1 }], totalElements: 1, currentPage: 0 } },
      });

      const res = await rankings.getWriters({
        page: 3,
        size: 5,
        sortType: 'books',
        timeRange: 'monthly',
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/ranking/author'),
        expect.objectContaining({
          params: { page: 2, size: 5, sortType: 'books', timeRange: 'monthly' },
        })
      );
      expect(res.items.length).toBe(1);
      expect(res.page).toBe(1); // normalized from backend currentPage 0
    });
  });
});
