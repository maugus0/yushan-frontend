import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerstoryprofile.css';
import { useNavigate } from 'react-router-dom';

const story = {
  cover: require('../../assets/images/testimg.png'),
  title: 'The Lost Empire',
  author: 'John Doe',
  type: 'Fantasy',
  chaptersNum: 12,
  words: 45000,
  comments: 32,
  chapters: [
    { name: 'The Beginning', updated: '17:20 03 Oct 2025', type: 'published' },
    { name: 'The Journey', updated: '09:15 04 Oct 2025', type: 'draft' },
    { name: 'The Journey', updated: '09:15 04 Oct 2025', type: 'published' },
    { name: 'The Journey', updated: '09:15 04 Oct 2025', type: 'draft' },
    { name: 'The Journey', updated: '09:15 04 Oct 2025', type: 'draft' },
    { name: 'The Encounter', updated: '21:00 05 Oct 2025', type: 'hidden' },
  ],
};

const tabList = [
  { key: 'draft', label: 'DRAFT' },
  { key: 'published', label: 'PUBLISHED' },
  { key: 'hidden', label: 'HIDDEN' },
];

const WriterStoryProfile = () => {
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ visible: false, idx: null });
  const [chapterTab, setChapterTab] = useState('published');

  const handleEdit = (idx) => {
    let query = '';
    if (chapterTab === 'draft') query = '?from=draft';
    if (chapterTab === 'hidden') query = '?from=hidden';
    navigate(`/writereditcontent/${idx}${query}`);
  };

  const handleDelete = (idx) => {
    setDeleteModal({ visible: true, idx });
  };

  const handleHidden = (idx) => {
    // story.chapters[idx].type = 'hidden';
    // setStory({ ...story });
  }

  const handleDeleteConfirm = () => {
    // story.chapters.splice(deleteModal.idx, 1);
    setDeleteModal({ visible: false, idx: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ visible: false, idx: null });
  };

  const filteredChapters = story.chapters.filter(chapter => chapter.type === chapterTab);

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
            <div className="storyprofile-chapters-title-row">
              {tabList.map(tab => (
                <span
                  key={tab.key}
                  className={
                    'storyprofile-chapters-title-tab' +
                    (chapterTab === tab.key ? ' active' : '')
                  }
                  onClick={() => setChapterTab(tab.key)}
                >
                  {tab.label}
                </span>
              ))}
            </div>
            <div className="storyprofile-chapters-list">
              {filteredChapters.map((chapter, idx) => (
                <div
                  className="storyprofile-chapter-row"
                  key={idx}
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                >
                  <span className="storyprofile-chapter-name">{chapter.name}</span>
                  <span className="storyprofile-chapter-actions">
                    {chapterTab === 'published' && (
                      <span className="storyprofile-chapter-hidden" onClick={() => handleHidden(idx)}>
                        HIDDEN
                      </span>
                    )}
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
