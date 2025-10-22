/* eslint-env jest */
import { formatCommentTime } from '../time';

describe('formatCommentTime', () => {
  const RealRTF = globalThis?.Intl?.RelativeTimeFormat;

  beforeAll(() => {
    // deterministic mock for RelativeTimeFormat
    class MockRTF {
      constructor() {}
      format(value, unit) {
        // return a stable string we can assert against
        return `${value} ${unit}`;
      }
    }
    // @ts-ignore
    globalThis.Intl = {
      ...globalThis.Intl,
      RelativeTimeFormat: MockRTF,
    };
  });

  afterAll(() => {
    if (RealRTF) {
      globalThis.Intl.RelativeTimeFormat = RealRTF;
    }
  });

  test('returns empty string for invalid date strings', () => {
    expect(formatCommentTime('not-a-date')).toBe('');
    // undefined may be treated as "now" or invalid depending on impl; only assert it's a string
    const u = formatCommentTime(undefined);
    expect(typeof u).toBe('string');
  });

  test('null is treated as epoch (valid Date) and returns a string', () => {
    const out = formatCommentTime(null);
    expect(typeof out).toBe('string');
    // should match the mocked RTF pattern like "-56 year" or similar numeric+unit
    expect(out).toMatch(/-?\d+\s+\w+/);
  });

  test('formats a past time (minutes ago)', () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const out = formatCommentTime(fiveMinAgo);
    // our mock returns something like "-5 minute"
    expect(out).toMatch(/-5\s+minute/);
  });

  test('formats a future time (seconds/minutes)', () => {
    const in30Sec = Date.now() + 30 * 1000;
    const out = formatCommentTime(in30Sec);
    // ~30 seconds in future -> "30 second" (or small variance)
    expect(out).toMatch(/\d+\s+second/);
  });

  test('uses larger units when appropriate (days/years)', () => {
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    expect(formatCommentTime(oneYearAgo)).toMatch(/-1\s+year/);

    const fortyDaysAgo = Date.now() - 40 * 24 * 60 * 60 * 1000;
    // Accept month or days depending on implementation
    expect(formatCommentTime(fortyDaysAgo)).toMatch(/-1\s+month|-\d+\s+day/);
  });
});
