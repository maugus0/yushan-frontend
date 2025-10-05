import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  Pagination,
  Tooltip,
  Spin,
  Alert,
  Breadcrumb,
  Rate,
  Modal,
  Radio,
  Input,
} from 'antd';
import {
  BookFilled,
  EyeFilled,
  LikeFilled,
  UserOutlined,
  PlusOutlined,
  BarsOutlined,
  FileTextOutlined,
  ReadOutlined,
  BookOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './novelDetailPage.css';
import testImg from '../../assets/images/testimg2.png';
import PowerStatusVote from '../../components/novel/novelcard/powerStatusVote';
import ReviewSection from '../../components/novel/novelcard/reviewSection'; // fixed import casing

const fetchNovelById = async (novelId) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    id: parseInt(novelId),
    cover: testImg,
    title: `Novel Title ${novelId}`,
    tags: ['Fantasy'],
    chapters: 2781,
    views: 14500000,
    votes: 98500,
    author: { name: 'Author Name', avatar: '' },
    rating: 4.8,
    ratingsCount: 85,
    synopsis: `This is the synopsis for novel ${novelId}. In a world of cultivation, only the strong survive...`,
    rankings: [
      { type: 'Popularity Ranking', value: '#1', icon: <EyeFilled /> },
      { type: 'Vote Ranking', value: '#3', icon: <LikeFilled /> },
    ],
  };
};

const generateChaptersForPage = (page, pageSize, totalChapters) => {
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalChapters);
  return Array.from({ length: end - start }, (_, i) => ({
    id: start + i + 1,
    title: `Chapter ${start + i + 1}: The Journey Continues`,
  }));
};

const ChapterButton = React.memo(({ chapter, onJumpToChapter }) => (
  <Tooltip title={`Go to ${chapter.title}`}>
    <Button type="text" className="novel-chapter-btn" onClick={() => onJumpToChapter(chapter.id)}>
      {chapter.title}
    </Button>
  </Tooltip>
));

export default function NovelDetailPage() {
  const REVIEWS_PAGE_SIZE = 30;
  const CHAPTERS_PAGE_SIZE = 50;

  const { novelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('about');
  const [page, setPage] = useState(1);
  const [chapterPage, setChapterPage] = useState(1);
  const [recentRead, setRecentRead] = useState(() => {
    const savedRecentRead = localStorage.getItem('recentRead');
    return savedRecentRead ? JSON.parse(savedRecentRead) : null;
  });

  // Report modal state (existing)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportComment, setReportComment] = useState('');

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
    if (novelId) loadNovel();
  }, [novelId]);

  useEffect(() => {
    if (tab === 'toc') setChapterPage(1);
  }, [tab]);

  useEffect(() => {
    if (recentRead) {
      localStorage.setItem('recentRead', JSON.stringify(recentRead));
    }
  }, [recentRead]);

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

  // Mock reviews kept in parent so the title count stays unchanged
  const reviews = useMemo(() => {
    if (!novel) return [];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      user: `User${i + 1}`,
      avatar: '',
      content: `This is a sample review for ${novel.title}. Great novel!`,
      date: '2024-01-01',
    }));
  }, [novel]);

  const currentPageChapters = useMemo(() => {
    if (!novel) return [];
    return generateChaptersForPage(chapterPage, CHAPTERS_PAGE_SIZE, novel.chapters);
  }, [novel, chapterPage]);

  const pagedReviews = useMemo(() => {
    return reviews.slice((page - 1) * REVIEWS_PAGE_SIZE, page * REVIEWS_PAGE_SIZE);
  }, [reviews, page]);

  const handleAddToLibrary = () => {
    console.log('Adding novel to library:', novel.id);
  };

  const handleReadNovel = () => {
    const startChapter = recentRead ? recentRead.id : 1;
    navigate(`/read/${novel.id}/${startChapter}`);
  };

  const handleJumpToChapter = (chapterId) => {
    const chapterTitle = `Chapter ${chapterId}: The Journey Continues`;
    setRecentRead({ id: chapterId, title: chapterTitle });
    navigate(`/read/${novel.id}/${chapterId}`);
  };

  // Report modal handlers (existing)
  const showModal = () => setIsModalVisible(true);
  const handleOk = () => {
    console.log('Report Reason:', reportReason);
    console.log('Report Comment:', reportComment);
    setIsModalVisible(false);
  };
  const handleCancel = () => setIsModalVisible(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <Spin size="large" />
      </div>
    );
  }

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
      <div style={{ padding: '16px 32px 0' }}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="novel-header">
        <div className="novel-cover">
          <img src={novel.cover} alt={novel.title} />
        </div>
        <div className="novel-header-main">
          <h1 className="novel-title">{novel.title}</h1>

          <div className="novel-meta-combined">
            <div className="novel-tag-single">
              <BookOutlined className="tag-icon" />
              <span className="tag-text">{novel.tags[0]}</span>
            </div>
            <span className="meta-item">
              <BookFilled /> {novel.chapters} Chapters
            </span>
            <span className="meta-item">
              <EyeFilled /> {novel.views.toLocaleString()} Views
            </span>
            <span className="meta-item">
              <LikeFilled /> {novel.votes.toLocaleString()} Votes
            </span>
          </div>

          <div className="novel-author-row">
            <span>
              <UserOutlined /> Author: <span className="author-name">{novel.author.name}</span>
            </span>
          </div>

          <div className="novel-rating-row">
            <Rate disabled defaultValue={novel.rating} allowHalf className="rating-stars" />
            <span className="rating-score">{novel.rating}</span>
            <span className="rating-count">({novel.ratingsCount} ratings)</span>
          </div>

          <div className="novel-rankings-buttons-container">
            <div className="novel-rankings-section">
              <div className="novel-ranking-tag">
                {novel.rankings[0].icon} {novel.rankings[0].type}: {novel.rankings[0].value}
              </div>
              <div className="novel-ranking-tag">
                {novel.rankings[1].icon} {novel.rankings[1].type}: {novel.rankings[1].value}
              </div>
            </div>

            <div className="novel-buttons-section">
              <Button
                type="primary"
                icon={<ReadOutlined />}
                className="novel-read-btn"
                onClick={handleReadNovel}
              >
                Read
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="novel-add-btn"
                onClick={handleAddToLibrary}
              >
                Add to Library
              </Button>
              <Button type="text" className="report-button" onClick={showModal}>
                <FlagOutlined style={{ marginRight: '4px', fontSize: '13px' }} />
                Report Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Story Modal (existing) */}
      <Modal
        className="report-modal"
        title={<span className="report-modal-title">Report Story</span>}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="REPORT"
        cancelText="CANCEL"
        centered
      >
        <div className="report-options">
          <Radio.Group
            className="report-radio-group"
            onChange={(e) => setReportReason(e.target.value)}
            value={reportReason}
          >
            <Radio value="Pornographic Content">Pornographic Content</Radio>
            <Radio value="Hate or Bullying">Hate or Bullying</Radio>
            <Radio value="Release of personal info">Release of personal info</Radio>
            <Radio value="Other inappropriate material">Other inappropriate material</Radio>
            <Radio value="Spam">Spam</Radio>
          </Radio.Group>
        </div>

        <Input.TextArea
          rows={4}
          placeholder="Type your abuse here (Required)"
          value={reportComment}
          onChange={(e) => setReportComment(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>

      <div className="novel-section-nav">
        <button className={tab === 'about' ? 'active' : ''} onClick={() => setTab('about')}>
          <FileTextOutlined /> About
        </button>
        <button className={tab === 'toc' ? 'active' : ''} onClick={() => setTab('toc')}>
          <BarsOutlined /> Table of Contents
        </button>
      </div>

      {tab === 'about' && (
        <div className="novel-section">
          <h2 className="section-title">Synopsis</h2>
          <div className="novel-synopsis">{novel.synopsis}</div>

          <h2 className="section-title">Power Status</h2>
          <PowerStatusVote ranking={1} votesLeft={1} />

          {/* Add exactly 16px gap before the Reviews title */}
          <h2 className="section-title" style={{ marginTop: 16 }}>
            Reviews <span className="review-count">({reviews.length})</span>
          </h2>

          {/* Extracted review section */}
          <ReviewSection
            novelRating={novel.rating}
            pagedReviews={pagedReviews}
            total={reviews.length}
            page={page}
            pageSize={REVIEWS_PAGE_SIZE}
            onChangePage={setPage}
          />
        </div>
      )}

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
            All Chapters <span className="chapter-count">({novel.chapters} total)</span>
          </h2>

          <div className="novel-chapter-list">
            {currentPageChapters.map((ch) => (
              <ChapterButton key={ch.id} chapter={ch} onJumpToChapter={handleJumpToChapter} />
            ))}
          </div>

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
