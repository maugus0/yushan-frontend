import { useEffect, useState, useCallback } from 'react';
import './ChapterComments.css';
import CommentItem from './CommentItem';
import CommentModal from './CommentModal';

// LocalStorage helpers (per novelId:chapterId)
const COMMENTS_LS_KEY = 'yushan.reader.comments.v1';
function loadComments(novelId, chapterId) {
  try {
    const raw = localStorage.getItem(COMMENTS_LS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = `${novelId}:${chapterId}`;
    return Array.isArray(map[key]) ? map[key] : [];
  } catch {
    return [];
  }
}
function saveComments(novelId, chapterId, comments) {
  try {
    const raw = localStorage.getItem(COMMENTS_LS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = `${novelId}:${chapterId}`;
    map[key] = comments;
    localStorage.setItem(COMMENTS_LS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export default function ChapterComments({ novelId, chapterId }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [comments, setComments] = useState(() => loadComments(novelId, chapterId));

  useEffect(() => {
    setComments(loadComments(novelId, chapterId));
    setDraft('');
    setModalOpen(false);
  }, [novelId, chapterId]);

  const count = comments.length;

  const handleAddComment = useCallback(
    (text) => {
      const content = (text || '').trim();
      if (!content) return;
      const newComment = {
        id: `${Date.now()}`,
        username: 'User',
        avatar: '',
        time: new Date().toISOString(),
        content,
      };
      setComments((prev) => {
        const next = [newComment, ...prev];
        saveComments(novelId, chapterId, next);
        return next;
      });
    },
    [novelId, chapterId]
  );

  return (
    <aside className="chapter-comments" aria-label="Chapter comments">
      <div className="comments-header">
        <h2 className="comments-title">Chapter comments</h2>
        <span className="comment-count">({count})</span>
      </div>

      <input
        type="text"
        className="comment-input"
        placeholder="What's your thought?"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setModalOpen(true)}
        aria-label="Add a comment"
      />

      <div className="comments-list">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
      </div>

      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAddComment={(val) => {
          handleAddComment(val);
          setDraft('');
          setModalOpen(false);
        }}
        defaultValue={draft}
      />
    </aside>
  );
}
