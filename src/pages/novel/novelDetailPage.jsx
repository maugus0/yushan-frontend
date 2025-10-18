import { useState, useEffect, useMemo } from 'react';
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
import novelsApi from '../../services/novels';
import reviewsApi from '../../services/reviews';
import reportsApi from '../../services/reports';
import libraryApi from '../../services/library';
import historyApi from '../../services/history';
import userProfileService from '../../services/userProfile'; // Assume this service exists
import { toAbsoluteUrl } from '../../services/_http';
import testImg from '../../assets/images/novel_default.png'; // keep fallback
import PowerStatusVote from '../../components/novel/novelcard/powerStatusVote';
import ReviewSection from '../../components/novel/novelcard/reviewSection';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

const REPORT_TYPE_OPTIONS = [
  { label: 'Pornographic Content', value: 'PORN' },
  { label: 'Hate or Bullying', value: 'HATE_BULLYING' },
  { label: 'Release of personal info', value: 'PERSONAL_INFO' },
  { label: 'Other inappropriate material', value: 'INAPPROPRIATE' },
  { label: 'Spam', value: 'SPAM' },
];

export default function NovelDetailPage() {
  const REVIEWS_PAGE_SIZE = 10; // align with BE default
  const CHAPTERS_PAGE_SIZE = 50;

  const { novelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [novel, setNovel] = useState(null);
  const [coverUrl, setCoverUrl] = useState(testImg);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('about');
  const [page, setPage] = useState(1);
  const [chapterPage, setChapterPage] = useState(1);
  const [inLibrary, setInLibrary] = useState(false);

  // votes
  const [voting, setVoting] = useState(false);

  // reviews
  const [reviewsState, setReviewsState] = useState({ list: [], total: 0 });

  // Report modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState(''); // reason text
  const [reportType, setReportType] = useState(REPORT_TYPE_OPTIONS[0].value); // default value for report type
  const [reportError, setReportError] = useState('');

  // Current user info
  const [currentUser, setCurrentUser] = useState(null);

  // Global tip state
  const [globalTip, setGlobalTip] = useState({ message: '', type: 'success', visible: false });

  // chapter list state
  const [chapterList, setChapterList] = useState([]);

  const [voteRanking, setVoteRanking] = useState(null);
  const [voteRankType, setVoteRankType] = useState('Vote Ranking');
  const [voteRankingMessage, setVoteRankingMessage] = useState('');

  useEffect(() => {
    async function fetchVoteRanking() {
      if (!novelId) return;
      try {
        const apiBase = process.env.REACT_APP_API_URL || '/api';
        const url = `${apiBase.replace(/\/$/, '')}/ranking/novel/${novelId}/rank`;
        const res = await axios.get(url);
        setVoteRanking(res?.data?.data?.rank ?? null);
        setVoteRankType(res?.data?.data?.rankType ?? 'Vote Ranking');
        setVoteRankingMessage(res?.data?.message ?? '');
      } catch (e) {
        setVoteRanking(null);
        setVoteRankType('Vote Ranking');
        setVoteRankingMessage('');
      }
    }
    fetchVoteRanking();
  }, [novelId]);

  // Show tip for a short duration
  const showTip = (message, type = 'success', duration = 2000) => {
    setGlobalTip({ message, type, visible: true });
    setTimeout(() => {
      setGlobalTip({ message: '', type, visible: false });
    }, duration);
  };

  // Load novel detail
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await novelsApi.getDetail(novelId);
        if (cancelled) return;
        setNovel({
          id: data?.id,
          title: data?.title,
          categoryName: data?.categoryName,
          chapters: data?.chapterCnt ?? 0,
          views: data?.viewCnt ?? 0,
          votes: data?.voteCnt ?? 0,
          author: {
            name: data?.authorUsername || 'Author',
            uuid: data?.authorId || data?.authorUuid, // get uuid
          },
          rating: data?.avgRating ?? 0,
          ratingsCount: data?.reviewCnt ?? 0,
          synopsis: data?.synopsis ?? '',
          remainedYuan: data?.remainedYuan, // Ensure votesLeft is initialized
        });
        const abs = toAbsoluteUrl(data?.coverImgUrl);
        setCoverUrl(abs || testImg);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load novel details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (novelId) load();
    return () => {
      cancelled = true;
    };
  }, [novelId]);

  // Load current user info
  useEffect(() => {
    async function loadUser() {
      const user = await userProfileService.getCurrentUser();
      setCurrentUser(user);
    }
    loadUser();
  }, []);

  // Load reviews when page changes or after user info loaded
  useEffect(() => {
    let cancelled = false;
    async function loadReviews() {
      try {
        const res = await reviewsApi.listByNovel(novelId, {
          page: page - 1,
          size: REVIEWS_PAGE_SIZE,
          sort: 'createTime',
          order: 'desc',
        });
        if (cancelled) return;
        const list = Array.isArray(res?.content) ? res.content : [];
        setReviewsState({
          list,
          total: res?.totalElements ?? list.length,
        });
      } catch (e) {
        return null;
      }
    }
    if (novelId && currentUser) loadReviews();
    return () => {
      cancelled = true;
    };
  }, [novelId, page, currentUser]);

  // Check if in library
  useEffect(() => {
    async function checkLibrary() {
      if (novelId) {
        try {
          const inLib = await libraryApi.check(novelId);
          setInLibrary(inLib);
        } catch {
          setInLibrary(false);
        }
      }
    }
    checkLibrary();
  }, [novelId]);

  // Keep your recentRead local usage for now (history is queried on Read)
  const [recentRead, setRecentRead] = useState(() => {
    const savedRecentRead = localStorage.getItem('recentRead');
    return savedRecentRead ? JSON.parse(savedRecentRead) : null;
  });

  useEffect(() => {
    if (tab === 'toc') setChapterPage(1);
  }, [tab]);

  useEffect(() => {
    if (recentRead) {
      localStorage.setItem('recentRead', JSON.stringify(recentRead));
    }
  }, [recentRead]);

  // Read: try to jump to last read chapter from /history; fallback to 1
  const handleReadNovel = async () => {
    try {
      const historyRes = await historyApi.list({ page: 0, size: 20 });
      let chapterNumber;
      if (Array.isArray(historyRes?.content)) {
        const found = historyRes.content.find((h) => String(h.novelId) === String(novelId));
        if (found && !isNaN(Number(found.chapterNumber))) {
          chapterNumber = Number(found.chapterNumber);
        }
      }
      if (typeof chapterNumber === 'number') {
        navigate(`/read/${novelId}/${chapterNumber}`);
      } else {
        navigate(`/read/${novelId}/1`);
      }
    } catch {
      navigate(`/read/${novelId}/1`);
    }
  };

  const handleJumpToChapter = async (chapterId, chapterNumber) => {
    try {
      await historyApi.recordRead(novelId, chapterId);
    } catch (e) {
      // ignore
    }
    setRecentRead({ id: chapterId, title: `Chapter ${chapterNumber}` });
    navigate(`/read/${novelId}/${chapterNumber}`);
  };

  const handleAddOrRemoveLibrary = async () => {
    if (inLibrary) {
      try {
        await libraryApi.remove(novelId);
        setInLibrary(false);
        showTip('Removed from library', 'success');
      } catch (e) {
        showTip(
          e?.response?.data?.message || e?.message || 'Failed to remove from library',
          'error'
        );
      }
    } else {
      try {
        const historyRes = await historyApi.list({ page: 0, size: 20 });
        let chapterId = null;
        if (Array.isArray(historyRes?.data?.content)) {
          const found = historyRes.data.content.find((h) => String(h.novelId) === String(novelId));
          if (found && found.chapterId) chapterId = found.chapterId;
        }
        if (!chapterId) {
          const chaptersRes = await novelsApi.getChapters(novelId);
          const firstChapter = chaptersRes?.chapters?.[0];
          if (firstChapter && firstChapter.chapterId) chapterId = firstChapter.chapterId;
        }
        if (!chapterId) chapterId = 1;
        await libraryApi.add(novelId, chapterId);
        setInLibrary(true);
        showTip('Added to library', 'success');
      } catch (e) {
        showTip(e?.response?.data?.message || e?.message || 'Failed to add to library', 'error');
      }
    }
  };

  // Get current user's yuan from redux store (login sets it)
  const dispatch = useDispatch();
  const userYuan = useSelector((state) => state.user?.user?.yuan ?? 0);

  // Vote handler: no longer update votesLeft, just showTip
  const handleVote = async () => {
    if (userYuan <= 0) return;
    setVoting(true);
    try {
      const res = await novelsApi.vote(novelId);
      showTip('Voted successfully', 'success');
      if (res?.remainedYuan !== undefined) {
        dispatch({
          type: 'user/updateYuan',
          payload: res.remainedYuan,
        });
      }
    } catch (e) {
      showTip(e?.response?.data?.message || e?.message || 'Vote failed', 'error');
    } finally {
      setVoting(false);
    }
  };

  // Report modal handlers
  const showModal = () => {
    setReportError('');
    setIsModalVisible(true);
  };
  const handleOk = async () => {
    try {
      await reportsApi.reportNovel(novelId, {
        reportType,
        reason: reportReason || 'User report',
      });
      setIsModalVisible(false);
      setReportError('');
      showTip('Novel reported successfully', 'success');
    } catch (e) {
      setIsModalVisible(false);
      setReportError('');
      showTip('You have already reported this novel', 'error');
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setReportError('');
  };

  // Review submit handler
  const onSubmitReview = async ({ rating, text, isSpoiler }) => {
    try {
      await reviewsApi.create({ novelId, rating, text, isSpoiler });
      setPage(1);
      await refreshReviewsAndRating();
      showTip('Review submitted successfully', 'success');
    } catch (e) {
      setIsReviewModalVisible(false);
      showTip(
        e?.response?.status === 400
          ? 'You have already reviewed this novel'
          : e?.response?.data?.message || e?.message || 'Failed to submit review',
        'error'
      );
    }
  };

  // Edit review handler
  const onEditReview = async (reviewId, { rating, title, content, isSpoiler }) => {
    try {
      await reviewsApi.edit(reviewId, { rating, title, content, isSpoiler });
      await refreshReviewsAndRating();
      showTip('Review updated successfully', 'success');
    } catch (e) {
      showTip(e?.response?.data?.message || e?.message || 'Failed to update review', 'error');
    }
  };

  // Delete review handler
  const onDeleteReview = async (reviewId) => {
    try {
      await reviewsApi.delete(reviewId);
      setPage(1);
      await refreshReviewsAndRating();
      showTip('Review deleted successfully', 'success');
    } catch (e) {
      showTip(e?.response?.data?.message || e?.message || 'Failed to delete review', 'error');
    }
  };

  // Like review handler
  const onLikeReview = async (reviewId) => {
    try {
      await reviewsApi.like(reviewId);
      await refreshReviewsAndRating(false); // Only refresh reviews, not rating
      showTip('Liked review', 'success');
    } catch (e) {
      showTip(e?.response?.data?.message || e?.message || 'Failed to like review', 'error');
    }
  };

  // Helper to refresh both reviews and rating
  const refreshReviewsAndRating = async (refreshRating = true) => {
    const data = await reviewsApi.listByNovel(novelId, {
      page: page - 1,
      size: REVIEWS_PAGE_SIZE,
      sort: 'createTime',
      order: 'desc',
    });
    setReviewsState({
      list: data?.content || [],
      total: data?.totalElements || 0,
    });
    if (refreshRating) {
      await refreshNovelRating();
    }
  };

  // Add review modal state
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);

  // Review button click handler: always allow opening modal
  const handleWriteReview = () => {
    setIsReviewModalVisible(true);
  };

  // refresh novel rating after review submission
  const refreshNovelRating = async () => {
    try {
      const data = await novelsApi.getDetail(novelId);
      setNovel((prev) => ({
        ...prev,
        rating: data?.avgRating ?? 0,
        ratingsCount: data?.reviewCnt ?? 0,
      }));
    } catch {
      showTip('Failed to refresh novel rating', 'error');
    }
  };

  // Move memos BEFORE any early returns
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

  const pagedReviews = useMemo(() => reviewsState.list, [reviewsState.list]);

  // get chapters list
  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await novelsApi.getChaptersFull(novelId); // getChaptersFull
        setChapterList(Array.isArray(res?.chapters) ? res.chapters : []);
      } catch {
        setChapterList([]);
      }
    }
    if (novelId) fetchChapters();
  }, [novelId]);

  // Early returns AFTER all hooks
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
          <img
            src={coverUrl || testImg}
            alt={novel.title}
            onError={(e) => {
              e.currentTarget.src = testImg;
            }}
          />
        </div>
        <div className="novel-header-main">
          <h1 className="novel-title">{novel.title}</h1>

          <div className="novel-meta-combined">
            <div className="novel-tag-single">
              <BookOutlined className="tag-icon" />
              <span className="tag-text">{novel.categoryName || '—'}</span>
            </div>
            <span className="meta-item">
              <BookFilled /> {novel.chapters} Chapters
            </span>
            <span className="meta-item">
              <EyeFilled /> {Number(novel.views || 0).toLocaleString()} Views
            </span>
            <span className="meta-item">
              <LikeFilled /> {Number(novel.votes || 0).toLocaleString()} Votes
            </span>
          </div>

          <div className="novel-author-row">
            <span>
              <UserOutlined /> Author:{' '}
              <Link
                to={`/profile?userId=${encodeURIComponent(novel.author.uuid)}`}
                className="author-name"
                style={{ color: '#1677ff' }}
              >
                {novel.author.name}
              </Link>
            </span>
          </div>

          <div className="novel-rating-row">
            <Rate disabled value={novel.rating} allowHalf className="rating-stars" />
            <span className="rating-score">{Number(novel.rating).toFixed(2)}</span>
            <span className="rating-count">({novel.ratingsCount} ratings)</span>
          </div>

          <div className="novel-rankings-buttons-container">
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
                onClick={handleAddOrRemoveLibrary}
              >
                {inLibrary ? 'In Library' : 'Add to Library'}
              </Button>
              <Button type="text" className="report-button" onClick={showModal}>
                <FlagOutlined style={{ marginRight: '4px', fontSize: '13px' }} />
                Report Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Story Modal */}
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
            onChange={(e) => setReportType(e.target.value)}
            value={reportType}
          >
            {REPORT_TYPE_OPTIONS.map((type) => (
              <Radio key={type.value} value={type.value}>
                {type.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <Input.TextArea
          rows={4}
          placeholder="Type your abuse here (Optional)"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          style={{ marginTop: 16 }}
        />

        {reportError && (
          <div style={{ color: 'red', marginTop: 12, fontSize: 14 }}>{reportError}</div>
        )}
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

          <h2 className="section-title">Ranking Status</h2>
          <PowerStatusVote
            ranking={voteRanking}
            voteCount={novel.votes}
            votesLeft={userYuan}
            onVote={handleVote}
            loading={voting}
            disableVote={userYuan <= 0}
            rankType={voteRankType}
            message={voteRankingMessage}
          />

          <h2 className="section-title" style={{ marginTop: 16 }}>
            Reviews <span className="review-count">({reviewsState.total})</span>
          </h2>

          <ReviewSection
            novelRating={Number(novel.rating).toFixed(2)}
            pagedReviews={pagedReviews}
            total={reviewsState.total}
            page={page}
            pageSize={REVIEWS_PAGE_SIZE}
            onChangePage={setPage}
            onSubmitReview={onSubmitReview}
            onEditReview={onEditReview}
            onDeleteReview={onDeleteReview}
            onLikeReview={onLikeReview}
            isReviewModalVisible={isReviewModalVisible}
            setIsReviewModalVisible={setIsReviewModalVisible}
            handleWriteReview={handleWriteReview}
            currentUser={currentUser}
            onRefreshNovelRating={refreshNovelRating}
          />
        </div>
      )}

      {tab === 'toc' && (
        <div className="novel-section">
          <h2 className="section-title">
            All Chapters <span className="chapter-count">({novel.chapters} total)</span>
          </h2>

          <div className="novel-chapter-list">
            {chapterList.map((ch) => (
              <Tooltip key={ch.chapterId} title={`Go to ${ch.title}`}>
                <Button
                  type="text"
                  className="novel-chapter-btn"
                  onClick={() => handleJumpToChapter(ch.chapterId, ch.chapterNumber)}
                >
                  {ch.title}
                </Button>
              </Tooltip>
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

      {globalTip.visible && (
        <div
          style={{
            position: 'fixed',
            top: '30vh',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 240,
            background: globalTip.type === 'success' ? '#52c41a' : '#ff4d4f',
            color: '#fff',
            padding: '18px 32px',
            borderRadius: 8,
            fontSize: '1.1rem',
            zIndex: 9999,
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            opacity: 0.97,
            pointerEvents: 'none',
          }}
        >
          {globalTip.message}
        </div>
      )}
    </div>
  );
}
