import { useState } from 'react';
import { Button, Avatar, Pagination, Rate, Modal, Input, Checkbox } from 'antd';
import { UserOutlined } from '@ant-design/icons';

// Encapsulates the review CTA box, list with rating/spoiler, pagination, and the modal.
const ReviewSection = ({ novelRating, pagedReviews, total, page, pageSize, onChangePage }) => {
  // Local state for the "Write a review" modal
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewIsSpoiler, setReviewIsSpoiler] = useState(false);

  const openReviewModal = () => setIsReviewModalVisible(true);
  const closeReviewModal = () => setIsReviewModalVisible(false);

  const submitReview = () => {
    // TODO: wire up to API; for now, just log
    console.log('Posting review:', {
      rating: reviewRating,
      text: reviewText,
      isSpoiler: reviewIsSpoiler,
    });
    setIsReviewModalVisible(false);
    setReviewRating(0);
    setReviewText('');
    setReviewIsSpoiler(false);
  };

  return (
    <>
      {/* CTA box: rating on the left, helper text + button stacked on the right */}
      <div
        style={{
          background: '#f7f8fa',
          borderRadius: 8,
          padding: 16, // 16px left/right padding as requested
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Left: rating stars + score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: '16px' }}>
            <Rate disabled defaultValue={novelRating} allowHalf />
            <span style={{ fontWeight: 700, fontSize: 18 }}>{novelRating}</span>
            <span style={{ color: '#8c8c8c', fontSize: 12 }}>Total Score</span>
          </div>

          {/* Right: helper text above button, right aligned */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ color: '#111', fontSize: 12, marginBottom: 8, marginRight: '40px' }}>
              Share your thoughts with others
            </div>
            <Button
              type="primary"
              onClick={openReviewModal}
              style={{
                background: '#7a76c3ff',
                borderColor: '#7975c9ff',
                color: '#fff',
                borderRadius: 20,
                padding: '0 16px',
                height: 32,
                marginRight: '56px',
              }}
            >
              WRITE A REVIEW
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews list with per-review rating and spoiler info */}
      <div className="novel-reviews">
        {pagedReviews.map((r) => {
          // Mock rating and spoiler flags for display only
          const mockRating = (r.id % 5) + 1; // 1..5
          const mockIsSpoiler = r.id % 3 === 0; // every 3rd review is spoiler

          return (
            <div key={r.id} className="review-card">
              <Avatar icon={<UserOutlined />} src={r.avatar} />
              <div className="review-content">
                <div className="review-header">
                  <span className="review-user">{r.user}</span>
                  <span className="review-date">{r.date}</span>
                </div>

                {/* Per-review rating and spoiler indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 6px' }}>
                  <Rate disabled defaultValue={mockRating} />
                  {mockIsSpoiler && <span style={{ color: 'red', fontSize: 12 }}>(Spoiler)</span>}
                </div>

                <div>{r.content}</div>
              </div>
            </div>
          );
        })}

        <div className="review-pagination">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            onChange={onChangePage}
          />
        </div>
      </div>

      {/* Write a review modal */}
      <Modal
        title={<strong>Write a review</strong>}
        open={isReviewModalVisible}
        onCancel={closeReviewModal}
        footer={null}
        centered
      >
        {/* Story Rate row: label left, stars right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span style={{ fontWeight: 500 }}>Story Rate</span>
          <Rate value={reviewRating} onChange={setReviewRating} />
        </div>

        {/* Review text input */}
        <Input.TextArea
          rows={4}
          placeholder="Type your review here"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          style={{ marginBottom: 12 }}
        />

        {/* Spoiler flag */}
        <div style={{ marginBottom: 16 }}>
          <Checkbox
            checked={reviewIsSpoiler}
            onChange={(e) => setReviewIsSpoiler(e.target.checked)}
          >
            This review contains spoilers
          </Checkbox>
        </div>

        {/* POST button */}
        <Button
          type="primary"
          onClick={submitReview}
          style={{
            background: '#7a76c3ff',
            borderColor: '#7975c9ff',
            color: '#fff',
            borderRadius: 20,
            padding: '0 16px',
            height: 32,
          }}
        >
          POST
        </Button>
      </Modal>
    </>
  );
};

export default ReviewSection;
