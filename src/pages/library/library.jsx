import { useCallback, useEffect, useState, useRef } from 'react';
import { Button, Typography, Modal, Spin } from 'antd';
import { EditOutlined, CheckCircleFilled, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './library.css';
import libraryService from '../../services/library';
import historyService from '../../services/history';

const { Title, Text } = Typography;

const PAGE_SIZE = 5;

const Library = () => {
  const [editMode, setEditMode] = useState(false);
  const [novels, setNovels] = useState([]);
  const [novelsPage, setNovelsPage] = useState(0);
  const [novelsHasMore, setNovelsHasMore] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tab, setTab] = useState('library');
  const [historyList, setHistoryList] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(true);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const navigate = useNavigate();
  const observer = useRef();

  useEffect(() => {
    setNovels([]);
    setNovelsPage(0);
    setNovelsHasMore(true);
    setHistoryList([]);
    setHistoryPage(0);
    setHistoryHasMore(true);
    setLoading(true);
  }, [tab]);

  useEffect(() => {
    if (tab !== 'library') return;
    const fetchLibraryData = async () => {
      setListLoading(true);
      try {
        const filters = { size: PAGE_SIZE, page: novelsPage };
        const novelsRes = await libraryService.getLibraryNovels(filters);
        const content = novelsRes.data.content || [];
        setNovels((prev) => (novelsPage === 0 ? content : [...prev, ...content]));
        setNovelsHasMore(content.length === PAGE_SIZE);
        console.log('Fetched library novels:', content);
      } catch (error) {
        setErrorMsg(error.message || 'Failed to load library.');
        setErrorModal(true);
      } finally {
        setLoading(false);
        setListLoading(false);
      }
    };
    fetchLibraryData();
  }, [tab, novelsPage]);

  useEffect(() => {
    if (tab !== 'history') return;
    const fetchHistoryData = async () => {
      setListLoading(true);
      try {
        const filters = { size: PAGE_SIZE, page: historyPage };
        const historyRes = await historyService.getHistoryNovels(filters);
        const content = historyRes.content || [];
        setHistoryList((prev) => (historyPage === 0 ? content : [...prev, ...content]));
        setHistoryHasMore(content.length === PAGE_SIZE);
      } catch (error) {
        setErrorMsg(error.message || 'Failed to load history.');
        setErrorModal(true);
      } finally {
        setLoading(false);
        setListLoading(false);
      }
    };
    fetchHistoryData();
  }, [tab, historyPage]);

  const lastElementRef = useCallback(
    (node) => {
      if (listLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (tab === 'library' && novelsHasMore) {
            setNovelsPage((prevPage) => prevPage + 1);
          }
          if (tab === 'history' && historyHasMore) {
            setHistoryPage((prevPage) => prevPage + 1);
          }
        }
      });
      if (node) observer.current.observe(node);
    },
    [listLoading, novelsHasMore, historyHasMore, tab]
  );

  const handleEdit = () => {
    setEditMode(true);
    setSelectedIds([]);
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleRemove = async () => {
    try {
      await Promise.all(selectedIds.map((id) => libraryService.deleteNovelFromLibrary(id)));

      setNovels((prev) => prev.filter((novel) => !selectedIds.includes(novel.novelId)));

      setEditMode(false);
      setSelectedIds([]);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to remove novels.');
      setErrorModal(true);
    }
  };

  const handleDelete = async (historyId) => {
    try {
      await historyService.deleteHistoryById(historyId);
      setHistoryList((prev) => prev.filter((item) => (item.historyId || item.id) !== historyId));
    } catch (error) {
      setErrorMsg(error.message || 'Failed to delete history.');
      setErrorModal(true);
    }
  };

  const handleClearHistory = async () => {
    try {
      await historyService.clearHistory();
      setHistoryList([]);
      setHistoryHasMore(false);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to clear history.');
      setErrorModal(true);
    }
  };

  const isValidBase64Url = (url) => {
    return /^data:image\/(jpeg|png|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(url);
  };

  const renderLibraryList = () => {
    if (loading)
      return (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      );
    if (novels.length === 0) return <div className="no-data-container">No data.</div>;

    return (
      <>
        <div className="library-novel-list">
          {novels.map((novel, index) => {
            const isLastElement = novels.length === index + 1;
            return (
              <div
                ref={isLastElement ? lastElementRef : null}
                className="library-novel-card"
                key={novel.novelId}
                onClick={
                  editMode
                    ? () => handleSelect(novel.novelId)
                    : () => navigate(`/read/${novel.novelId}/${novel.chapterNumber}`)
                }
              >
                <div className="library-novel-img-wrapper">
                  <img
                    src={
                      novel.novelCover && isValidBase64Url(novel.novelCover)
                        ? novel.novelCover
                        : require('../../assets/images/novel_default.png')
                    }
                    alt={novel.novelTitle}
                    className="library-novel-img"
                  />
                  {editMode && (
                    <div className="library-novel-mask">
                      <span
                        className={`library-novel-check ${selectedIds.includes(novel.novelId) ? 'checked' : ''}`}
                      >
                        <CheckCircleFilled />
                      </span>
                    </div>
                  )}
                </div>
                <div className="library-novel-title">{novel.novelTitle}</div>
                <div className="library-novel-progress">
                  <Text type="secondary">
                    Progress {novel.chapterNumber}/{novel.chapterCnt}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
        {listLoading && (
          <div className="loading-container">
            <Spin />
          </div>
        )}
      </>
    );
  };

  const renderHistoryList = () => {
    if (loading)
      return (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      );
    if (historyList.length === 0) return <div className="no-data-container">No data.</div>;

    return (
      <>
        <div className="history-chapters-list">
          {historyList.map((item, index) => {
            const isLastElement = historyList.length === index + 1;
            return (
              <div
                ref={isLastElement ? lastElementRef : null}
                className="history-chapter-row hoverable-history-row"
                key={item.historyId || item.id}
                onClick={() => navigate(`/read/${item.novelId}/${item.chapterNumber}`)}
              >
                <div className="history-chapter-content">
                  <img
                    src={
                      item.novelCover && isValidBase64Url(item.novelCover)
                        ? item.novelCover
                        : require('../../assets/images/novel_default.png')
                    }
                    alt={item.novelTitle}
                    className="history-novel-cover"
                  />
                  <div className="history-details">
                    <div className="history-novel-title">{item.novelTitle}</div>
                    <div className="history-novel-info">
                      {item.categoryName && <span>[{item.categoryName}]</span>}
                      {item.novelAuthor && <span>by {item.novelAuthor}</span>}
                    </div>
                  </div>
                  <div className="history-progress">
                    <span>
                      Progress: {item.chapterNumber}/{item.chapterCnt}
                    </span>
                  </div>
                </div>
                <span className="history-arrow">
                  <RightOutlined />
                </span>
                <Button
                  className="history-delete-btn"
                  size="small"
                  type="primary"
                  danger
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.historyId || item.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
        {listLoading && (
          <div className="loading-container">
            <Spin />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="library-page">
      <div className="library-header-row">
        <Title level={2} className="library-title">
          Library
        </Title>
        {tab === 'library' && !editMode ? (
          <Button
            type="text"
            icon={<EditOutlined />}
            className="library-edit-btn"
            onClick={handleEdit}
          >
            EDIT
          </Button>
        ) : (
          tab === 'library' && (
            <div className="library-edit-actions">
              <Button
                type="text"
                className="library-remove-btn"
                disabled={selectedIds.length === 0}
                onClick={handleRemove}
              >
                Remove
              </Button>
              <Button type="text" className="library-cancel-btn" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )
        )}
        {tab === 'history' && (
          <Button
            type="text"
            className="library-edit-btn"
            onClick={handleClearHistory}
            icon={<EditOutlined />}
          >
            CLEAR ALL HISTORY
          </Button>
        )}
      </div>
      <div className="library-tab-bar">
        <div
          className={`library-tab ${tab === 'library' ? 'active' : ''}`}
          onClick={() => setTab('library')}
        >
          Library
        </div>
        <div
          className={`library-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </div>
      </div>
      <div className="library-main-container">
        {tab === 'library' ? renderLibraryList() : renderHistoryList()}
      </div>
      <Modal /* Error Modal */
        open={errorModal}
        onCancel={() => setErrorModal(false)}
        footer={[
          <Button key="confirm" type="primary" onClick={() => setErrorModal(false)}>
            Confirm
          </Button>,
        ]}
        centered
        closable={false}
        maskClosable={false}
        style={{ textAlign: 'center' }}
      >
        <div className="error-modal-content">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#ff4d4f" />
            <path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.2" fill="#fff" />
          </svg>
          {errorMsg}
        </div>
      </Modal>
    </div>
  );
};

export default Library;
