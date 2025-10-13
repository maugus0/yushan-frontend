import React, { useEffect, useState } from 'react';
import { Tabs, Select } from 'antd';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerinteraction.css';
import novelService from '../../services/novel';
import userService from '../../services/user';
import reviewService from '../../services/review';
import commentService from '../../services/comments';

const PAGE_SIZE = 1000;

const WriterInteraction = () => {
  const [novels, setNovels] = useState([]);
  const [reviewsTab, setReviewsTab] = useState('reviews');
  const [selectedNovelId, setSelectedNovelId] = useState(null);

  const [reviewsList, setReviewsList] = useState([]);

  const [commentsList, setCommentsList] = useState([]);

  useEffect(() => {
    const getNovelData = async () => {
      const author = await userService.getMe();
      const data = await novelService.getNovel({ authorId: author.uuid });
      setNovels(data || []);
      if (data && data.length > 0) {
        setSelectedNovelId(data[0].id);
      }
    };
    getNovelData();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedNovelId) {
        setReviewsList([]);
        return;
      }
      const filters = { page: 0, size: PAGE_SIZE, novelId: selectedNovelId };
      const res = await reviewService.getReviewsByNovelId(filters);
      setReviewsList(res.content || []);
    };
    if (reviewsTab === 'reviews') fetchReviews();
  }, [selectedNovelId, reviewsTab]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!selectedNovelId) {
        setCommentsList([]);
        return;
      }
      const filters = { page: 0, size: PAGE_SIZE, novelId: selectedNovelId };
      const res = await commentService.getCommentsByNovelId(filters);
      setCommentsList(res.comments || []);
    };
    if (reviewsTab === 'comments') fetchComments();
  }, [selectedNovelId, reviewsTab]);

  const currentList = reviewsTab === 'reviews' ? reviewsList : commentsList;

  return (
    <div className="writerinteraction-page">
      <WriterNavbar />
      <div className="writerinteraction-content">
        <div className="writerinteraction-header">
          <h2 className="writerinteraction-title">Interaction</h2>
          <Select
            style={{ minWidth: 200, marginLeft: 'auto' }}
            value={selectedNovelId}
            onChange={setSelectedNovelId}
            options={novels.map((n) => ({ label: n.title, value: n.id }))}
            placeholder="Select a novel"
          />
        </div>
        <div className="writerinteraction-main">
          <div style={{ marginBottom: 8 }}></div>
          <div className="writerinteraction-filter-row">
            <Tabs
              activeKey={reviewsTab}
              onChange={setReviewsTab}
              items={[
                { key: 'reviews', label: 'REVIEWS' },
                { key: 'comments', label: 'COMMENTS' },
              ]}
              style={{ flex: 1 }}
            />
          </div>
          <div className="writerinteraction-list-box">
            <div className="writerinteraction-list-header-2">
              <span className="writerinteraction-list-col-content">CONTENT</span>
              <span className="writerinteraction-list-col-reader">READER</span>
            </div>
            <div className="writerinteraction-list-body">
              {currentList.length === 0 && (
                <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
                  No data.
                </div>
              )}
              {reviewsTab === 'reviews'
                ? currentList.map((item) => (
                    <div className="writerinteraction-list-row-2" key={item.id + '_review'}>
                      <span className="writerinteraction-list-content">{item.content}</span>
                      <span className="writerinteraction-list-reader">{item.username}</span>
                    </div>
                  ))
                : currentList.map((item) => (
                    <div className="writerinteraction-list-row-2" key={item.id + '_comment'}>
                      <span className="writerinteraction-list-content">
                        <span style={{ fontWeight: 500 }}>{item.chapterTitle}</span>
                        <br />
                        {item.content}
                      </span>
                      <span className="writerinteraction-list-reader">{item.username}</span>
                    </div>
                  ))}
            </div>
            {/* 移除分页按钮 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriterInteraction;
