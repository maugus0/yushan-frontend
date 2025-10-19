import { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Modal, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerstoryprofile.css';
import { useNavigate, useLocation } from 'react-router-dom';
import novelService from '../../services/novel';
import chapterService from '../../services/chapter';
import dayjs from 'dayjs';

const PAGE_SIZE = 10;

const WriterStoryProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteModal, setDeleteModal] = useState({ visible: false, idx: null });
  const [story, setStory] = useState(null);
  const [chaptersData, setChaptersData] = useState([]);
  const [chaptersPage, setChaptersPage] = useState(0);
  const [chaptersHasMore, setChaptersHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const observer = useRef();
  const searchParams = new URLSearchParams(window.location.search);
  const storyId = searchParams.get('id');

  useEffect(() => {
    if (!storyId) return;

    setChaptersData([]);
    setChaptersPage(0);
    setChaptersHasMore(true);

    const getStoryAndFirstPage = async () => {
      setLoading(true);
      setLoadingMore(true);
      try {
        const [fetchedStory, chaptersRes] = await Promise.all([
          novelService.getNovelById(storyId),
          chapterService.getChapterByNovelId(storyId, 0, PAGE_SIZE),
        ]);

        setStory(fetchedStory);
        const newList = chaptersRes.data.chapters || [];
        setChaptersData(newList);
        setChaptersHasMore(newList.length === PAGE_SIZE);
      } catch (error) {
        setErrorMsg(error.message || 'Failed to load initial data.');
        setErrorModal(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    getStoryAndFirstPage();
  }, [storyId, location.key]);

  useEffect(() => {
    if (chaptersPage === 0 || !chaptersHasMore || !storyId) return;

    const fetchMoreChapters = async () => {
      setLoadingMore(true);
      try {
        const res = await chapterService.getChapterByNovelId(storyId, chaptersPage, PAGE_SIZE);
        const newList = res.data.chapters || [];
        setChaptersData((prev) => [...prev, ...newList]);
        setChaptersHasMore(newList.length === PAGE_SIZE);
      } catch (error) {
        setErrorMsg(error.message || 'Failed to load more chapters.');
        setErrorModal(true);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchMoreChapters();
  }, [chaptersPage]);

  const lastChapterElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && chaptersHasMore) {
          setChaptersPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, chaptersHasMore]
  );

  const handleEdit = (chapterId) => {
    navigate(`/writercreatechapters/?novelid=${storyId}&chapterid=${chapterId}`);
  };

  const handleDelete = (chapterId) => {
    setDeleteModal({ visible: true, idx: chapterId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await chapterService.deleteChapterByChapterId(deleteModal.idx);
      setChaptersData((prev) => prev.filter((chapter) => chapter.uuid !== deleteModal.idx));
      setStory((prev) => ({ ...prev, chapterCnt: prev.chapterCnt - 1 }));
      setDeleteModal({ visible: false, idx: null });
      message.success('Successfully deleted!', 3);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to delete chapter.');
      setErrorModal(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ visible: false, idx: null });
  };

  const isValidBase64Url = (url) => {
    return /^data:image\/(jpeg|png|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(url);
  };

  return (
    <div className="writerstoryprofile-page">
      <WriterNavbar />
      <div className="writerstoryprofile-content">
        <div className="writerstoryprofile-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="writerstoryprofile-back-btn"
            onClick={() => navigate('/writerworkspace')}
          />
          <h2 className="writerstoryprofile-title">Story</h2>
          <Button
            type="primary"
            className="writerstoryprofile-create-btn"
            onClick={() => navigate('/writercreatechapters?id=' + storyId)}
          >
            + CREATE CHAPTERS
          </Button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          story && (
            <div className="storyprofile-content-box">
              <div className="storyprofile-main-row">
                <img
                  src={
                    story.coverImgUrl && isValidBase64Url(story.coverImgUrl)
                      ? story.coverImgUrl
                      : require('../../assets/images/novel_default.png')
                  }
                  alt="cover"
                  className="storyprofile-cover"
                />
                <div className="storyprofile-info">
                  <div className="storyprofile-title">{story.title}</div>
                  <div className="storyprofile-meta">
                    BY <span className="storyprofile-author">{story.authorUsername}</span> / IN{' '}
                    <span className="storyprofile-type">{story.categoryName}</span>
                  </div>
                  <div className="storyprofile-stats-box">
                    <div className="storyprofile-stats-row">
                      <div className="storyprofile-stat-label">Chapters Num</div>
                      <div className="storyprofile-stat-label">Words</div>
                      <div className="storyprofile-stat-label">Comments</div>
                    </div>
                    <div className="storyprofile-stats-row">
                      <div className="storyprofile-stat-value">{story.chapterCnt}</div>
                      <div className="storyprofile-stat-value">{story.wordCnt}</div>
                      <div className="storyprofile-stat-value">{story.reviewCnt}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="storyprofile-chapters-list-box">
                <div className="storyprofile-chapters-title-row">
                  <span className="storyprofile-chapters-title-tab active">CHAPTERS</span>
                </div>
                <div className="storyprofile-chapters-list">
                  {chaptersData.length === 0 && !loadingMore ? (
                    <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
                      No chapters.
                    </div>
                  ) : (
                    chaptersData.map((chapter, index) => {
                      const isLastElement = chaptersData.length === index + 1;
                      return (
                        <div
                          ref={isLastElement ? lastChapterElementRef : null}
                          className="storyprofile-chapter-row"
                          key={chapter.uuid}
                        >
                          <span className="storyprofile-chapter-name">{chapter.title}</span>
                          <span className="storyprofile-chapter-actions">
                            <span
                              className="storyprofile-chapter-edit"
                              onClick={() => handleEdit(chapter.uuid)}
                            >
                              EDIT
                            </span>
                            <span
                              className="storyprofile-chapter-delete"
                              onClick={() => handleDelete(chapter.uuid)}
                            >
                              DELETE
                            </span>
                            <span className="storyprofile-chapter-date">
                              {chapter.publishTime
                                ? dayjs(chapter.publishTime).format('YYYY-MM-DD HH:mm:ss')
                                : ''}
                            </span>
                          </span>
                        </div>
                      );
                    })
                  )}
                  {loadingMore && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Spin />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
        <Modal
          open={deleteModal.visible}
          title="Confirm to delete this chapter?"
          onCancel={handleDeleteCancel}
          footer={[
            <Button key="cancel" onClick={handleDeleteCancel}>
              Cancel
            </Button>,
            <Button key="delete" type="primary" danger onClick={handleDeleteConfirm}>
              Delete
            </Button>,
          ]}
          centered
        ></Modal>
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
          style={{ textAlign: 'center' }}
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

export default WriterStoryProfile;
