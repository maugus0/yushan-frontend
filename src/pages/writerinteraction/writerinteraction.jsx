import { useEffect, useState, useRef, useCallback } from 'react';
import { Tabs, Select, Modal, Button, Spin } from 'antd';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerinteraction.css';
import novelService from '../../services/novel';
import userService from '../../services/user';
import reviewService from '../../services/review';
import commentService from '../../services/comments';

const PAGE_SIZE = 15;

const WriterInteraction = () => {
  const [novels, setNovels] = useState([]);
  const [reviewsTab, setReviewsTab] = useState('reviews');
  const [selectedNovelId, setSelectedNovelId] = useState(null);

  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsHasMore, setReviewsHasMore] = useState(true);

  const [commentsList, setCommentsList] = useState([]);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentsHasMore, setCommentsHasMore] = useState(true);

  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  const observer = useRef();

  useEffect(() => {
    const getNovelData = async () => {
      try {
        const author = await userService.getMe();
        const data = await novelService.getNovel({ authorId: author.uuid });
        setNovels(data || []);
        if (data && data.length > 0) {
          setSelectedNovelId(data[0].id);
        } else {
          setInitialLoading(false);
        }
      } catch (error) {
        setErrorMsg(error.message || 'Failed to load novels.');
        setErrorModal(true);
        setInitialLoading(false);
      }
    };
    getNovelData();
  }, []);

  useEffect(() => {
    setReviewsList([]);
    setReviewsPage(0);
    setReviewsHasMore(true);
    setCommentsList([]);
    setCommentsPage(0);
    setCommentsHasMore(true);
    if (selectedNovelId) {
      setInitialLoading(true);
    }
  }, [selectedNovelId, reviewsTab]);

  useEffect(() => {
    if (reviewsTab !== 'reviews' || !selectedNovelId || !reviewsHasMore) return;
    const fetchReviews = async () => {
      reviewsPage === 0 ? setInitialLoading(true) : setListLoading(true);
      try {
        const filters = { page: reviewsPage, size: PAGE_SIZE, novelId: selectedNovelId };
        const res = await reviewService.getReviewsByNovelId(filters);
        const newList = res.content || [];
        setReviewsList((prev) => (reviewsPage === 0 ? newList : [...prev, ...newList]));
        setReviewsHasMore(newList.length === PAGE_SIZE);
      } catch (error) {
        setErrorMsg(error.message || 'Failed to fetch reviews.');
        setErrorModal(true);
      } finally {
        setInitialLoading(false);
        setListLoading(false);
      }
    };
    fetchReviews();
  }, [selectedNovelId, reviewsTab, reviewsPage]);

  useEffect(() => {
    if (reviewsTab !== 'comments' || !selectedNovelId || !commentsHasMore) return;
    const fetchComments = async () => {
      commentsPage === 0 ? setInitialLoading(true) : setListLoading(true);
      try {
        const filters = { page: commentsPage, size: PAGE_SIZE, novelId: selectedNovelId };
        const res = await commentService.getCommentsByNovelId(filters);
        const newList = res.comments || [];
        setCommentsList((prev) => (commentsPage === 0 ? newList : [...prev, ...newList]));
        setCommentsHasMore(newList.length === PAGE_SIZE);
      } catch (error) {
        setErrorMsg(error.message || 'Failed to fetch comments.');
        setErrorModal(true);
      } finally {
        setInitialLoading(false);
        setListLoading(false);
      }
    };
    fetchComments();
  }, [selectedNovelId, reviewsTab, commentsPage]);

  const lastElementRef = useCallback(
    (node) => {
      if (listLoading || initialLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (reviewsTab === 'reviews' && reviewsHasMore) {
            setReviewsPage((p) => p + 1);
          }
          if (reviewsTab === 'comments' && commentsHasMore) {
            setCommentsPage((p) => p + 1);
          }
        }
      });
      if (node) observer.current.observe(node);
    },
    [listLoading, initialLoading, reviewsHasMore, commentsHasMore, reviewsTab]
  );

  const currentList = reviewsTab === 'reviews' ? reviewsList : commentsList;

  const renderList = () => {
    if (initialLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      );
    }
    if (currentList.length === 0) {
      return <div className="no-data-placeholder">No data available.</div>;
    }

    return (
      <>
        {reviewsTab === 'reviews'
          ? currentList.map((item, index) => (
              <div
                ref={currentList.length === index + 1 ? lastElementRef : null}
                className="writerinteraction-list-row"
                key={item.id + '_review'}
              >
                <span className="writerinteraction-list-content">{item.content}</span>
                <span className="writerinteraction-list-reader">{item.username}</span>
              </div>
            ))
          : currentList.map((item, index) => (
              <div
                ref={currentList.length === index + 1 ? lastElementRef : null}
                className="writerinteraction-list-row"
                key={item.id + '_comment'}
              >
                <span className="writerinteraction-list-content">
                  <span className="comment-chapter-title">{item.chapterTitle}</span>
                  {item.content}
                </span>
                <span className="writerinteraction-list-reader">{item.username}</span>
              </div>
            ))}
        {listLoading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="writerinteraction-page">
      <WriterNavbar />
      <div className="writerinteraction-content">
        <div className="writerinteraction-header">
          <h2 className="writerinteraction-title">Interaction</h2>
          <Select
            className="writerinteraction-select"
            value={selectedNovelId}
            onChange={setSelectedNovelId}
            options={novels.map((n) => ({ label: n.title, value: n.id }))}
            placeholder="Select a novel"
          />
        </div>
        <div className="writerinteraction-main">
          <Tabs
            className="writerinteraction-tabs"
            activeKey={reviewsTab}
            onChange={setReviewsTab}
            items={[
              { key: 'reviews', label: 'REVIEWS' },
              { key: 'comments', label: 'COMMENTS' },
            ]}
          />
          <div className="writerinteraction-list-box">
            <div className="writerinteraction-list-header">
              <span className="writerinteraction-list-col-content">CONTENT</span>
              <span className="writerinteraction-list-col-reader">READER</span>
            </div>
            <div className="writerinteraction-list-body">{renderList()}</div>
          </div>
        </div>
        <Modal
          open={errorModal}
          onCancel={() => setErrorModal(false)}
          footer={[
            <Button key="confirm" type="primary" onClick={() => setErrorModal(false)}>
              Confirm
            </Button>,
          ]}
          centered
          maskClosable={false}
          closable={false}
          style={{ textAlign: 'center', borderRadius: 12, background: '#fff' }}
        >
          <div
            style={{
              color: '#cf1322',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 8,
              padding: '18px 16px',
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 12,
              boxShadow: '0 2px 12px rgba(255,77,79,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#ff4d4f" />
              <path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1.2" fill="#fff" />
            </svg>
            {errorMsg}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WriterInteraction;
