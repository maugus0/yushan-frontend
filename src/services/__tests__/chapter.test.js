// src/api/__tests__/chapter.test.js
import axios from 'axios';
import chapterService from '../chapter';

jest.mock('axios');

describe('chapterService (robust tests, minimal fragile assertions)', () => {
  // Spy on localStorage.getItem to return a token when called by authHeader()
  let getItemSpy;

  beforeAll(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'jwt_token') return 'testtoken';
      return null;
    });
  });

  afterAll(() => {
    getItemSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createChapters - success returns created chapter', async () => {
    const payload = { title: 'New Chapter', novelId: 10 };
    const mockResp = { id: 123, ...payload };
    axios.post.mockResolvedValue({ data: mockResp });

    const result = await chapterService.createChapters(payload);
    expect(result).toEqual(mockResp);
    // only assert that axios.post was called and url contains /chapters
    expect(axios.post).toHaveBeenCalled();
    expect(axios.post.mock.calls[0][0]).toEqual(expect.stringContaining('/chapters'));
  });

  test('createChapters - 400 invalid data throws message from response', async () => {
    axios.post.mockRejectedValue({
      response: { status: 400, data: { message: 'Bad payload' } },
    });

    await expect(chapterService.createChapters({})).rejects.toThrow('Bad payload');
  });

  test('editChapters - success returns edited chapter', async () => {
    const payload = { id: 1, title: 'Edited', novelId: 5 };
    axios.put.mockResolvedValue({ data: payload });

    const result = await chapterService.editChapters(payload);
    expect(result).toEqual(payload);
    expect(axios.put).toHaveBeenCalled();
    expect(axios.put.mock.calls[0][0]).toEqual(expect.stringContaining('/chapters'));
  });

  test('editChapters - 404 throws Chapter not found', async () => {
    axios.put.mockRejectedValue({ response: { status: 404 } });
    await expect(chapterService.editChapters({ id: 999 })).rejects.toThrow('Chapter not found');
  });

  test('getChapterByNovelId - success returns chapters array', async () => {
    const novelId = 20;
    const mockChapters = [
      { id: 1, novelId },
      { id: 2, novelId },
    ];
    axios.get.mockResolvedValue({ data: mockChapters });

    const result = await chapterService.getChapterByNovelId(novelId, 1, 10);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].novelId).toBe(novelId);
    expect(axios.get).toHaveBeenCalled();
    expect(axios.get.mock.calls[0][0]).toEqual(
      expect.stringContaining(`/chapters/novel/${novelId}`)
    );
  });

  test('getChapterByNovelId - 404 throws Novel or chapters not found', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    await expect(chapterService.getChapterByNovelId(999)).rejects.toThrow(
      'Novel or chapters not found'
    );
  });

  test('getChapterByNovelId - network error throws network message', async () => {
    axios.get.mockRejectedValue({ request: {} });
    await expect(chapterService.getChapterByNovelId(1)).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('getNextChapterNumber - success returns number', async () => {
    axios.get.mockResolvedValue({ data: 7 });
    const result = await chapterService.getNextChapterNumber(5);
    expect(result).toBe(7);
    expect(axios.get).toHaveBeenCalled();
    expect(axios.get.mock.calls[0][0]).toEqual(expect.stringContaining('/next-number'));
  });

  test('getNextChapterNumber - 404 throws Novel not found', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    await expect(chapterService.getNextChapterNumber(999)).rejects.toThrow('Novel not found');
  });

  test('deleteChapterByChapterId - success returns server response', async () => {
    axios.delete.mockResolvedValue({ data: { success: true } });
    const res = await chapterService.deleteChapterByChapterId(42);
    expect(res).toEqual({ success: true });
    expect(axios.delete).toHaveBeenCalled();
    expect(axios.delete.mock.calls[0][0]).toEqual(expect.stringContaining('/chapters/42'));
  });

  test('deleteChapterByChapterId - 401 throws session expired', async () => {
    axios.delete.mockRejectedValue({ response: { status: 401 } });
    await expect(chapterService.deleteChapterByChapterId(42)).rejects.toThrow(
      'Session expired. Please login again'
    );
  });

  test('getChapterByChapterId - success returns chapter', async () => {
    const mockChapter = { id: 88, title: 'c1', novelId: 3 };
    axios.get.mockResolvedValue({ data: mockChapter });
    const res = await chapterService.getChapterByChapterId(88);
    expect(res).toEqual(mockChapter);
    expect(axios.get).toHaveBeenCalled();
    expect(axios.get.mock.calls[0][0]).toEqual(expect.stringContaining('/chapters/88'));
  });

  test('getChapterByChapterId - request error throws network message', async () => {
    axios.get.mockRejectedValue({ request: {} });
    await expect(chapterService.getChapterByChapterId(999)).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('generic error path for createChapters throws original error message', async () => {
    axios.post.mockRejectedValue(new Error('something went wrong'));
    await expect(chapterService.createChapters({ title: 'x' })).rejects.toThrow(
      'something went wrong'
    );
  });
});

describe('chapterService error branches (extra coverage)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createChapters - 401 Session expired', async () => {
    axios.post.mockRejectedValue({ response: { status: 401 } });
    await expect(chapterService.createChapters({})).rejects.toThrow(
      'Session expired. Please login again'
    );
  });

  test('createChapters - 404 not found', async () => {
    axios.post.mockRejectedValue({ response: { status: 404 } });
    await expect(chapterService.createChapters({})).rejects.toThrow('Novel or chapter not found');
  });

  test('createChapters - 500 server error', async () => {
    axios.post.mockRejectedValue({ response: { status: 500 } });
    await expect(chapterService.createChapters({})).rejects.toThrow(
      'Server error. Please try again later'
    );
  });

  test('createChapters - unknown response error', async () => {
    axios.post.mockRejectedValue({ response: { status: 418, data: { error: 'I am a teapot' } } });
    await expect(chapterService.createChapters({})).rejects.toThrow('I am a teapot');
  });

  test('editChapters - 401', async () => {
    axios.put.mockRejectedValue({ response: { status: 401 } });
    await expect(chapterService.editChapters({})).rejects.toThrow(
      'Session expired. Please login again'
    );
  });

  test('editChapters - 500', async () => {
    axios.put.mockRejectedValue({ response: { status: 500 } });
    await expect(chapterService.editChapters({})).rejects.toThrow(
      'Server error. Please try again later'
    );
  });

  test('getNextChapterNumber - 401', async () => {
    axios.get.mockRejectedValue({ response: { status: 401 } });
    await expect(chapterService.getNextChapterNumber(1)).rejects.toThrow(
      'Session expired. Please login again'
    );
  });

  test('getNextChapterNumber - 500', async () => {
    axios.get.mockRejectedValue({ response: { status: 500 } });
    await expect(chapterService.getNextChapterNumber(1)).rejects.toThrow(
      'Server error. Please try again later'
    );
  });

  test('deleteChapterByChapterId - 404', async () => {
    axios.delete.mockRejectedValue({ response: { status: 404 } });
    await expect(chapterService.deleteChapterByChapterId(1)).rejects.toThrow('Chapter not found');
  });

  test('deleteChapterByChapterId - 500', async () => {
    axios.delete.mockRejectedValue({ response: { status: 500 } });
    await expect(chapterService.deleteChapterByChapterId(1)).rejects.toThrow(
      'Server error. Please try again later'
    );
  });

  test('getChapterByChapterId - 401', async () => {
    axios.get.mockRejectedValue({ response: { status: 401 } });
    await expect(chapterService.getChapterByChapterId(1)).rejects.toThrow(
      'Session expired. Please login again'
    );
  });

  test('getChapterByChapterId - 404', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    await expect(chapterService.getChapterByChapterId(1)).rejects.toThrow('Chapter not found');
  });

  test('getChapterByChapterId - 500', async () => {
    axios.get.mockRejectedValue({ response: { status: 500 } });
    await expect(chapterService.getChapterByChapterId(1)).rejects.toThrow(
      'Server error. Please try again later'
    );
  });
});

describe('chapterService - request and generic error coverage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createChapters - network request error (error.request exists)', async () => {
    axios.post.mockRejectedValue({ request: {} });
    await expect(chapterService.createChapters({ title: 'x' })).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('editChapters - network request error', async () => {
    axios.put.mockRejectedValue({ request: {} });
    await expect(chapterService.editChapters({ title: 'x' })).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('getChapterByNovelId - generic Error object', async () => {
    axios.get.mockRejectedValue(new Error('Unexpected failure'));
    await expect(chapterService.getChapterByNovelId(2)).rejects.toThrow('Unexpected failure');
  });

  test('getNextChapterNumber - network request error', async () => {
    axios.get.mockRejectedValue({ request: {} });
    await expect(chapterService.getNextChapterNumber(123)).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('deleteChapterByChapterId - request network error', async () => {
    axios.delete.mockRejectedValue({ request: {} });
    await expect(chapterService.deleteChapterByChapterId(55)).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('deleteChapterByChapterId - generic Error object', async () => {
    axios.delete.mockRejectedValue(new Error('Delete failed'));
    await expect(chapterService.deleteChapterByChapterId(55)).rejects.toThrow('Delete failed');
  });

  test('getChapterByChapterId - request error (network)', async () => {
    axios.get.mockRejectedValue({ request: {} });
    await expect(chapterService.getChapterByChapterId(66)).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('getChapterByChapterId - generic unknown error message', async () => {
    axios.get.mockRejectedValue(new Error());
    await expect(chapterService.getChapterByChapterId(99)).rejects.toThrow(
      'Failed to fetch chapter'
    );
  });
});
