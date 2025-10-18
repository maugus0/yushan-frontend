import { useState, useEffect } from 'react';
import {
  Button,
  Avatar,
  Pagination,
  Rate,
  Modal,
  Input,
  Checkbox,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  LikeOutlined,
  LikeFilled,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

// Encapsulates the review CTA box, list with rating/spoiler, pagination, and the modal.
const ReviewSection = ({
  novelRating,
  pagedReviews,
  total,
  page,
  pageSize,
  onChangePage,
  onSubmitReview,
  onEditReview,
  onDeleteReview,
  onLikeReview,
  isReviewModalVisible,
  setIsReviewModalVisible,
  handleWriteReview,
  currentUser,
  onRefreshNovelRating,
}) => {
  // Local state for the "Write a review" modal
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewIsSpoiler, setReviewIsSpoiler] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewRating, setEditReviewRating] = useState(0);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewIsSpoiler, setEditReviewIsSpoiler] = useState(false);
  const [editReviewError, setEditReviewError] = useState('');

  // Local state for liked reviews (by current user)
  const [likedReviews, setLikedReviews] = useState(() => {
    const key = `likedReviews_${currentUser?.data?.uuid || 'guest'}`;
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });

  // Reload liked reviews from localStorage when user changes
  useEffect(() => {
    const key = `likedReviews_${currentUser?.data?.uuid || 'guest'}`;
    try {
      setLikedReviews(JSON.parse(localStorage.getItem(key)) || []);
    } catch {
      setLikedReviews([]);
    }
  }, [currentUser]);

  // Submit new review
  const submitReview = async () => {
    // Validation: must select rating and enter text
    if (!reviewRating) {
      setReviewError('Please select a rating.');
      return;
    }
    if (!reviewText.trim()) {
      setReviewError('Please enter your review.');
      return;
    }
    setReviewError('');
    if (!onSubmitReview) return;
    await onSubmitReview({
      rating: reviewRating,
      text: reviewText,
      isSpoiler: reviewIsSpoiler,
    });
    setIsReviewModalVisible(false);
    setReviewRating(0);
    setReviewText('');
    setReviewIsSpoiler(false);
    if (onRefreshNovelRating) await onRefreshNovelRating();
  };

  // Open edit modal with review data
  const handleEditClick = (review) => {
    setEditReviewId(review.id);
    setEditReviewRating(review.rating);
    setEditReviewText(review.content);
    setEditReviewIsSpoiler(!!review.isSpoiler);
    setEditReviewError('');
    setIsEditModalVisible(true);
  };

  // Submit edit review
  const submitEditReview = async () => {
    // Validation: must select rating and enter text
    if (!editReviewRating) {
      setEditReviewError('Please select a rating.');
      return;
    }
    if (!editReviewText.trim()) {
      setEditReviewError('Please enter your review.');
      return;
    }
    setEditReviewError('');
    if (!onEditReview) return;
    await onEditReview(editReviewId, {
      rating: editReviewRating,
      title: editReviewText,
      content: editReviewText,
      isSpoiler: editReviewIsSpoiler,
    });
    setIsEditModalVisible(false);
    setEditReviewId(null);
    setEditReviewRating(0);
    setEditReviewText('');
    setEditReviewIsSpoiler(false);
    if (onRefreshNovelRating) await onRefreshNovelRating();
  };

  // Delete review
  const handleDelete = async (reviewId) => {
    if (!onDeleteReview) return;
    await onDeleteReview(reviewId);
    if (onRefreshNovelRating) await onRefreshNovelRating();
  };

  // Like/Unlike handler
  const handleLike = async (reviewId, liked) => {
    try {
      await onLikeReview(reviewId, liked);
      // local update likedReviews
      const key = `likedReviews_${currentUser?.data?.uuid || 'guest'}`;
      let newLiked;
      if (liked) {
        newLiked = likedReviews.filter((id) => id !== reviewId);
      } else {
        newLiked = [...likedReviews, reviewId];
      }
      setLikedReviews(newLiked);
      localStorage.setItem(key, JSON.stringify(newLiked));
    } catch (e) {
      // Error handling
    }
  };

  // Add liked field to each review for rendering
  const reviewsWithLiked = pagedReviews.map((r) => ({
    ...r,
    liked: likedReviews.includes(r.id),
  }));

  return (
    <>
      {/* CTA box: rating on the left, helper text + button stacked on the right */}
      <div
        style={{
          background: '#f7f8fa',
          borderRadius: 8,
          padding: 16,
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
            <Rate disabled value={Number(novelRating)} allowHalf />
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
              onClick={handleWriteReview}
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
        {reviewsWithLiked.map((r) => {
          // Debug info
          // console.log('Review:', {
          //   reviewId: r.id,
          //   reviewUserId: r.userId,
          //   reviewUuid: r.uuid,
          //   currentUser,
          //   currentUserUuid: currentUser?.data?.uuid,
          //   isMyReview: currentUser?.data?.uuid === r.userId,
          // });

          const rating = r.rating != null ? r.rating : (r.id % 5) + 1;
          const isSpoiler = r.isSpoiler != null ? r.isSpoiler : r.id % 3 === 0;
          const date = r.createTime || r.date;
          const isMyReview = currentUser?.data?.uuid === r.userId;

          return (
            <div key={r.id || r.uuid} className="review-card" style={{ position: 'relative' }}>
              <Avatar icon={<UserOutlined />} src={r.avatar} />
              <div className="review-content" style={{ width: '100%' }}>
                <div className="review-header" style={{ justifyContent: 'space-between' }}>
                  <span className="review-user">
                    <Link
                      to={`/profile?userId=${encodeURIComponent(r.userId || r.uuid)}`}
                      style={{ color: '#1677ff' }}
                    >
                      {r.username || r.user}
                    </Link>
                  </span>
                  <span className="review-date">{date ? new Date(date).toLocaleString() : ''}</span>
                  <div style={{ marginLeft: 'auto' }}>
                    <Tooltip title={r.liked ? 'Unlike' : 'Like'}>
                      <Button
                        type="text"
                        icon={
                          r.liked ? <LikeFilled style={{ color: '#1677ff' }} /> : <LikeOutlined />
                        }
                        onClick={() => handleLike(r.id, r.liked)}
                        className="chapter-comment-like-btn"
                      >
                        {r.likeCnt || 0}
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 6px' }}>
                  <Rate disabled value={rating} />
                  {isSpoiler && <span style={{ color: 'red', fontSize: 12 }}>(Spoiler)</span>}
                </div>

                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>{r.content}</div>
                  {isMyReview && (
                    <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                      <Tooltip title="Edit">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditClick(r)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Are you sure to delete this review?"
                        onConfirm={() => handleDelete(r.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Tooltip title="Delete">
                          <Button type="text" icon={<DeleteOutlined />} />
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  )}
                </div>
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
        onCancel={() => setIsReviewModalVisible(false)}
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

        {/* Error message */}
        {reviewError && <div style={{ color: 'red', marginBottom: 12 }}>{reviewError}</div>}

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

      {/* Edit review modal */}
      <Modal
        title={<strong>Edit your review</strong>}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        centered
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span style={{ fontWeight: 500 }}>Story Rate</span>
          <Rate value={editReviewRating} onChange={setEditReviewRating} />
        </div>
        <Input.TextArea
          rows={4}
          placeholder="Edit your review here"
          value={editReviewText}
          onChange={(e) => setEditReviewText(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div style={{ marginBottom: 16 }}>
          <Checkbox
            checked={editReviewIsSpoiler}
            onChange={(e) => setEditReviewIsSpoiler(e.target.checked)}
          >
            This review contains spoilers
          </Checkbox>
        </div>
        {editReviewError && <div style={{ color: 'red', marginBottom: 12 }}>{editReviewError}</div>}
        <Button
          type="primary"
          onClick={submitEditReview}
          style={{
            background: '#7a76c3ff',
            borderColor: '#7975c9ff',
            color: '#fff',
            borderRadius: 20,
            padding: '0 16px',
            height: 32,
          }}
        >
          SAVE
        </Button>
      </Modal>
    </>
  );
};

export default ReviewSection;
