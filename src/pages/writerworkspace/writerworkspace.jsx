import { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Dropdown, Menu, Modal, Spin } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerworkspace.css';
import { useNavigate } from 'react-router-dom';
import novelService from '../../services/novel';
import userService from '../../services/user';

const PAGE_SIZE = 10;

const WriterWorkspace = () => {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: null });
  const [unsuccessModal, setUnsuccessModal] = useState({ visible: false, story: null });
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const observer = useRef();

  useEffect(() => {
    setStories([]);
    setPage(0);
    setHasMore(true);
  }, []);

  useEffect(() => {
    if (!hasMore) return;

    const fetchStories = async () => {
      if (page === 0) {
        setInitialLoading(true);
      } else {
        setListLoading(true);
      }

      try {
        const authorId = await userService.getMe();
        const data = await novelService.getNovel({
          authorId: authorId.uuid,
          size: PAGE_SIZE,
          page: page,
        });

        setStories((prev) => (page === 0 ? data : [...prev, ...data]));

        setHasMore(data.length === PAGE_SIZE);
      } catch (error) {
        setErrorMsg(error.message || 'Failed to load stories.');
        setErrorModal(true);
      } finally {
        setInitialLoading(false);
        setListLoading(false);
      }
    };

    fetchStories();
  }, [page]);

  const lastStoryElementRef = useCallback(
    (node) => {
      if (listLoading || initialLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [listLoading, initialLoading, hasMore]
  );

  const handleMenuClick = async (key, id) => {
    try {
      if (key === 'setting') {
        navigate(`/writercreate?id=${id}`);
      }
      if (key === 'hide') {
        await novelService.hideNovelById(id);
        setStories((prev) =>
          prev.map((story) => (story.id === id ? { ...story, status: 'HIDDEN' } : story))
        );
      }
      if (key === 'show') {
        await novelService.unHideNovelById(id);
        setStories((prev) =>
          prev.map((story) => (story.id === id ? { ...story, status: 'PUBLISHED' } : story))
        );
      }
      if (key === 'delete') {
        setDeleteModal({ visible: true, id });
      }
      if (key === 'ongoing') {
        await novelService.changeNovelDetailById(id, { isCompleted: false });
        setStories((prev) =>
          prev.map((story) => (story.id === id ? { ...story, isCompleted: false } : story))
        );
      }
      if (key === 'completed') {
        await novelService.changeNovelDetailById(id, { isCompleted: true });
        setStories((prev) =>
          prev.map((story) => (story.id === id ? { ...story, isCompleted: true } : story))
        );
      }
    } catch (error) {
      setErrorMsg(error.message || 'Operation failed.');
      setErrorModal(true);
    }
  };

  const handleExplore = (storyId) => {
    navigate(`/writerstoryprofile?id=${storyId}`);
  };

  const handleDeleteConfirm = async () => {
    try {
      await novelService.deleteNovelById(deleteModal.id);
      setStories((prev) => prev.filter((story) => story.id !== deleteModal.id));
      setDeleteModal({ visible: false, id: null });
    } catch (error) {
      setErrorMsg(error.message || 'Failed to delete story.');
      setErrorModal(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ visible: false, id: null });
  };

  const handleUnsuccessClick = (story) => {
    setUnsuccessModal({ visible: true, story });
  };

  const handleUnsuccessClose = () => {
    setUnsuccessModal({ visible: false, story: null });
  };

  const handleRecreate = () => {
    setUnsuccessModal({ visible: false, story: null });
    const id = unsuccessModal.story?.id;
    if (id) {
      navigate(`/writercreate?id=${id}`);
    } else {
      navigate('/writercreate');
    }
  };

  const menu = (id) => {
    const story = stories.find((s) => s.id === id);
    if (story && story.status === 'PUBLISHED') {
      return (
        <Menu
          onClick={({ key }) => handleMenuClick(key, id)}
          items={[
            { key: 'setting', label: 'SETTING' },
            { key: 'hide', label: 'HIDE' },
            { key: 'delete', label: 'DELETE' },
            story.isCompleted
              ? { key: 'ongoing', label: 'ONGOING' }
              : { key: 'completed', label: 'COMPLETED' },
          ]}
        />
      );
    }
    if (story && story.status === 'DRAFT') {
      return (
        <Menu
          onClick={({ key }) => handleMenuClick(key, id)}
          items={[
            { key: 'setting', label: 'SETTING' },
            { key: 'delete', label: 'DELETE' },
          ]}
        />
      );
    }
    if (story && story.status === 'HIDDEN') {
      return (
        <Menu
          onClick={({ key }) => handleMenuClick(key, id)}
          items={[
            { key: 'setting', label: 'SETTING' },
            { key: 'show', label: 'SHOW' },
            { key: 'delete', label: 'DELETE' },
            story.isCompleted
              ? { key: 'ongoing', label: 'ONGOING' }
              : { key: 'completed', label: 'COMPLETED' },
          ]}
        />
      );
    }
    if (story && story.status === 'UNDER_REVIEW') {
      return null;
    }
    return (
      <Menu
        onClick={({ key }) => handleMenuClick(key, id)}
        items={[
          story && story.status === 'PUBLISHED' && { key: 'setting', label: 'SETTING' },
          { key: 'hide', label: 'HIDE' },
          story && story.isCompleted
            ? { key: 'ongoing', label: 'ONGOING' }
            : { key: 'completed', label: 'COMPLETED' },
        ].filter(Boolean)}
      />
    );
  };

  const isValidBase64Url = (url) => {
    return /^data:image\/(jpeg|png|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(url);
  };

  return (
    <div className="writerworkspace-page">
      <WriterNavbar />
      <div className="writerworkspace-content">
        <div className="writerworkspace-header">
          <h2 className="writerworkspace-title">Stories</h2>
          <Button
            type="primary"
            className="writerworkspace-create-btn"
            onClick={() => navigate('/writercreate')}
          >
            + CREATE STORIES
          </Button>
        </div>
        <div className="writerworkspace-board">
          <div className="writerworkspace-board-header">
            <span className="board-column">STORIES</span>
            <span className="board-column">CHAPTERS</span>
            <span className="board-column">WORDS</span>
            <span className="board-column">OPERATIONS</span>
          </div>
          <div className="writerworkspace-board-body">
            {initialLoading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" />
              </div>
            ) : stories.length === 0 ? (
              <div className="no-data-placeholder">No data! Create your first book~</div>
            ) : (
              <>
                {stories.map((story, index) => {
                  const isLastElement = stories.length === index + 1;
                  return (
                    <div
                      ref={isLastElement ? lastStoryElementRef : null}
                      className="writerworkspace-board-row"
                      key={story.id}
                    >
                      <div className="board-column story-info">
                        <img
                          src={
                            story.coverImgUrl && isValidBase64Url(story.coverImgUrl)
                              ? story.coverImgUrl
                              : require('../../assets/images/novel_default.png')
                          }
                          alt={story.title}
                          className="story-cover"
                        />
                        <div className="story-details">
                          <span className="story-title">{story.title}</span>
                          <div className="story-tags">
                            {story.status === 'UNDER_REVIEW' && (
                              <span className="story-status-tag story-status-UNDER_REVIEW">
                                UNDER REVIEW
                              </span>
                            )}
                            {story.status === 'DRAFT' && (
                              <span
                                className="story-status-tag story-status-draft"
                                onClick={() => handleUnsuccessClick(story)}
                              >
                                UNSUCCESSFUL
                              </span>
                            )}
                            {story.status === 'HIDDEN' && (
                              <span
                                className="story-status-tag story-status-hidden"
                                onClick={() => handleUnsuccessClick(story)}
                              >
                                HIDDEN
                              </span>
                            )}
                            {story.isCompleted && (
                              <span className="story-status-tag story-status-completed">
                                COMPLETED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="board-column story-chapters">{story.chapterCnt}</div>
                      <div className="board-column story-words">{story.wordCnt}</div>
                      <div className="board-column story-operations">
                        <Button
                          type="primary"
                          className="explore-btn"
                          onClick={() => handleExplore(story.id)}
                        >
                          EXPLORE
                        </Button>
                        {story.status !== 'UNDER_REVIEW' && (
                          <Dropdown overlay={menu(story.id)} trigger={['click']}>
                            <Button type="text" icon={<EllipsisOutlined />} />
                          </Dropdown>
                        )}
                      </div>
                    </div>
                  );
                })}
                {listLoading && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Spin />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Modal
          open={deleteModal.visible}
          title="Confirm to delete it?"
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
          open={unsuccessModal.visible}
          title="Unsuccessful created, please modify and recreate!"
          onCancel={handleUnsuccessClose}
          footer={[
            <Button key="recreate" type="primary" onClick={handleRecreate}>
              Recreate
            </Button>,
            <Button
              key="delete"
              danger
              onClick={() => {
                setDeleteModal({ visible: true, id: unsuccessModal.story?.id });
                setUnsuccessModal({ visible: false, story: null });
              }}
            >
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

export default WriterWorkspace;
