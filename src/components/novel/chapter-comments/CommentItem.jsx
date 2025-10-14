import './ChapterComments.css';
import { formatCommentTime } from '../../../utils/time';

const CommentItem = ({ comment }) => {
  const { avatar, username, time, content } = comment || {};
  const initial = (username?.[0] || 'U').toUpperCase();

  return (
    <div className="comment-item">
      <div className="comment-avatar">
        {avatar ? (
          <img src={avatar} alt={`${username}'s avatar`} />
        ) : (
          <div className="comment-avatar-fallback">{initial}</div>
        )}
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-username">{username || 'User'}</span>
          <span className="comment-time">{formatCommentTime(time)}</span>
        </div>
        <div className="comment-text">{content}</div>
      </div>
    </div>
  );
};

export default CommentItem;
