import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerstoryprofile.css';
import { useNavigate } from 'react-router-dom';
import novelService from '../../services/novel';


const WriterStoryProfile = () => {
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ visible: false, idx: null });
  const [chapterTab, setChapterTab] = useState('published');
  const [story, setStory] = useState([]);

  const searchParams = new URLSearchParams(window.location.search);
  const storyId = searchParams.get('id');

  useEffect(() => {
    const getStory = async () => {
      console.log('id: ', storyId);
      await novelService.getNovelById(storyId).then(fetchedStory => {
        
        console.log('fetchedStory: ', fetchedStory);
        if (fetchedStory) {
          setStory(fetchedStory);
        }
      })
    };
    getStory();
  }, []);

  const tabList = [
    { key: 'published', label: 'PUBLISHED' },
    { key: 'draft', label: 'DRAFT' },
    { key: 'hidden', label: 'HIDDEN' },
  ];

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
              src={story.coverImgUrl}
              alt="cover"
              className="storyprofile-cover"
              width={210}
              height={280}
            />
            <div className="storyprofile-info">
              <div className="storyprofile-title">{story.title}</div>
              <div className="storyprofile-meta">
                BY <span className="storyprofile-author">{story.authorUsername}</span> / IN{' '}
                <span className="storyprofile-type">{story.categoryName}</span>
              </div>
              <div className="storyprofile-stats-box">
                <div className="storyprofile-stats-row">
                  <div className="storyprofile-stat-label">Chapters Num</div>
                  <div className="storyprofile-stat-label">Words</div>
                  <div className="storyprofile-stat-label">Comments</div>
                </div>
                <div className="storyprofile-stats-row">
                  <div className="storyprofile-stat-value">{story.chapterCnt}</div>
                  <div className="storyprofile-stat-value">{story.wordCnt}</div>
                  <div className="storyprofile-stat-value">{story.reviewCnt}</div>
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
              {story.chapters && story.chapters.map((chapter, idx) => (
                <div
                  className="storyprofile-chapter-row"
                  key={idx}
                  onMouseEnter={() => { }}
                  onMouseLeave={() => { }}
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
