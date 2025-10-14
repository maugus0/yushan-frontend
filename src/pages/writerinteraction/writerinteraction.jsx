import { useState } from 'react';
import { Button, Tabs, Modal } from 'antd';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writerinteraction.css';

const reviewsData = [
  {
    id: 1,
    content: 'Great story, loved the characters!',
    reader: 'Alice',
    votes: 12,
    voteReader: 'Bob',
    viewsReader: 'Tom',
  },
  {
    id: 2,
    content: 'Plot twist was amazing.',
    reader: 'Bob',
    votes: 8,
    voteReader: 'Alice',
    viewsReader: 'Jerry',
  },
  {
    id: 3,
    content: 'Looking forward to the next chapter.',
    reader: 'Charlie',
    votes: 5,
    voteReader: 'Sam',
    viewsReader: 'Lucy',
  },
];

const commentsData = [
  {
    id: 1,
    content: 'Thank you for your feedback!',
    reader: 'Author',
    votes: 3,
    voteReader: 'Alice',
    viewsReader: 'Tom',
  },
  {
    id: 2,
    content: 'Glad you enjoyed it!',
    reader: 'Author',
    votes: 2,
    voteReader: 'Bob',
    viewsReader: 'Jerry',
  },
  {
    id: 3,
    content: 'Stay tuned!',
    reader: 'Author',
    votes: 1,
    voteReader: 'Sam',
    viewsReader: 'Lucy',
  },
];

const WriterInteraction = () => {
  const [reviewsTab, setReviewsTab] = useState('reviews');
  const [reportModal, setReportModal] = useState({ visible: false, id: null });

  const handleReportClick = (id) => {
    setReportModal({ visible: true, id });
  };

  const handleReportConfirm = () => {
    setReportModal({ visible: false, id: null });
  };

  const handleReportCancel = () => {
    setReportModal({ visible: false, id: null });
  };

  return (
    <div className="writerinteraction-page">
      <WriterNavbar />
      <div className="writerinteraction-content">
        <div className="writerinteraction-header">
          <h2 className="writerinteraction-title">Interaction</h2>
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
              {(reviewsTab === 'reviews' ? reviewsData : commentsData).map((item) => (
                <div className="writerinteraction-list-row-2" key={item.id + '_' + reviewsTab}>
                  <span className="writerinteraction-list-content">{item.content}</span>
                  <span className="writerinteraction-list-reader">{item.reader}</span>
                  <span className="writerinteraction-list-action">
                    <Button type="link" danger onClick={() => handleReportClick(item.id)}>
                      Report
                    </Button>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Modal
            open={reportModal.visible}
            title="Confirm to report?"
            onCancel={handleReportCancel}
            footer={[
              <Button key="cancel" onClick={handleReportCancel}>
                Cancel
              </Button>,
              <Button key="report" type="primary" danger onClick={handleReportConfirm}>
                Report
              </Button>,
            ]}
            centered
          ></Modal>
        </div>
      </div>
    </div>
  );
};

export default WriterInteraction;
