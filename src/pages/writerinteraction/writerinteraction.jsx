import React, { useEffect, useState } from 'react';
import { Button, Tabs, Modal, Radio, Input, Form, Select } from 'antd';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerinteraction.css';
import novelService from '../../services/novel';
import userService from '../../services/user';
import reviewService from '../../services/review';
import commentService from '../../services/comments';

const PAGE_SIZE = 10;

const reportReasons = [
  'Pornographic Content',
  'Hate or bullying',
  'Release of personal info',
  'Other inappropriate material',
  'Spam',
];

const WriterInteraction = () => {
  const [novels, setNovels] = useState([]);
  const [reviewsTab, setReviewsTab] = useState('reviews');
  const [reportModal, setReportModal] = useState({ visible: false, id: null });
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [abuseContent, setAbuseContent] = useState('');
  const [reportTried, setReportTried] = useState(false);
  const [form] = Form.useForm();
  const [selectedNovelId, setSelectedNovelId] = useState(null);

  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);

  const [commentsList, setCommentsList] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);

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
        setReviewsTotal(0);
        return;
      }
      const filters = { page: reviewsPage, size: PAGE_SIZE };
      const res = await reviewService.getReviewsByNovelId(selectedNovelId, filters);
      setReviewsList(res.content || []);
      setReviewsTotal(res.totalElements || 0);
    };
    if (reviewsTab === 'reviews') fetchReviews();
  }, [selectedNovelId, reviewsPage, reviewsTab]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!selectedNovelId) {
        setCommentsList([]);
        setCommentsTotal(0);
        return;
      }
      const filters = { page: commentsPage, size: PAGE_SIZE };
      // commentService.getCommentsByNovelId 返回 response.data.data
      // 实际后端返回结构是 { comments: [...], totalCount, ... }
      const res = await commentService.getCommentsByNovelId(selectedNovelId, filters);
      setCommentsList(res.comments || []);
      setCommentsTotal(res.totalCount || 0);
    };
    if (reviewsTab === 'comments') fetchComments();
  }, [selectedNovelId, commentsPage, reviewsTab]);

  useEffect(() => {
    setReviewsPage(1);
    setCommentsPage(1);
  }, [reviewsTab, selectedNovelId]);

  const handleReportClick = (id) => {
    setReportModal({ visible: true, id });
    setReportReason(reportReasons[0]);
    setAbuseContent('');
    setReportTried(false);
    form.resetFields();
  };

  const handleReportConfirm = () => {
    setReportTried(true);
    if (!abuseContent.trim()) return;
    setReportModal({ visible: false, id: null });
  };

  const handleReportCancel = () => {
    setReportModal({ visible: false, id: null });
  };

  const currentList = reviewsTab === 'reviews' ? reviewsList : commentsList;
  const currentPage = reviewsTab === 'reviews' ? reviewsPage : commentsPage;
  const total = reviewsTab === 'reviews' ? reviewsTotal : commentsTotal;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handlePrev = () => {
    if (reviewsTab === 'reviews') setReviewsPage((p) => Math.max(1, p - 1));
    else setCommentsPage((p) => Math.max(1, p - 1));
  };
  const handleNext = () => {
    if (reviewsTab === 'reviews') setReviewsPage((p) => p + 1);
    else setCommentsPage((p) => p + 1);
  };

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
              <span className="writerinteraction-list-col-action">ACTION</span>
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
                      <span className="writerinteraction-list-content">
                        <span style={{ fontWeight: 500 }}>{item.title}</span>
                        <br />
                        {item.content}
                      </span>
                      <span className="writerinteraction-list-reader">{item.username}</span>
                      <span className="writerinteraction-list-action">
                        <Button type="link" danger onClick={() => handleReportClick(item.id)}>
                          Report
                        </Button>
                      </span>
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
                      <span className="writerinteraction-list-action">
                        <Button type="link" danger onClick={() => handleReportClick(item.id)}>
                          Report
                        </Button>
                      </span>
                    </div>
                  ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '16px 0' }}>
              <Button
                size="small"
                disabled={currentPage === 1}
                onClick={handlePrev}
                style={{ marginRight: 16 }}
              >
                Prev
              </Button>
              <span style={{ fontSize: 15, color: '#515fa0' }}>
                Page {currentPage} / {totalPages}
              </span>
              <Button
                size="small"
                disabled={currentList.length < PAGE_SIZE}
                onClick={handleNext}
                style={{ marginLeft: 16 }}
              >
                Next
              </Button>
            </div>
          </div>
          <Modal
            open={reportModal.visible}
            title="Report"
            onCancel={handleReportCancel}
            footer={[
              <Button
                key="report"
                type="primary"
                danger
                disabled={!abuseContent.trim()}
                onClick={handleReportConfirm}
              >
                Report
              </Button>,
            ]}
            centered
          >
            <Form form={form} layout="vertical">
              <Form.Item label="Select a reason" required>
                <Radio.Group
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  {reportReasons.map((reason) => (
                    <Radio key={reason} value={reason}>
                      {reason}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label="Abuse details"
                required
                validateStatus={reportTried && !abuseContent.trim() ? 'error' : ''}
                help={reportTried && !abuseContent.trim() ? 'Please enter abuse details.' : ''}
              >
                <Input.TextArea
                  value={abuseContent}
                  onChange={(e) => setAbuseContent(e.target.value)}
                  placeholder="Describe the abuse..."
                  rows={3}
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default WriterInteraction;
