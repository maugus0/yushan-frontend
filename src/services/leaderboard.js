import { computeWriterScores } from '../utils/leaderboard';
import { xpToLevel } from '../utils/levels';

const GENRES = [
  'Action','Adventure','Fantasy','Sci-Fi','Romance','Drama','Comedy','Wuxia','Xianxia','Historical','Sports','Urban',
];
const genreSlug = (g) => g.toLowerCase().replace(/\s+/g, '-');

const seedRand = (seed) => {
  let t = seed % 2147483647;
  return () => (t = (t * 48271) % 2147483647) / 2147483647;
};
const timeWeight = (timeRange) => (timeRange === 'weekly' ? 0.8 : timeRange === 'monthly' ? 0.9 : 1);

function generateMock() {
  const rnd = seedRand(1008611);

  const novels = Array.from({ length: 160 }).map((_, i) => {
    const g = GENRES[i % GENRES.length];
    const id = i + 1;
    const views = Math.floor(rnd() * 800_000 + id * 300);
    const votes = Math.floor(rnd() * 10_000 + (id % 50) * 7);
    return {
      id,
      novelId: id,
      title: `Novel #${id}`,
      cover: `https://picsum.photos/seed/novel_${id}/120/120`,
      genre: g,
      genreSlug: genreSlug(g),
      views,
      votes,
    };
  });

  const users = Array.from({ length: 300 }).map((_, i) => {
    const id = i + 1;
    const xp = Math.floor(rnd() * 50_000 + (id % 20) * 37);
    return {
      userId: id,
      username: `user_${String(id).padStart(3, '0')}`,
      avatar: `https://i.pravatar.cc/120?img=${(id % 70) + 1}`,
      xp,
      level: xpToLevel(xp),
    };
  });

  const writers = Array.from({ length: 120 }).map((_, i) => {
    const id = i + 1;
    const books = 1 + (id % 14);
    const views = Math.floor(rnd() * 3_000_000 + id * 700);
    const votes = Math.floor(rnd() * 80_000 + (id % 60) * 11);
    return {
      writerId: id,
      name: `writer_${String(id).padStart(3, '0')}`,
      avatar: `https://i.pravatar.cc/120?img=${(id % 70) + 1}`,
      books,
      views,
      votes,
    };
  });

  return { novels, users, writers };
}

const MOCK = generateMock();

function simulateLatency(result, ms = 260) {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

function paginate(items, page, pageSize) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { items: items.slice(start, end), total };
}

export async function getNovelsLeaderboard({ timeRange, genre, sortBy, page, pageSize }) {
  const w = timeWeight(timeRange);
  let list = MOCK.novels.map((n) => ({ ...n, views: Math.floor(n.views * w), votes: Math.floor(n.votes * w) }));
  if (genre && genre !== 'all') list = list.filter((n) => n.genreSlug === genre);
  if (sortBy === 'votes') list.sort((a, b) => b.votes - a.votes);
  else list.sort((a, b) => b.views - a.views);
  return simulateLatency(paginate(list, page, pageSize));
}

export async function getUsersLeaderboard({ timeRange, sortBy, page, pageSize }) {
  const w = timeWeight(timeRange);
  let list = MOCK.users.map((u) => ({ ...u, xp: Math.floor(u.xp * w) }));
  list = list.map((u) => ({ ...u, level: xpToLevel(u.xp) }));

  if (sortBy === 'xp') list.sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
  else list.sort((a, b) => (b.level ?? 0) - (a.level ?? 0) || (b.xp ?? 0) - (a.xp ?? 0));

  return simulateLatency(paginate(list, page, pageSize));
}

export async function getWritersLeaderboard({ timeRange, sortBy, page, pageSize }) {
  const w = timeWeight(timeRange);
  let list = MOCK.writers.map((wrt) => ({ ...wrt, views: Math.floor(wrt.views * w), votes: Math.floor(wrt.votes * w) }));
  let withScore = computeWriterScores(list);

  if (sortBy === 'books') withScore.sort((a, b) => (b.books ?? 0) - (a.books ?? 0));
  else if (sortBy === 'views') withScore.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  else if (sortBy === 'votes') withScore.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  // default/score uses computeWriterScores order

  return simulateLatency(paginate(withScore, page, pageSize));
}