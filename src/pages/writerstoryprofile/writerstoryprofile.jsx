import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerstoryprofile.css';
import { useNavigate } from 'react-router-dom';
import novelService from '../../services/novel';
import chapterService from '../../services/chapter';
import dayjs from 'dayjs';

const PAGE_SIZE = 10;

const WriterStoryProfile = () => {
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ visible: false, idx: null });
  const [story, setStory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [chaptersData, setChaptersData] = useState([]);

  const searchParams = new URLSearchParams(window.location.search);
  const storyId = searchParams.get('id');

  const getChapterByNovelId = async () => {
    const res = await chapterService.getChapterByNovelId(storyId, currentPage, PAGE_SIZE);
    setChaptersData(res.data.chapters || []);
    console.log('chapterData: ', res.data.chapters);
  };
  const getStory = async () => {
    await novelService.getNovelById(storyId).then((fetchedStory) => {
      if (fetchedStory) {
        setStory(fetchedStory);
        console.log('fetchedStory: ', fetchedStory);
      }
    });
  };

  useEffect(() => {
    getStory();
  }, [storyId]);

  useEffect(() => {
    getChapterByNovelId();
  }, [storyId, currentPage]);

  const handleEdit = (chapterId) => {
    navigate(`/writercreatechapters/?novelid=${storyId}&chapterid=${chapterId}`);
  };

  const handleDelete = (chapterId) => {
    setDeleteModal({ visible: true, idx: chapterId });
  };

  const handleDeleteConfirm = async () => {
    console.log('deleteModal.id: ', deleteModal.idx);
    await chapterService.deleteChapterByChapterId(deleteModal.idx);
    getChapterByNovelId();
    getStory();
    setDeleteModal({ visible: false, idx: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ visible: false, idx: null });
  };

  const pagedChapters = chaptersData;

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
              navigate('/writercreatechapters?id=' + storyId);
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
              <span className="storyprofile-chapters-title-tab active">CHAPTERS</span>
            </div>
            <div className="storyprofile-chapters-list">
              {pagedChapters.map((chapter) => (
                <div
                  className="storyprofile-chapter-row"
                  key={chapter.uuid}
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                >
                  <span className="storyprofile-chapter-name">{chapter.title}</span>
                  <span className="storyprofile-chapter-actions">
                    <span
                      className="storyprofile-chapter-edit"
                      onClick={() => handleEdit(chapter.uuid)}
                    >
                      EDIT
                    </span>
                    <span
                      className="storyprofile-chapter-delete"
                      onClick={() => handleDelete(chapter.uuid)}
                    >
                      DELETE
                    </span>
                    <span className="storyprofile-chapter-date">
                      {chapter.publishTime
                        ? dayjs(chapter.publishTime).format('YYYY-MM-DD HH:mm:ss')
                        : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '16px 0',
              }}
            >
              <Button
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{ marginRight: 16 }}
              >
                Prev
              </Button>
              <span style={{ fontSize: 15, color: '#515fa0' }}>Page {currentPage}</span>
              <Button
                size="small"
                disabled={pagedChapters.length < PAGE_SIZE}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{ marginLeft: 16 }}
              >
                Next
              </Button>
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
