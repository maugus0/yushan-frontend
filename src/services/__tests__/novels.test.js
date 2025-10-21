// novels.test.js
import novelsApi from '../novels';
import { http, authHeader, toAbsoluteUrl } from '../_http';

jest.mock('../_http', () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
  },
  authHeader: jest.fn(),
  toAbsoluteUrl: jest.fn(),
}));

describe('novelsApi service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authHeader.mockReturnValue({ Authorization: 'Bearer token' });
  });

  test('getDetail calls http.get and returns data', async () => {
    const mockData = { id: 1, title: 'Test Novel' };
    http.get.mockResolvedValue({ data: { data: mockData } });

    const result = await novelsApi.getDetail(1);

    expect(http.get).toHaveBeenCalledWith('/novels/1', {
      headers: { Authorization: 'Bearer token' },
    });
    expect(result).toEqual(mockData);
  });

  test('vote calls http.post and returns vote result', async () => {
    const mockVote = { novelId: 1, voteCount: 10, remainedYuan: 5 };
    http.post.mockResolvedValue({ data: { data: mockVote } });

    const result = await novelsApi.vote(1);

    expect(http.post).toHaveBeenCalledWith(
      '/novels/1/vote',
      {},
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(result).toEqual(mockVote);
  });

  test('coverUrl calls toAbsoluteUrl', () => {
    toAbsoluteUrl.mockReturnValue('http://example.com/cover.jpg');

    const result = novelsApi.coverUrl('cover.jpg');

    expect(toAbsoluteUrl).toHaveBeenCalledWith('cover.jpg');
    expect(result).toBe('http://example.com/cover.jpg');
  });

  test('getChapters calls http.get and returns chapters', async () => {
    const mockChapters = [{ id: 1, title: 'Chapter 1' }];
    http.get.mockResolvedValue({ data: { data: mockChapters } });

    const result = await novelsApi.getChapters(1);

    expect(http.get).toHaveBeenCalledWith(
      '/chapters/novel/1?page=1&pageSize=1&publishedOnly=true',
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(result).toEqual(mockChapters);
  });

  test('getChaptersFull calls http.get and returns all chapters', async () => {
    const mockChapters = [
      { id: 1, title: 'Chapter 1' },
      { id: 2, title: 'Chapter 2' },
    ];
    http.get.mockResolvedValue({ data: { data: mockChapters } });

    const result = await novelsApi.getChaptersFull(1);

    expect(http.get).toHaveBeenCalledWith(
      '/chapters/novel/1?page=1&pageSize=1000&publishedOnly=true',
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(result).toEqual(mockChapters);
  });

  test('getChapterContent calls http.get and returns chapter content', async () => {
    const mockContent = { id: 1, content: 'Chapter text' };
    http.get.mockResolvedValue({ data: { data: mockContent } });

    const result = await novelsApi.getChapterContent(1, 1);

    expect(http.get).toHaveBeenCalledWith('/chapters/novel/1/number/1', {
      headers: { Authorization: 'Bearer token' },
    });
    expect(result).toEqual(mockContent);
  });

  test('getChapterByUuid calls http.get and returns chapter', async () => {
    const mockChapter = { id: 1, content: 'Chapter text' };
    http.get.mockResolvedValue({ data: { data: mockChapter } });

    const result = await novelsApi.getChapterByUuid('uuid-123');

    expect(http.get).toHaveBeenCalledWith('/chapters/uuid-123', {
      headers: { Authorization: 'Bearer token' },
    });
    expect(result).toEqual(mockChapter);
  });
});
