import React, { useState } from 'react';
import { Button, Dropdown, Menu, Modal } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerworkspace.css';
import { useNavigate } from 'react-router-dom';

const storiesData = [
  {
    id: 1,
    title: 'The Lost Empire',
    cover: 'https://via.placeholder.com/60x80?text=Story+1',
    chapters: 12,
    words: 45000,
  },
  {
    id: 2,
    title: 'Romance in Paris',
    cover: 'https://via.placeholder.com/60x80?text=Story+2',
    chapters: 8,
    words: 32000,
  },
];

const WriterWorkspace = () => {
  const [stories, setStories] = useState(storiesData);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: null });

  const handleMenuClick = (key, id) => {
    if (key === 'setting') {
      navigate(`/writerstorysetting?id=${id}`);
    }
    if (key === 'delete') {
      setDeleteModal({ visible: true, id });
    }
    // Add logic for other operations like "hide" if needed
  };

  const handleExplore = (id) => {
    navigate('/writerstoryprofile');
  };

  const handleDeleteConfirm = () => {
    setStories((prev) => prev.filter((story) => story.id !== deleteModal.id));
    setDeleteModal({ visible: false, id: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ visible: false, id: null });
  };

  const menu = (id) => (
    <Menu
      onClick={({ key }) => handleMenuClick(key, id)}
      items={[
        { key: 'setting', label: 'SETTING' },
        { key: 'delete', label: 'DELETE' },
      ]}
    />
  );

  return (
    <div className="writerworkspace-page">
      <WriterNavbar />
      <div className="writerworkspace-content">
        <div className="writerworkspace-header">
          <h2 className="writerworkspace-title">Stories</h2>
          <Button
            type="primary"
            className="writerworkspace-create-btn"
            onClick={() => {
              navigate('/writercreate');
            }}
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
            {stories.map((story) => (
              <div className="writerworkspace-board-row" key={story.id}>
                <div className="board-column">
                  <img src={story.cover} alt={story.title} className="story-cover" />
                  <span className="story-title">{story.title}</span>
                </div>
                <div className="board-column">{story.chapters}</div>
                <div className="board-column">{story.words}</div>
                <div className="board-column">
                  <Button
                    type="primary"
                    className="explore-btn"
                    onClick={() => {
                      handleExplore(story.id);
                    }}
                  >
                    EXPLORE
                  </Button>
                  <Dropdown overlay={menu(story.id)} trigger={['click']}>
                    <Button type="text" icon={<EllipsisOutlined />} />
                  </Dropdown>
                </div>
              </div>
            ))}
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
        >
          {/* 可在这里加一些提示内容 */}
        </Modal>
      </div>
    </div>
  );
};

export default WriterWorkspace;
