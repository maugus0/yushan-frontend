import { useState } from 'react';
import { Button, Typography } from 'antd';
import {
  EditOutlined,
  CheckCircleFilled,
  StarFilled,
  CheckOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import './library.css';

const { Title, Text } = Typography;

const initialNovels = [
  {
    id: 1,
    title: 'Novel One',
    cover: require('../../assets/images/testimg.png'),
    progress: '12/100',
  },
  {
    id: 2,
    title: 'Novel Two',
    cover: 'https://via.placeholder.com/140x186?text=Novel+2',
    progress: '45/200',
  },
  {
    id: 3,
    title: 'Novel Three',
    cover: 'https://via.placeholder.com/140x186?text=Novel+3',
    progress: '78/300',
  },
  {
    id: 4,
    title: 'Novel Four',
    cover: 'https://via.placeholder.com/140x186?text=Novel+4',
    progress: '23/150',
  },
  {
    id: 5,
    title: 'Novel Five',
    cover: 'https://via.placeholder.com/140x186?text=Novel+5',
    progress: '99/120',
  },
  {
    id: 6,
    title: 'Novel Six',
    cover: 'https://via.placeholder.com/140x186?text=Novel+6',
    progress: '10/80',
  },
];

const historyData = [
  {
    id: 1,
    title: 'Novel One',
    cover: require('../../assets/images/testimg.png'),
    desc: 'A fantasy adventure about a hero who saves the world from darkness. This is a long description that should be truncated after two lines.',
    stars: 4,
    progress: '12/100',
    inLibrary: true,
  },
  {
    id: 2,
    title: 'Novel Two',
    cover: 'https://via.placeholder.com/140x186?text=Novel+2',
    desc: 'A romantic comedy set in a magical school.',
    stars: 5,
    progress: '45/200',
    inLibrary: false,
  },
  {
    id: 3,
    title: 'The Lost Empire',
    cover: 'https://via.placeholder.com/140x186?text=Novel+3',
    desc: 'Epic tale of a lost empire and its last survivors. Mystery, intrigue, and adventure await.',
    stars: 3,
    progress: '88/300',
    inLibrary: false,
  },
  {
    id: 4,
    title: 'Star Chronicles',
    cover: 'https://via.placeholder.com/140x186?text=Novel+4',
    desc: 'Sci-fi saga across galaxies. Heroes rise and fall in the quest for peace.',
    stars: 5,
    progress: '120/400',
    inLibrary: true,
  },
  {
    id: 5,
    title: 'Slice of Life',
    cover: 'https://via.placeholder.com/140x186?text=Novel+5',
    desc: 'A gentle story about everyday momentssssssssss sssssssssssssssssssss ssssssssssssssssssssssssssssss ssssssss sssssssss ssss ssssssss ssss sssssssss ssssssss ssssssssss ssss sssss ssssss s s ss ssssss ssss ssss ss sssss sss ssss sssss ssss sss, friendship, and growth.',
    stars: 2,
    progress: '15/80',
    inLibrary: false,
  },
  {
    id: 6,
    title: 'Romance in Paris',
    cover: 'https://via.placeholder.com/140x186?text=Novel+6',
    desc: 'Love blooms in the city of lights. A heartwarming romantic journey.',
    stars: 4,
    progress: '60/120',
    inLibrary: true,
  },
];

const Library = () => {
  const [editMode, setEditMode] = useState(false);
  const [novels, setNovels] = useState(initialNovels);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tab, setTab] = useState('library');
  const [historyList, setHistoryList] = useState(historyData);

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
    setNovels((prev) => prev.filter((novel) => !selectedIds.includes(novel.id)));
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
              <div className="library-novel-card" key={novel.id}>
                <div className="library-novel-img-wrapper" style={{ position: 'relative' }}>
                  <img
                    src={novel.cover}
                    alt={novel.title}
                    className="library-novel-img"
                    width={140}
                    height={186}
                  />
                  {editMode && (
                    <div
                      className="library-novel-mask"
                      onClick={() => handleSelect(novel.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span
                        className={`library-novel-check ${selectedIds.includes(novel.id) ? 'checked' : ''}`}
                      >
                        <CheckCircleFilled />
                      </span>
                    </div>
                  )}
                </div>
                <div className="library-novel-title">{novel.title}</div>
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
