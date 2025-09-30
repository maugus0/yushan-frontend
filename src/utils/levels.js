const LEVELS = [
  { level: 1, minXp: 0,    maxXp: 99,   weeklyTickets: 1, title: 'Newbie' },
  { level: 2, minXp: 100,  maxXp: 499,  weeklyTickets: 2, title: 'Explorer' },
  { level: 3, minXp: 500,  maxXp: 1999, weeklyTickets: 3, title: 'Enthusiast' },
  { level: 4, minXp: 2000, maxXp: 4999, weeklyTickets: 4, title: 'Master Reader' },
  { level: 5, minXp: 5000, maxXp: Infinity, weeklyTickets: 5, title: 'Legend' },
];

export function xpToLevel(xp = 0) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i].level;
  }
  return 1;
}
export function levelMeta(level = 1) {
  return LEVELS.find((l) => l.level === level) || LEVELS[0];
}
export function freeTicketsPerWeek(level = 1) {
  return levelMeta(level).weeklyTickets;
}
export function freeTicketsPerDay(level = 1) {
  const perDay = freeTicketsPerWeek(level) / 7;
  return Math.round(perDay * 10) / 10;
}
export const XpEarningRules = [
  { key: 'daily-login', label: 'Daily login', xp: +5 },
  { key: 'read-chapter', label: 'Read a chapter', xp: +2 },
  { key: 'vote-novel', label: 'Vote for a novel', xp: +3 },
  { key: 'review-comment', label: 'Review/Comment', xp: +5 },
];