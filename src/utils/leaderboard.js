// Mock data for testing
const mockNovels = [
  {
    id: 1,
    novelId: 1,
    title: 'Cultivation Journey',
    cover: 'https://picsum.photos/200/300?random=1',
    views: 1250000,
    votes: 85000,
    tags: ['Xianxia', 'Action', 'Adventure'],
  },
  {
    id: 2,
    novelId: 2,
    title: 'Urban Immortal',
    cover: 'https://picsum.photos/200/300?random=2',
    views: 980000,
    votes: 72000,
    tags: ['Urban', 'Fantasy', 'Romance'],
  },
  {
    id: 3,
    novelId: 3,
    title: 'Martial Peak',
    cover: 'https://picsum.photos/200/300?random=3',
    views: 875000,
    votes: 65000,
    tags: ['Martial Arts', 'Action', 'Adventure'],
  },
  {
    id: 4,
    novelId: 4,
    title: 'School Life Drama',
    cover: 'https://picsum.photos/200/300?random=4',
    views: 650000,
    votes: 48000,
    tags: ['School Life', 'Drama', 'Romance'],
  },
  {
    id: 5,
    novelId: 5,
    title: 'Eastern Fantasy Epic',
    cover: 'https://picsum.photos/200/300?random=5',
    views: 540000,
    votes: 39000,
    tags: ['Eastern Fantasy', 'Action'],
  },
  {
    id: 6,
    novelId: 6,
    title: 'Slice of Life Story',
    cover: 'https://picsum.photos/200/300?random=6',
    views: 420000,
    votes: 31000,
    tags: ['Slice of Life', 'Comedy'],
  },
  {
    id: 7,
    novelId: 7,
    title: 'Historical Romance',
    cover: 'https://picsum.photos/200/300?random=7',
    views: 380000,
    votes: 28000,
    tags: ['Historical', 'Romance', 'Drama'],
  },
  {
    id: 8,
    novelId: 8,
    title: 'Sci-Fi Adventure',
    cover: 'https://picsum.photos/200/300?random=8',
    views: 320000,
    votes: 24000,
    tags: ['Sci-Fi', 'Adventure', 'Action'],
  },
  {
    id: 9,
    novelId: 9,
    title: 'Military Action',
    cover: 'https://picsum.photos/200/300?random=9',
    views: 290000,
    votes: 21000,
    tags: ['Military', 'Action'],
  },
  {
    id: 10,
    novelId: 10,
    title: 'Sports Competition',
    cover: 'https://picsum.photos/200/300?random=10',
    views: 250000,
    votes: 18000,
    tags: ['Sports', 'Drama', 'School Life'],
  },
  // Continue with more novels to reach 100
  ...Array.from({ length: 90 }, (_, i) => {
    const id = i + 11;
    const categories = [
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
    const randomCategories = categories
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    return {
      id,
      novelId: id,
      title: `Novel Title ${id}`,
      cover: `https://picsum.photos/200/300?random=${id}`,
      views: Math.floor(Math.random() * 200000) + 50000,
      votes: Math.floor(Math.random() * 15000) + 5000,
      tags: randomCategories,
    };
  }),
];

const mockUsers = [
  {
    userId: 1,
    username: 'BookLover123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BookLover123',
    xp: 5420, // Level 5: Legend
    level: 5,
  },
  {
    userId: 2,
    username: 'ReadingMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ReadingMaster',
    xp: 3850, // Level 4: Master Reader
    level: 4,
  },
  {
    userId: 3,
    username: 'NovelFan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NovelFan',
    xp: 1320, // Level 3: Enthusiast
    level: 3,
  },
  {
    userId: 4,
    username: 'StorySeeker',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StorySeeker',
    xp: 890, // Level 3: Enthusiast
    level: 3,
  },
  {
    userId: 5,
    username: 'PageTurner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PageTurner',
    xp: 340, // Level 2: Explorer
    level: 2,
  },
  // Continue with more users to reach 100, ensuring proper level distribution
  ...Array.from({ length: 95 }, (_, i) => {
    const id = i + 6;
    // Distribute XP across the 5 levels properly
    let xp, level;
    const rand = Math.random();
    if (rand < 0.1) {
      // 10% Legend (Level 5)
      xp = Math.floor(Math.random() * 5000) + 5000;
      level = 5;
    } else if (rand < 0.25) {
      // 15% Master Reader (Level 4)
      xp = Math.floor(Math.random() * 3000) + 2000;
      level = 4;
    } else if (rand < 0.5) {
      // 25% Enthusiast (Level 3)
      xp = Math.floor(Math.random() * 1500) + 500;
      level = 3;
    } else if (rand < 0.75) {
      // 25% Explorer (Level 2)
      xp = Math.floor(Math.random() * 400) + 100;
      level = 2;
    } else {
      // 25% Newbie (Level 1)
      xp = Math.floor(Math.random() * 100);
      level = 1;
    }

    return {
      userId: id,
      username: `User${id}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${id}`,
      xp,
      level,
    };
  }),
];

const mockWriters = [
  {
    writerId: 1,
    name: 'AuthorOne',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AuthorOne',
    books: 12,
    votes: 45000,
    views: 890000,
  },
  {
    writerId: 2,
    name: 'WriterTwo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WriterTwo',
    books: 8,
    votes: 38000,
    views: 720000,
  },
  {
    writerId: 3,
    name: 'NovelMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NovelMaster',
    books: 15,
    votes: 52000,
    views: 1200000,
  },
  // Continue with more writers to reach 100
  ...Array.from({ length: 97 }, (_, i) => {
    const id = i + 4;
    return {
      writerId: id,
      name: `Writer${id}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Writer${id}`,
      books: Math.floor(Math.random() * 10) + 1,
      votes: Math.floor(Math.random() * 30000) + 5000,
      views: Math.floor(Math.random() * 500000) + 100000,
    };
  }),
];

// Helper function to apply time range multipliers
const applyTimeRangeMultiplier = (data, timeRange) => {
  const multipliers = {
    weekly: { views: 0.1, votes: 0.15, xp: 0.2, books: 1 }, // Weekly data is much smaller
    monthly: { views: 0.3, votes: 0.4, xp: 0.5, books: 1 }, // Monthly data is smaller
    overall: { views: 1, votes: 1, xp: 1, books: 1 }, // Overall data is full
  };

  const mult = multipliers[timeRange] || multipliers.overall;

  return data.map((item) => ({
    ...item,
    views: Math.floor((item.views || 0) * mult.views),
    votes: Math.floor((item.votes || 0) * mult.votes),
    xp: Math.floor((item.xp || 0) * mult.xp),
    books: Math.floor((item.books || 0) * mult.books),
  }));
};

// Utility function to compute writer scores
// export const computeWriterScores = (writers) => {
//   return writers.map(writer => {
//     // Calculate composite score based on books, votes, and views
//     const booksScore = (writer.books || 0) * 1000;
//     const votesScore = (writer.votes || 0) * 0.1;
//     const viewsScore = (writer.views || 0) * 0.01;

//     const totalScore = booksScore + votesScore + viewsScore;

//     return {
//       ...writer,
//       score: Math.round(totalScore)
//     };
//   });
// };

// API functions
export const getNovelsLeaderboard = async (params = {}) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { page = 1, pageSize = 20, genre, sortBy = 'views', timeRange = 'overall' } = params;

  console.log('getNovelsLeaderboard called with params:', params); // Debug log

  let filteredNovels = [...mockNovels];

  // Apply time range multipliers to simulate different data for different time periods
  filteredNovels = applyTimeRangeMultiplier(filteredNovels, timeRange);

  // Filter by genre if specified
  if (genre && genre !== 'all') {
    filteredNovels = filteredNovels.filter((novel) =>
      novel.tags.some((tag) => tag.toLowerCase() === genre.toLowerCase())
    );
    console.log(`Filtered ${filteredNovels.length} novels for genre: ${genre}`); // Debug log
  }

  // Sort novels based on sortBy parameter
  filteredNovels.sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    if (sortBy === 'views') return b.views - a.views;
    return 0;
  });

  // Paginate results
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredNovels.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: filteredNovels.length,
    page,
    pageSize,
    hasMore: endIndex < filteredNovels.length,
  };
};

export const getUsersLeaderboard = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { page = 1, pageSize = 20, timeRange = 'overall' } = params;

  let sortedUsers = [...mockUsers];

  // Apply time range multipliers
  sortedUsers = applyTimeRangeMultiplier(sortedUsers, timeRange);

  // Sort by XP (descending)
  sortedUsers.sort((a, b) => (b.xp || 0) - (a.xp || 0));

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = sortedUsers.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: sortedUsers.length,
    page,
    pageSize,
    hasMore: endIndex < sortedUsers.length,
  };
};

export const getWritersLeaderboard = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const { page = 1, pageSize = 20, sortBy = 'books', timeRange = 'overall' } = params;

  let sortedWriters = [...mockWriters];

  // Apply time range multipliers
  sortedWriters = applyTimeRangeMultiplier(sortedWriters, timeRange);

  // Sort writers based on sortBy parameter
  sortedWriters.sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'books') return b.books - a.books;
    return 0;
  });

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = sortedWriters.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: sortedWriters.length,
    page,
    pageSize,
    hasMore: endIndex < sortedWriters.length,
  };
};
