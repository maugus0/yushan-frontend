import React, { useCallback, useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import { EditOutlined, CheckCircleFilled, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './library.css';
import libraryService from '../../services/library';
import historyService from '../../services/history';

const { Title, Text } = Typography;

const PAGE_SIZE = 1000;

const Library = () => {
  const [editMode, setEditMode] = useState(false);
  const [novels, setNovels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tab, setTab] = useState('library');
  const [historyList, setHistoryList] = useState([]);
  const navigate = useNavigate();

  const fetchLibraryData = useCallback(async () => {
    const filters = {
      size: PAGE_SIZE,
      page: 0,
    };
    const novels = await libraryService.getLibraryNovels(filters);
    console.log(novels.data.content);
    setNovels(novels.data.content);
  }, []);

  const fetchHistoryData = useCallback(async () => {
    const filters = {
      size: PAGE_SIZE,
      page: 0,
    };
    const historynovels = await historyService.getHistoryNovels(filters);
    console.log(historynovels.content);
    setHistoryList(historynovels.content);
  }, []);

  useEffect(() => {
    if (tab === 'library') {
      fetchLibraryData();
    }
  }, [tab, fetchLibraryData]);

  useEffect(() => {
    if (tab === 'history') {
      fetchHistoryData();
    }
  }, [tab, fetchHistoryData]);

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

  const handleRemove = () => {
    const deleteNovelsFromLibrary = async (ids) => {
      await Promise.all(ids.map((id) => libraryService.deleteNovelFromLibrary(id)));
      await fetchLibraryData();
      setEditMode(false);
      setSelectedIds([]);
    };
    deleteNovelsFromLibrary(selectedIds);
  };

  const handleDelete = async (historyId) => {
    await historyService.deleteHistoryById(historyId);
    fetchHistoryData();
  };

  const handleClearHistory = async () => {
    await historyService.clearHistory();
    fetchHistoryData();
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
            onClick={() => handleClearHistory()}
            style={{ marginLeft: 12 }}
            icon={<EditOutlined />}
          >
            CLEAR ALL HISTORY
          </Button>
        )}
      </div>
      <div className="library-tab-bar">
        <div
          className={`library-tab${tab === 'library' ? ' active' : ''}`}
          onClick={() => setTab('library')}
        >
          Library
        </div>
        <div
          className={`library-tab${tab === 'history' ? ' active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </div>
      </div>
      <div className="library-main-container">
        {tab === 'library' ? (
          <>
            <div className="library-novel-list">
              {novels.length === 0 ? (
                <div
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    color: '#aaa',
                    padding: '32px 0',
                    fontSize: 16,
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e1e6f5',
                  }}
                >
                  No data.
                </div>
              ) : (
                novels.map((novel) => (
                  <div
                    className="library-novel-card"
                    key={novel.novelId}
                    style={{ cursor: editMode ? 'pointer' : 'pointer' }}
                    onClick={
                      editMode
                        ? () => handleSelect(novel.novelId)
                        : () => navigate(`/read/${novel.novelId}/${novel.chapterNumber}`)
                    }
                  >
                    <div className="library-novel-img-wrapper" style={{ position: 'relative' }}>
                      <img
                        src={novel.novelCover}
                        alt={novel.novelTitle}
                        className="library-novel-img"
                        width={140}
                        height={186}
                      />
                      {editMode && (
                        <div
                          className="library-novel-mask"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(novel.novelId);
                          }}
                          style={{
                            cursor: 'pointer',
                            background: selectedIds.includes(novel.novelId)
                              ? 'rgba(81,95,160,0.18)'
                              : 'rgba(40,49,87,0.18)',
                          }}
                        >
                          <span
                            className={`library-novel-check${selectedIds.includes(novel.novelId) ? ' checked' : ''}`}
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
                ))
              )}
            </div>
          </>
        ) : (
          <div className="history-chapters-list-box">
            <div className="history-chapters-list">
              {historyList.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#aaa',
                    padding: '32px 0',
                    width: '100%',
                    fontSize: 16,
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e1e6f5',
                  }}
                >
                  No data.
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    className="history-chapter-row hoverable-history-row"
                    key={item.historyId || item.id}
                    style={{
                      background: '#fff',
                      borderRadius: 10,
                      margin: '16px 0',
                      boxShadow: '0 2px 8px rgba(81,95,160,0.06)',
                      padding: 0,
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                    onClick={() => navigate(`/read/${item.novelId}/${item.chapterNumber}`)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/read/${item.novelId}/${item.chapterNumber}`);
                      }
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 24,
                        padding: 18,
                        width: '100%',
                      }}
                    >
                      <img
                        src={item.novelCover}
                        alt={item.novelTitle}
                        style={{
                          width: 70,
                          height: 94,
                          objectFit: 'cover',
                          borderRadius: 8,
                          boxShadow: '0 2px 8px rgba(81,95,160,0.10)',
                          background: '#f5f5f5',
                          flexShrink: 0,
                          pointerEvents: 'none',
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 18,
                                color: '#283157',
                                marginBottom: 4,
                              }}
                            >
                              {item.novelTitle}
                            </div>
                            <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>
                              {item.categoryName ? (
                                <span style={{ color: '#515fa0' }}>[{item.categoryName}]</span>
                              ) : null}
                              {item.novelAuthor ? (
                                <span style={{ marginLeft: 8 }}>by {item.novelAuthor}</span>
                              ) : null}
                            </div>
                            {item.synopsis && (
                              <div style={{ fontSize: 13, color: '#aaa', marginBottom: 2 }}>
                                {item.synopsis}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              minWidth: 120,
                              marginRight: 24,
                            }}
                          >
                            <span
                              style={{
                                color: '#515fa0',
                                fontWeight: 500,
                                fontSize: 15,
                                marginRight: 16,
                              }}
                            >
                              Progress: {item.chapterNumber}/{item.chapterCnt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: 32, pointerEvents: 'none' }} />
                    </div>
                    <span
                      className="history-arrow"
                      style={{
                        position: 'absolute',
                        right: 64,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                        pointerEvents: 'none',
                      }}
                    >
                      <RightOutlined />
                    </span>
                    <Button
                      className="history-delete-btn"
                      size="small"
                      type="primary"
                      danger
                      style={{
                        position: 'absolute',
                        right: 12,
                        bottom: 12,
                        zIndex: 3,
                        fontSize: 12,
                        height: 22,
                        lineHeight: '20px',
                        padding: '0 10px',
                        minWidth: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.historyId || item.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
