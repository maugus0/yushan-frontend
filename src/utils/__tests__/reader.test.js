import { saveProgress, getProgress } from '../reader';

describe('reader progress persistence', () => {
  const KEY = 'yushan.reader.progress.v1';

  beforeEach(() => {
    localStorage.clear();
    jest.useRealTimers();
  });

  test('saveProgress ignores calls without novelId or chapterId', () => {
    saveProgress({ novelId: null, chapterId: 'c1', progress: 0.5 });
    expect(localStorage.getItem(KEY)).toBeNull();

    saveProgress({ novelId: 'n1', chapterId: null, progress: 0.5 });
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  test('saveProgress stores and getProgress retrieves clamped values and metadata', () => {
    const novelId = 'novel-123';
    saveProgress({
      novelId,
      chapterId: 'ch-1',
      progress: 1.5, // should be clamped to 1
      scrollOffset: 42,
    });

    const raw = localStorage.getItem(KEY);
    expect(raw).toBeTruthy();

    const stored = getProgress(novelId);
    expect(stored).not.toBeNull();
    expect(stored.novelId).toBe(novelId);
    expect(stored.chapterId).toBe('ch-1');
    expect(stored.progress).toBe(1); // clamped
    expect(stored.scrollOffset).toBe(42);
    expect(stored.updatedAt).toBeTruthy();
  });

  test('progress lower bound clamps to 0 and multiple novels are preserved', () => {
    saveProgress({
      novelId: 'nA',
      chapterId: 'cA',
      progress: -5,
    });
    saveProgress({
      novelId: 'nB',
      chapterId: 'cB',
      progress: 0.3,
    });

    const a = getProgress('nA');
    const b = getProgress('nB');

    expect(a.progress).toBe(0);
    expect(b.progress).toBeCloseTo(0.3);
  });

  test('getProgress returns null for unknown id and recovers from malformed storage', () => {
    expect(getProgress('missing')).toBeNull();

    // simulate malformed JSON in localStorage
    localStorage.setItem(KEY, 'not a json');
    // getProgress should handle parse error and return null for any id
    expect(getProgress('any')).toBeNull();
  });
});
