import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerstoryprofile.css';
import { useNavigate } from 'react-router-dom';

const story = {
  cover: 'https://via.placeholder.com/210x280?text=Cover',
  title: 'The Lost Empire',
  author: 'John Doe',
  type: 'Fantasy',
  chaptersNum: 12,
  words: 45000,
  comments: 32,
  chapters: [
    { name: 'Chapter 1: The Beginning', updated: '17:20 03 Oct 2025' },
    { name: 'Chapter 2: The Journey', updated: '09:15 04 Oct 2025' },
    { name: 'Chapter 3: The Encounter', updated: '21:00 05 Oct 2025' },
  ],
};

const WriterStoryProfile = () => {
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ visible: false, idx: null });

  const handleEdit = (idx) => {
    console.log('Edit chapter index:', idx);  
  };

  const handleDelete = (idx) => {
    setDeleteModal({ visible: true, idx });
  };

  const handleDeleteConfirm = () => {
    // story.chapters.splice(deleteModal.idx, 1);
    setDeleteModal({ visible: false, idx: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ visible: false, idx: null });
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
            onClick={() => {
              navigate('/writercreatechapters');
            }}
          >
            + CREATE CHAPTERS
          </Button>
        </div>
        <div className="storyprofile-content-box">
          <div className="storyprofile-main-row">
            <img
              src={story.cover}
              alt="cover"
              className="storyprofile-cover"
              width={210}
              height={280}
            />
            <div className="storyprofile-info">
              <div className="storyprofile-title">{story.title}</div>
              <div className="storyprofile-meta">
                BY <span className="storyprofile-author">{story.author}</span> / IN{' '}
                <span className="storyprofile-type">{story.type}</span>
              </div>
              <div className="storyprofile-stats-box">
                <div className="storyprofile-stats-row">
                  <div className="storyprofile-stat-label">Chapters Num</div>
                  <div className="storyprofile-stat-label">Words</div>
                  <div className="storyprofile-stat-label">Comments</div>
                </div>
                <div className="storyprofile-stats-row">
                  <div className="storyprofile-stat-value">{story.chaptersNum}</div>
                  <div className="storyprofile-stat-value">{story.words}</div>
                  <div className="storyprofile-stat-value">{story.comments}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="storyprofile-chapters-list-box">
            <div className="storyprofile-chapters-title">CHAPTERS</div>
            <div className="storyprofile-chapters-list">
              {story.chapters.map((chapter, idx) => (
                <div
                  className="storyprofile-chapter-row"
                  key={idx}
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                >
                  <span className="storyprofile-chapter-name">{chapter.name}</span>
                  <span className="storyprofile-chapter-actions">
                    <span className="storyprofile-chapter-edit" onClick={() => handleEdit(idx)}>
                      EDIT
                    </span>
                    <span className="storyprofile-chapter-delete" onClick={() => handleDelete(idx)}>
                      DELETE
                    </span>
                    <span className="storyprofile-chapter-date">{chapter.updated}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default WriterStoryProfile;
