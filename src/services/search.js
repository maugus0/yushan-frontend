import { http, authHeader } from './_http';

const searchService = {
  async searchUsers(keyword, page = 1, pageSize = 10) {
    try {
      const res = await http.get('/search/users', {
        params: {
          keyword,
          page,
          pageSize,
          sortBy: 'created_at',
          sortOrder: 'DESC',
        },
        headers: authHeader(),
      });

      // Handle both nested (res.data.data) and flat (res.data) response formats
      const data = res?.data?.data || res?.data || {};

      return {
        users: data.users || [],
        userCount: data.userCount || 0,
      };
    } catch (error) {
      console.error('Search users error:', error);
      return { users: [], userCount: 0 };
    }
  },

  async searchNovels(keyword, page = 1, pageSize = 10) {
    try {
      const res = await http.get('/search/novels', {
        params: {
          keyword,
          page,
          pageSize,
          sortBy: 'created_at',
          sortOrder: 'DESC',
        },
        headers: authHeader(),
      });

      // Handle both nested (res.data.data) and flat (res.data) response formats
      const data = res?.data?.data || res?.data || {};

      return {
        novels: data.novels || [],
        novelCount: data.novelCount || 0,
      };
    } catch (error) {
      console.error('Search novels error:', error);
      return { novels: [], novelCount: 0 };
    }
  },

  async searchAll(keyword, page = 1, pageSize = 10) {
    try {
      const [usersResult, novelsResult] = await Promise.all([
        this.searchUsers(keyword, page, pageSize),
        this.searchNovels(keyword, page, pageSize),
      ]);

      return {
        users: usersResult.users || [],
        userCount: usersResult.userCount || 0,
        novels: novelsResult.novels || [],
        novelCount: novelsResult.novelCount || 0,
      };
    } catch (error) {
      console.error('Search all error:', error);
      return {
        users: [],
        userCount: 0,
        novels: [],
        novelCount: 0,
      };
    }
  },
};

export default searchService;
