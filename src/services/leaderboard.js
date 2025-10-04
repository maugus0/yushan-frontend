import { xpToLevel } from '../utils/levels';

const GENRES = [
  'Action',
  'Adventure',
  'Martial Arts',
  'Fantasy',
  'Sci-Fi',
  'Urban',
  'Historical',
  'Eastern Fantasy',
  'Wuxia',
  'Xianxia',
  'Military',
  'Sports',
  'Romance',
  'Drama',
  'Slice of Life',
  'School Life',
  'Comedy',
];

const genreSlug = (g) => g.toLowerCase().replace(/\s+/g, '-');

const seedRand = (seed) => {
  let t = seed % 2147483647;
  return () => (t = (t * 48271) % 2147483647) / 2147483647;
};
const timeWeight = (timeRange) =>
  timeRange === 'weekly' ? 0.8 : timeRange === 'monthly' ? 0.9 : 1;

// Move computeWriterScores function here to avoid circular dependency
const computeWriterScores = (writers) => {
  return writers.map((writer) => {
    // Calculate composite score based on books, votes, and views
    const booksScore = (writer.books || 0) * 1000;
    const votesScore = (writer.votes || 0) * 0.1;
    const viewsScore = (writer.views || 0) * 0.01;

    const totalScore = booksScore + votesScore + viewsScore;

    return {
      ...writer,
      score: Math.round(totalScore),
    };
  });
};

function generateMock() {
  const rnd = seedRand(1008611);

  const novels = Array.from({ length: 160 }).map((_, i) => {
    const id = i + 1;

    // Ensure each category has sufficient novels - use round-robin assignment
    const primaryGenre = GENRES[i % GENRES.length];

    // Generate 1-3 tags, ensuring the first tag is the primary genre
    const numTags = Math.floor(rnd() * 3) + 1;
    const otherGenres = GENRES.filter((g) => g !== primaryGenre).sort(() => rnd() - 0.5);
    const tags = [primaryGenre, ...otherGenres.slice(0, numTags - 1)];

    const views = Math.floor(rnd() * 800_000 + id * 300);
    const votes = Math.floor(rnd() * 10_000 + (id % 50) * 7);

    const novel = {
      id,
      novelId: id,
      title: `Novel #${id}`, // Ensure every novel has a title
      cover: `https://picsum.photos/seed/novel_${id}/120/120`,
      genre: primaryGenre,
      genreSlug: genreSlug(primaryGenre),
      tags: tags, // Ensure every novel has tags
      views,
      votes,
    };

    // Debug log for first 5 novels
    if (i < 5) {
      console.log(`Novel ${id}:`, {
        id: novel.id,
        novelId: novel.novelId,
        title: novel.title,
        tags: novel.tags,
        hasTitle: !!novel.title,
        titleType: typeof novel.title,
      });
    }

    return novel;
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

  console.log('Total novels generated:', novels.length);
  console.log(
    'Sample novels check:',
    novels.slice(0, 3).map((n) => ({
      id: n.id,
      title: n.title,
      hasTitle: !!n.title,
      tags: n.tags,
    }))
  );

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
  let list = MOCK.novels.map((n) => ({
    ...n,
    views: Math.floor(n.views * w),
    votes: Math.floor(n.votes * w),
  }));

  console.log('getNovelsLeaderboard called with:', { timeRange, genre, sortBy, page, pageSize });
  console.log('Total novels before filtering:', list.length);

  // Check titles before filtering
  const titlesBeforeFilter = list.slice(0, 5).map((n) => ({
    id: n.id,
    title: n.title,
    hasTitle: !!n.title,
  }));
  console.log('Sample titles before filter:', titlesBeforeFilter);

  // Improved genre filtering logic
  if (genre && genre !== 'all') {
    const originalCount = list.length;

    list = list.filter((n) => {
      // Direct genre name comparison (case insensitive)
      if (n.genre && n.genre.toLowerCase() === genre.toLowerCase()) return true;

      // Check if tags array contains matching genre (case insensitive)
      if (n.tags && n.tags.some((tag) => tag.toLowerCase() === genre.toLowerCase())) return true;

      // Handle URL-friendly format (hyphen to space conversion)
      const genreWithSpaces = genre.replace(/-/g, ' ');
      if (n.genre && n.genre.toLowerCase() === genreWithSpaces.toLowerCase()) return true;
      if (n.tags && n.tags.some((tag) => tag.toLowerCase() === genreWithSpaces.toLowerCase()))
        return true;

      return false;
    });

    console.log(`Filtered from ${originalCount} to ${list.length} novels for genre: ${genre}`);
  }

  if (sortBy === 'votes') list.sort((a, b) => b.votes - a.votes);
  else list.sort((a, b) => b.views - a.views);

  // Check titles after sorting
  const titlesAfterSort = list.slice(0, 5).map((n) => ({
    id: n.id,
    title: n.title,
    hasTitle: !!n.title,
    titleType: typeof n.title,
  }));
  console.log('Sample titles after sort:', titlesAfterSort);

  const paginatedResult = paginate(list, page, pageSize);

  // Check final paginated result
  console.log(
    'Final paginated result sample:',
    paginatedResult.items.slice(0, 3).map((n) => ({
      id: n.id,
      novelId: n.novelId,
      title: n.title,
      hasTitle: !!n.title,
      tags: n.tags,
    }))
  );

  return simulateLatency(paginatedResult);
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
  let list = MOCK.writers.map((wrt) => ({
    ...wrt,
    views: Math.floor(wrt.views * w),
    votes: Math.floor(wrt.votes * w),
  }));
  let withScore = computeWriterScores(list);

  if (sortBy === 'books') withScore.sort((a, b) => (b.books ?? 0) - (a.books ?? 0));
  else if (sortBy === 'views') withScore.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  else if (sortBy === 'votes') withScore.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));

  return simulateLatency(paginate(withScore, page, pageSize));
}
