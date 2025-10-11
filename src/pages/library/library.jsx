import React, { useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import {
  EditOutlined,
  CheckCircleFilled,
  StarFilled,
  CheckOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import './library.css';
import libraryService from '../../services/library';

const { Title, Text } = Typography;

const Library = () => {
  const [editMode, setEditMode] = useState(false);
  const [novels, setNovels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tab, setTab] = useState('library');
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    const fetchLibraryData = async () => {
      const novels = await libraryService.getLibraryNovels();
      console.log(novels.data.content);
      setNovels(novels.data.content);
    };
    fetchLibraryData();
  }, []);

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
      const updatedNovels = novels.filter((novel) => !ids.includes(novel.novelId));
      setNovels(updatedNovels);
    };
    deleteNovelsFromLibrary(selectedIds);
    setEditMode(false);
    setSelectedIds([]);
  };

  const handleToggleLibrary = (id) => {
    setHistoryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inLibrary: !item.inLibrary } : item))
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
            onClick={() => setHistoryList([])}
            style={{ marginLeft: 12 }}
            icon={<DeleteOutlined />}
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
          <div className="library-novel-list">
            {novels.map((novel) => (
              <div className="library-novel-card" key={novel.novelId}>
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
                      onClick={() => handleSelect(novel.novelId)}
                      style={{ cursor: 'pointer' }}
                    >
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
                  <Text type="secondary">Progress {novel.progress}</Text>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="history-list">
            {historyList.map((novel) => (
              <div className="history-item" key={novel.id}>
                <img
                  src={novel.cover}
                  alt={novel.title}
                  className="history-cover"
                  width={140}
                  height={186}
                />
                <div className="history-info">
                  <div className="history-title">{novel.title}</div>
                  <div className="history-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarFilled
                        key={i}
                        style={{
                          color: i < novel.stars ? '#faad14' : '#e1e6f5',
                          fontSize: 18,
                          marginRight: 2,
                        }}
                      />
                    ))}
                  </div>
                  <div className="history-desc">{novel.desc}</div>
                  <div className="history-bottom-row">
                    <div className="history-progress">
                      <Text type="secondary">Progress {novel.progress}</Text>
                    </div>
                    <div className="history-actions">
                      <Button type="primary" size="small">
                        Continue Reading
                      </Button>
                      {novel.inLibrary ? (
                        <Button
                          type="default"
                          size="small"
                          icon={<CheckOutlined />}
                          className="history-inlibrary-btn"
                          onClick={() => handleToggleLibrary(novel.id)}
                        >
                          IN LIBRARY
                        </Button>
                      ) : (
                        <Button
                          type="default"
                          size="small"
                          onClick={() => handleToggleLibrary(novel.id)}
                        >
                          + ADD TO LIBRARY
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
