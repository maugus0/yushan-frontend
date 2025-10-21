import axios from 'axios';
import rankings from '../rankings';

jest.mock('axios');

describe('rankings API', () => {
  beforeEach(() => {
    localStorage.setItem('jwt_token', 'test-token');
  });

  test('getNovels sends correct params', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: { content: [] } } });

    await rankings.getNovels({ page: 2, size: 10, sortType: 'views', timeRange: 'weekly' });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/ranking/novel'),
      expect.objectContaining({
        params: { page: 1, size: 10, sortType: 'views', timeRange: 'weekly' },
        headers: { Authorization: 'Bearer test-token' },
      })
    );
  });

  test('getReaders normalizes page data', async () => {
    axios.get.mockResolvedValueOnce({
      data: { data: { content: [{ id: 1 }], totalElements: 1, currentPage: 0 } },
    });

    const result = await rankings.getReaders({ page: 1 });
    expect(result.items.length).toBe(1);
    expect(result.page).toBe(1);
  });
});
