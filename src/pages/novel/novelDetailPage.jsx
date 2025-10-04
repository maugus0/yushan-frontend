import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tag, Button, Avatar, Pagination, Tooltip, Spin, Alert, Breadcrumb } from 'antd';
import {
  BookFilled,
  EyeFilled,
  LikeFilled,
  UserOutlined,
  PlusOutlined,
  BarsOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './novelDetailPage.css';
import testImg from '../../assets/images/testimg2.png'; // Adjusted path
import { FlagOutlined } from '@ant-design/icons'; // Import the flag icon

// Mock function to fetch novel data (replace with actual API call)
const fetchNovelById = async (novelId) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock data - in real app, this would come from your API
  return {
    id: parseInt(novelId),
    cover: testImg,
    title: `Novel Title ${novelId}`,
    tags: ['Fantasy', 'Xianxia', 'Action'],
    chapters: 2781,
    views: 14500000,
    votes: 98500,
    author: { name: 'Author Name', avatar: '' },
    synopsis: `This is the synopsis for novel ${novelId}. In a world of cultivation, only the strong survive...`,
    rankings: [
      { type: 'Popularity Ranking', value: '#1', icon: <EyeFilled /> },
      { type: 'Vote Ranking', value: '#3', icon: <LikeFilled /> },
    ],
  };
};

// Optimize chapter generation - only create chapters for current page
const generateChaptersForPage = (page, pageSize, totalChapters) => {
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalChapters);

  return Array.from({ length: end - start }, (_, i) => ({
    id: start + i + 1,
    title: `Chapter ${start + i + 1}: The Journey Continues`,
  }));
};

// Memoized component for chapter button to prevent unnecessary re-renders
const ChapterButton = React.memo(({ chapter, onJumpToChapter }) => (
  <Tooltip title={`Go to ${chapter.title}`}>
    <Button type="text" className="novel-chapter-btn" onClick={() => onJumpToChapter(chapter.id)}>
      {chapter.title}
    </Button>
  </Tooltip>
));

export default function NovelDetailPage() {
  const REVIEWS_PAGE_SIZE = 30;
  const CHAPTERS_PAGE_SIZE = 50; // 50 chapters per page (25 per column, 2 columns)

  const { novelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('about');
  const [page, setPage] = useState(1);
  const [chapterPage, setChapterPage] = useState(1);
  const [recentRead, setRecentRead] = useState(() => {
    // Retrieve from local storage on initial load
    const savedRecentRead = localStorage.getItem('recentRead');
    return savedRecentRead ? JSON.parse(savedRecentRead) : null;
  }); // State for recently read chapter

  // Load novel data
  useEffect(() => {
    const loadNovel = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNovelById(novelId);
        setNovel(data);
      } catch (err) {
        setError('Failed to load novel details');
        console.error('Error loading novel:', err);
      } finally {
        setLoading(false);
      }
    };

    if (novelId) {
      loadNovel();
    }
  }, [novelId]);

  // Reset chapter pagination when switching to TOC tab
  useEffect(() => {
    if (tab === 'toc') {
      setChapterPage(1);
    }
  }, [tab]);

  // Update local storage whenever recentRead changes
  useEffect(() => {
    if (recentRead) {
      localStorage.setItem('recentRead', JSON.stringify(recentRead));
    }
  }, [recentRead]);

  // Memoize breadcrumb items to prevent unnecessary recalculation
  const breadcrumbItems = useMemo(() => {
    if (!novel) return [{ title: <Link to="/">Home</Link> }];

    const baseItems = [{ title: <Link to="/">Home</Link> }];
    const referrer = location.state?.from || document.referrer;

    if (referrer && referrer.includes('/browse')) {
      baseItems.push(
        { title: <Link to="/browse">Browse</Link> },
        { title: novel.title || 'Novel Details' }
      );
    } else if (referrer && (referrer.includes('/rankings') || referrer.includes('/leaderboard'))) {
      if (referrer.includes('/Novel/')) {
        const categoryMatch = referrer.match(/\/Novel\/([^/?#]+)/);
        const category = categoryMatch
          ? decodeURIComponent(categoryMatch[1]).replace(/-/g, ' ')
          : null;

        baseItems.push({ title: <Link to="/rankings/Novel">Rankings</Link> });

        if (category && category !== 'all') {
          const categoryPath = category.replace(/\s+/g, '-');
          baseItems.push({ title: <Link to={`/rankings/Novel/${categoryPath}`}>{category}</Link> });
        }

        baseItems.push({ title: novel.title || 'Novel Details' });
      } else if (referrer.includes('/Writers')) {
        baseItems.push(
          { title: <Link to="/rankings/Writers">Writers Rankings</Link> },
          { title: novel.title || 'Novel Details' }
        );
      } else if (referrer.includes('/Readers')) {
        baseItems.push(
          { title: <Link to="/rankings/Readers">Readers Rankings</Link> },
          { title: novel.title || 'Novel Details' }
        );
      } else {
        baseItems.push(
          { title: <Link to="/rankings/Novel">Rankings</Link> },
          { title: novel.title || 'Novel Details' }
        );
      }
    } else {
      baseItems.push(
        { title: <Link to="/browse">Browse</Link> },
        { title: novel.title || 'Novel Details' }
      );
    }

    return baseItems;
  }, [novel, location.state?.from]);

  // Memoize reviews to prevent unnecessary recalculation
  const reviews = useMemo(() => {
    if (!novel) return [];
    return Array.from({ length: 83 }, (_, i) => ({
      id: i + 1,
      user: `User${i + 1}`,
      avatar: '',
      content: `This is a sample review for ${novel.title}. Great novel!`,
      date: '2024-01-01',
    }));
  }, [novel]);

  // Only generate chapters for current page
  const currentPageChapters = useMemo(() => {
    if (!novel) return [];
    return generateChaptersForPage(chapterPage, CHAPTERS_PAGE_SIZE, novel.chapters);
  }, [novel, chapterPage, CHAPTERS_PAGE_SIZE]);

  // Memoize paged reviews
  const pagedReviews = useMemo(() => {
    return reviews.slice((page - 1) * REVIEWS_PAGE_SIZE, page * REVIEWS_PAGE_SIZE);
  }, [reviews, page, REVIEWS_PAGE_SIZE]);

  // Handlers
  const handleAddToLibrary = () => {
    console.log('Adding novel to library:', novel.id);
  };

  const handleJumpToChapter = (chapterId) => {
    const chapterTitle = `Chapter ${chapterId}: The Journey Continues`; // Update this as per your chapter title logic
    setRecentRead({
      id: chapterId,
      title: chapterTitle,
    });
    navigate(`/read/${novel.id}/${chapterId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error || !novel) {
    return (
      <div style={{ padding: '32px' }}>
        <Alert
          message="Error"
          description={error || 'Novel not found'}
          type="error"
          showIcon
          action={<Button onClick={() => navigate(-1)}>Go Back</Button>}
        />
      </div>
    );
  }

  return (
    <div className="novel-detail-root">
      {/* Breadcrumb Navigation */}
      <div style={{ padding: '16px 32px 0' }}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Module 1: Header/Main area */}
      <div className="novel-header">
        <div className="novel-cover">
          <img src={novel.cover} alt={novel.title} />
        </div>
        <div className="novel-header-main">
          <h1 className="novel-title">{novel.title}</h1>
          <div className="novel-tags">
            {novel.tags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </div>
          <div className="novel-meta-row">
            <span>
              <BookFilled /> {novel.chapters} Chapters
            </span>
            <span>
              <EyeFilled /> {novel.views.toLocaleString()} Views
            </span>
            <span>
              <LikeFilled /> {novel.votes.toLocaleString()} Votes
            </span>
          </div>
          <div className="novel-meta-row">
            <span>
              <UserOutlined /> Author: <b>{novel.author.name}</b>
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="novel-add-btn"
              onClick={handleAddToLibrary}
            >
              Add to Library
            </Button>
          </div>
          <div className="novel-rankings">
            {novel.rankings.map((r) => (
              <div key={r.type} className="novel-ranking-tag">
                {r.icon} {r.type}: {r.value}
              </div>
            ))}
            <div className="report-container">
              {' '}
              {/* Separate container for the button */}
              <Button
                type="text"
                className="report-button"
                onClick={() => console.log('Reporting story')} // Add your report logic here
              >
                <FlagOutlined style={{ marginRight: '0px', fontSize: '13px' }} />
                Report Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Tabs */}
      <div className="novel-section-nav">
        <button className={tab === 'about' ? 'active' : ''} onClick={() => setTab('about')}>
          <FileTextOutlined /> About
        </button>
        <button className={tab === 'toc' ? 'active' : ''} onClick={() => setTab('toc')}>
          <BarsOutlined /> Table of Contents
        </button>
      </div>

      {/* Module 3: About */}
      {tab === 'about' && (
        <div className="novel-section">
          <h2 className="section-title">Synopsis</h2>
          <div className="novel-synopsis">{novel.synopsis}</div>
          <h2 className="section-title">
            Reviews <span className="review-count">({reviews.length})</span>
          </h2>
          <div className="novel-reviews">
            {pagedReviews.map((r) => (
              <div key={r.id} className="review-card">
                <Avatar icon={<UserOutlined />} src={r.avatar} />
                <div className="review-content">
                  <div className="review-header">
                    <span className="review-user">{r.user}</span>
                    <span className="review-date">{r.date}</span>
                  </div>
                  <div>{r.content}</div>
                </div>
              </div>
            ))}
            <div className="review-pagination">
              <Pagination
                current={page}
                pageSize={REVIEWS_PAGE_SIZE}
                total={reviews.length}
                showSizeChanger={false}
                onChange={setPage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Module 4: Table of Contents */}
      {tab === 'toc' && (
        <div className="novel-section">
          <h2 className="section-title">Recently Read</h2>
          {recentRead ? (
            <div className="novel-recent-read">
              <Button type="link" onClick={() => handleJumpToChapter(recentRead.id)}>
                {recentRead.title} (Chapter {recentRead.id})
              </Button>
            </div>
          ) : (
            <div className="novel-recent-read-empty">No recent chapters.</div>
          )}

          <h2 className="section-title">
            All Chapters
            <span className="chapter-count">({novel.chapters} total)</span>
          </h2>

          {/* Chapter List - Two columns display */}
          <div className="novel-chapter-list">
            {currentPageChapters.map((ch) => (
              <ChapterButton key={ch.id} chapter={ch} onJumpToChapter={handleJumpToChapter} />
            ))}
          </div>

          {/* Chapter Pagination - Bottom only */}
          <div className="chapter-pagination-bottom">
            <Pagination
              current={chapterPage}
              pageSize={CHAPTERS_PAGE_SIZE}
              total={novel.chapters}
              showSizeChanger={false}
              showQuickJumper={true}
              showTotal={(total, range) => (
                <span className="chapter-range-text">
                  Chapters {range[0]}-{range[1]}
                </span>
              )}
              onChange={setChapterPage}
              size="small"
            />
          </div>
        </div>
      )}
    </div>
  );
}
