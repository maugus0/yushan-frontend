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
    cover: require('../../assets/images/testimg.png'),
    chapters: 12,
    words: 45000,
    hidden: false,
    complete: false,
    status: 'pending',
  },
  {
    id: 2,
    title: 'Romance in Paris',
    cover: require('../../assets/images/testimg2.png'),
    chapters: 8,
    words: 32000,
    hidden: false,
    complete: false,
    status: 'unsuccessful',
    reason: 'Your story was rejected because the synopsis is too short.',
  },
  {
    id: 3,
    title: 'Normal Story',
    cover: require('../../assets/images/testimg2.png'),
    chapters: 5,
    words: 20000,
    hidden: false,
    complete: false,
  },
];

const WriterWorkspace = () => {
  const [stories, setStories] = useState(storiesData);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: null });
  const [unsuccessModal, setUnsuccessModal] = useState({ visible: false, story: null });

  const handleMenuClick = (key, id) => {
    if (key === 'setting') {
      navigate(`/writerstorysetting?id=${id}`);
    }
    if (key === 'hide') {
      setStories(prev =>
        prev.map(story =>
          story.id === id ? { ...story, hidden: true } : story
        )
      );
    }
    if (key === 'show') {
      setStories(prev =>
        prev.map(story =>
          story.id === id ? { ...story, hidden: false } : story
        )
      );
    }
    if (key === 'complete') {
      setStories(prev =>
        prev.map(story =>
          story.id === id ? { ...story, complete: true } : story
        )
      );
    }
    if (key === 'ongoing') {
      setStories(prev =>
        prev.map(story =>
          story.id === id ? { ...story, complete: false } : story
        )
      );
    }
    if (key === 'delete') {
      setDeleteModal({ visible: true, id });
    }
  };

  const handleExplore = () => {
    navigate('/writerstoryprofile');
  };

  const handleDeleteConfirm = () => {
    setStories((prev) => prev.filter((story) => story.id !== deleteModal.id));
    setDeleteModal({ visible: false, id: null });
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
    navigate('/writercreate');
  };

  const menu = (id) => {
    const story = stories.find(s => s.id === id);
    if (story && (story.status === 'pending' || story.status === 'unsuccessful')) {
      return (
        <Menu
          onClick={({ key }) => handleMenuClick(key, id)}
          items={[
            { key: 'delete', label: 'DELETE' },
          ]}
        />
      );
    }
    // 正常菜单
    return (
      <Menu
        onClick={({ key }) => handleMenuClick(key, id)}
        items={[
          { key: 'setting', label: 'SETTING' },
          story && story.hidden
            ? { key: 'show', label: 'SHOW' }
            : { key: 'hide', label: 'HIDE' },
          story && story.complete
            ? { key: 'ongoing', label: 'ONGOING' }
            : { key: 'complete', label: 'COMPLETE' },
          { key: 'delete', label: 'DELETE' },
        ]}
      />
    );
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
                  <span className="story-title">
                    {story.title}
                    {story.status === 'pending' && (
                      <span
                        className="story-status-tag story-status-pending"
                        style={{
                          marginLeft: 8,
                          padding: '2px 8px',
                          borderRadius: 8,
                          fontSize: 12,
                          color: '#fff',
                          background: '#faad14',
                        }}
                      >
                        PENDING
                      </span>
                    )}
                    {story.status === 'unsuccessful' && (
                      <span
                        className="story-status-tag story-status-unsuccessful"
                        style={{
                          marginLeft: 8,
                          padding: '2px 8px',
                          borderRadius: 8,
                          fontSize: 12,
                          color: '#fff',
                          background: '#ff4d4f',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleUnsuccessClick(story)}
                      >
                        UNSUCCESSFUL
                      </span>
                    )}
                  </span>
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
        ></Modal>
        <Modal
          open={unsuccessModal.visible}
          title="Reason for Unsuccessful"
          onCancel={handleUnsuccessClose}
          footer={[
            <Button key="recreate" type="primary" onClick={handleRecreate}>
              Recreate
            </Button>,
            <Button key="delete" danger onClick={() => {
              setDeleteModal({ visible: true, id: unsuccessModal.story?.id });
              setUnsuccessModal({ visible: false, story: null });
            }}>
              Delete
            </Button>,
          ]}
          centered
        >
          <div style={{ minHeight: 40, color: '#ff4d4f', fontWeight: 500 }}>
            {unsuccessModal.story?.reason || 'No reason provided.'}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WriterWorkspace;
