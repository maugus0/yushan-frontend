import { httpClient } from '../httpClient';

// Import fallback image
import fallbackImage from '../../assets/images/novel_default.png';

const BASE_URL = 'https://yushan-backend-staging.up.railway.app/api';
const IMAGE_BASE_URL = 'https://yushan-backend-staging.up.railway.app/images';

// Extract gradient constant for reusability
export const GRADIENT_COLORS = 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #7C3AED 100%)';

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

// Helper function to handle image URL generation with fallback
const getImageUrl = (coverImgUrl) => {
  // If no image URL provided, return fallback
  if (!coverImgUrl) {
    return fallbackImage;
  }

  // If it's already a full URL (starts with http), use it
  if (coverImgUrl.startsWith('http')) {
    return coverImgUrl;
  }

  // Otherwise, construct the full URL with our base URL
  return `${IMAGE_BASE_URL}/${coverImgUrl}`;
};

// Helper function to transform API data to match component expectations
const transformNovelData = (novels) => {
  return novels.map((novel) => ({
    id: novel.id,
    title: novel.title,
    author: novel.authorUsername,
    cover: getImageUrl(novel.coverImgUrl),
    category: novel.categoryName,
    status: novel.isCompleted ? 'Completed' : 'Ongoing',
    description: novel.synopsis,
    rating: parseFloat(novel.avgRating?.toFixed(1)) || 0,
    chapters: novel.chapterCnt,
    tags: [novel.categoryName],
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
      size: 20,
      sort: 'createTime',
      order: 'desc',
      status: 'PUBLISHED',
    });
    const novels = response.data?.content || [];
    return {
      ...response,
      content: transformNovelData(novels.slice(0, 8)),
    };
  } catch (error) {
    console.error('Error fetching weekly featured novels:', error);
    // Return empty content with proper structure instead of throwing
    return { content: [] };
  }
};

export const getOngoingNovels = async () => {
  try {
    const response = await getNovels({
      size: 20,
      sort: 'createTime',
      order: 'desc',
      status: 'PUBLISHED',
    });

    const allNovels = response.data?.content || [];
    const ongoingNovels = allNovels.filter(
      (novel) => novel.status === 'PUBLISHED' && novel.isCompleted === false
    );

    return {
      ...response,
      content: transformNovelData(ongoingNovels.slice(0, 8)),
    };
  } catch (error) {
    console.error('Error fetching ongoing novels:', error);
    return { content: [] };
  }
};

export const getCompletedNovels = async () => {
  try {
    const response = await getNovels({
      size: 100,
      sort: 'createTime',
      order: 'asc', // Changed to 'asc' to get oldest completed novels as stated in comment
      status: 'PUBLISHED',
    });

    const allNovels = response.data?.content || [];
    const completedNovels = allNovels.filter(
      (novel) => novel.status === 'PUBLISHED' && novel.isCompleted === true
    );

    // Return 8 oldest completed novels (now correctly sorted)
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
      status: 'PUBLISHED',
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
