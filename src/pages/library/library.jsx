import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { EditOutlined, CheckCircleFilled } from '@ant-design/icons';
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

const Library = () => {
  const [editMode, setEditMode] = useState(false);
  const [novels, setNovels] = useState(initialNovels);
  const [selectedIds, setSelectedIds] = useState([]);

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

  return (
    <div className="library-page">
      <div className="library-header-row">
        <Title level={2} className="library-title">
          Library
        </Title>
        {!editMode ? (
          <Button type="text" icon={<EditOutlined />} className="library-edit-btn" onClick={handleEdit}>
            EDIT
          </Button>
        ) : (
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
        )}
      </div>
      <div className="library-main-container">
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
                    <span className={`library-novel-check ${selectedIds.includes(novel.id) ? 'checked' : ''}`}>
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
      </div>
    </div>
  );
};

export default Library;
