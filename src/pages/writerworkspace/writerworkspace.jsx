import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu, Modal } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerworkspace.css';
import { useNavigate } from 'react-router-dom';
import novelService from '../../services/novel';
import userService from '../../services/user';

const WriterWorkspace = () => {
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: null });
  const [unsuccessModal, setUnsuccessModal] = useState({ visible: false, story: null });

  const fetchStories = async () => {
    const authorId = await userService.getMe();
    const data = await novelService.getNovel({ authorId: authorId.uuid });
    setStories(data);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleMenuClick = async (key, id) => {
    if (key === 'setting') {
      navigate(`/writercreate?id=${id}`);
    }
    if (key === 'hide') {
      await novelService.hideNovelById(id);
      fetchStories();
    }
    if (key === 'show') {
      await novelService.unHideNovelById(id);
      fetchStories();
    }
    if (key === 'delete') {
      setDeleteModal({ visible: true, id });
    }
  };

  const handleExplore = (storyId) => {
    navigate(`/writerstoryprofile?id=${storyId}`);
  };

  const handleDeleteConfirm = async () => {
    console.log('deleteModal.id: ', deleteModal.id);
    // await novelService.deleteNovelById(deleteModal.id);
    fetchStories();
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
    const id = unsuccessModal.story?.id;
    if (id) {
      navigate(`/writercreate?id=${id}`);
    } else {
      navigate('/writercreate');
    }
  };

  const menu = (id) => {
    const story = stories.find((s) => s.id === id);
    if (story && (story.status === 'DRAFT' || story.status === 'UNDER_REVIEW')) {
      return (
        <Menu
          onClick={({ key }) => handleMenuClick(key, id)}
          items={[{ key: 'delete', label: 'DELETE' }]}
        />
      );
    }
    return (
      <Menu
        onClick={({ key }) => handleMenuClick(key, id)}
        items={[
          story && story.status === 'PUBLISHED' && { key: 'setting', label: 'SETTING' },
          story && story.status === 'HIDDEN'
            ? { key: 'show', label: 'SHOW' }
            : { key: 'hide', label: 'HIDE' },
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
          <div className="writerworkspace-board-body" style={{ position: 'relative', minHeight: 200 }}>
            {stories.length === 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  width: '100%',
                  transform: 'translateY(-50%)',
                  textAlign: 'center',
                  fontSize: 22,
                  color: '#aaa',
                  zIndex: 2,
                }}
              >
                No data! Create your first book~
              </div>
            ) : (
              stories.map((story) => (
                <div className="writerworkspace-board-row" key={story.id}>
                  <div className="board-column">
                    <img src={story.coverImgUrl} alt={story.title} className="story-cover" />
                    <span className="story-title">
                      {story.title}
                      {story.status === 'UNDER_REVIEW' && (
                        <span
                          className="story-status-tag story-status-UNDER_REVIEW"
                          style={{
                            marginLeft: 8,
                            padding: '2px 8px',
                            borderRadius: 8,
                            fontSize: 12,
                            color: '#fff',
                            background: '#0a921fff',
                          }}
                        >
                          UNDER REVIEW
                        </span>
                      )}
                      {story.status === 'DRAFT' && (
                        <span
                          className="story-status-tag story-status-draft"
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
                      {story.status === 'HIDDEN' && (
                        <span
                          className="story-status-tag story-status-hidden"
                          style={{
                            marginLeft: 8,
                            padding: '2px 8px',
                            borderRadius: 8,
                            fontSize: 12,
                            color: '#fff',
                            background: '#f2a516ff',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleUnsuccessClick(story)}
                        >
                          HIDDEN
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="board-column">{story.chapterCnt}</div>
                  <div className="board-column">{story.wordCnt}</div>
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
              ))
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
      </div>
    </div>
  );
};

export default WriterWorkspace;
