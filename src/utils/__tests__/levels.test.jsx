import {
  xpToLevel,
  levelMeta,
  freeTicketsPerWeek,
  freeTicketsPerDay,
  XpEarningRules,
} from '../levels';

describe('levels utilities', () => {
  test('xpToLevel maps XP to correct level boundaries', () => {
    expect(xpToLevel(0)).toBe(1);
    expect(xpToLevel(50)).toBe(1);
    expect(xpToLevel(99)).toBe(1);
    expect(xpToLevel(100)).toBe(2);
    expect(xpToLevel(499)).toBe(2);
    expect(xpToLevel(500)).toBe(3);
    expect(xpToLevel(1999)).toBe(3);
    expect(xpToLevel(2000)).toBe(4);
    expect(xpToLevel(4999)).toBe(4);
    expect(xpToLevel(5000)).toBe(5);
    expect(xpToLevel(100000)).toBe(5);
  });

  test('levelMeta returns metadata and falls back to level 1 for unknown', () => {
    const meta3 = levelMeta(3);
    expect(meta3).toHaveProperty('level', 3);
    expect(meta3).toHaveProperty('title', 'Enthusiast');

    const unknown = levelMeta(999);
    expect(unknown).toHaveProperty('level', 1);
  });

  test('freeTicketsPerWeek and freeTicketsPerDay compute correctly', () => {
    expect(freeTicketsPerWeek(1)).toBe(1);
    expect(freeTicketsPerWeek(5)).toBe(5);

    // per day: weekly / 7 rounded to 1 decimal
    expect(freeTicketsPerDay(1)).toBe(0.1); // 1/7 -> 0.142857 -> 0.1
    expect(freeTicketsPerDay(5)).toBe(0.7); // 5/7 -> 0.714285 -> 0.7
  });

  test('XpEarningRules contains expected rules and shapes', () => {
    expect(Array.isArray(XpEarningRules)).toBe(true);
    const keys = XpEarningRules.map((r) => r.key);
    expect(keys).toEqual(
      expect.arrayContaining(['daily-login', 'read-chapter', 'vote-novel', 'review-comment'])
    );
    const readRule = XpEarningRules.find((r) => r.key === 'read-chapter');
    expect(readRule).toHaveProperty('xp', 2);
  });
});
