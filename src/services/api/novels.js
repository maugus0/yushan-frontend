import { httpClient } from '../httpClient';

// Import fallback image
import fallbackImage from '../../assets/images/novel_default.png';

const BASE_URL = 'https://yushan-backend-staging.up.railway.app/api';

export const getNovels = async (params = {}) => {
  try {
    const defaultParams = {
      page: 0,
      size: 10,
      sort: 'createTime',
      order: 'desc',
    };

    const queryParams = { ...defaultParams, ...params };
    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const response = await httpClient.get(`${BASE_URL}/novels?${searchParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching novels:', error);
    throw error;
  }
};

// Helper function to transform API data to match component expectations
const transformNovelData = (novels) => {
  return novels.map((novel) => ({
    id: novel.id,
    title: novel.title,
    author: novel.authorUsername,
    // Handle cover image URL - if it's just a filename, you might need to prefix with your image base URL
    cover: novel.coverImgUrl?.startsWith('http')
      ? novel.coverImgUrl
      : novel.coverImgUrl
        ? `https://yushan-backend-staging.up.railway.app/images/${novel.coverImgUrl}`
        : fallbackImage, // fallback image
    category: novel.categoryName,
    status: novel.isCompleted ? 'Completed' : 'Ongoing',
    description: novel.synopsis,
    rating: parseFloat(novel.avgRating?.toFixed(1)) || 0,
    chapters: novel.chapterCnt,
    tags: [novel.categoryName], // You can extend this based on available data
    // Additional fields from API
    uuid: novel.uuid,
    authorId: novel.authorId,
    categoryId: novel.categoryId,
    wordCnt: novel.wordCnt,
    reviewCnt: novel.reviewCnt,
    viewCnt: novel.viewCnt,
    voteCnt: novel.voteCnt,
    yuanCnt: novel.yuanCnt,
    publishTime: novel.publishTime,
    createTime: novel.createTime,
    updateTime: novel.updateTime,
  }));
};

// Specific functions for different novel categories
export const getWeeklyFeaturedNovels = async () => {
  try {
    const response = await getNovels({
      size: 20, // Fetch more to ensure we get 8 after any filtering
      sort: 'createTime', // Get newest 8 novels
      order: 'desc',
      status: 'PUBLISHED', // Only get published novels
    });
    const novels = response.data?.content || [];
    return {
      ...response,
      content: transformNovelData(novels.slice(0, 8)), // Limit to exactly 8 novels
    };
  } catch (error) {
    console.error('Error fetching weekly featured novels:', error);
    return { content: [] };
  }
};

export const getOngoingNovels = async () => {
  try {
    const response = await getNovels({
      size: 20, // Fetch 20 novels for better filtering
      sort: 'createTime',
      order: 'desc',
      status: 'PUBLISHED', // Only get published novels
    });

    const allNovels = response.data?.content || [];

    // Filter for ongoing novels (status: PUBLISHED and isCompleted: false)
    const ongoingNovels = allNovels.filter(
      (novel) => novel.status === 'PUBLISHED' && novel.isCompleted === false
    );

    return {
      ...response,
      content: transformNovelData(ongoingNovels.slice(0, 8)), // Limit to exactly 8 novels
    };
  } catch (error) {
    console.error('Error fetching ongoing novels:', error);
    return { content: [] };
  }
};

export const getCompletedNovels = async () => {
  try {
    const response = await getNovels({
      size: 100, // Fetch 100 to ensure we get 8 completed after filtering
      sort: 'createTime', // Sort by creation time instead of rating
      order: 'desc', // Newest first (changed from asc)
      status: 'PUBLISHED', // Only get published novels
    });

    const allNovels = response.data?.content || [];

    // Filter for completed novels (status: PUBLISHED and isCompleted: true)
    const completedNovels = allNovels.filter(
      (novel) => novel.status === 'PUBLISHED' && novel.isCompleted === true
    );

    // Return 8 oldest completed novels
    return {
      content: transformNovelData(completedNovels.slice(0, 8)),
    };
  } catch (error) {
    console.error('Error fetching completed novels:', error);
    return { content: [] };
  }
};

export const getNewestNovels = async () => {
  try {
    const response = await getNovels({
      size: 3,
      sort: 'createTime',
      order: 'desc',
      status: 'PUBLISHED', // Only get published novels
    });
    return {
      ...response,
      content: transformNovelData(response.data?.content || []),
    };
  } catch (error) {
    console.error('Error fetching newest novels:', error);
    return { content: [] };
  }
};
