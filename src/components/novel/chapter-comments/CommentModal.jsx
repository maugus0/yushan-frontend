import { useEffect, useRef, useState, useCallback } from 'react';
import './ChapterComments.css';

export default function CommentModal({ isOpen, onClose, onAddComment, defaultValue = '' }) {
  const [comment, setComment] = useState(defaultValue);
  const inputRef = useRef(null); // textarea ref

  useEffect(() => {
    setComment(defaultValue);
  }, [defaultValue]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [isOpen]);

  // Auto-size textarea height to fit content (min 4 rows)
  useEffect(() => {
    if (!isOpen || !inputRef.current) return;
    const el = inputRef.current;
    const autosize = () => {
      el.style.height = 'auto';
      // Cap max height for usability; adjust as needed
      el.style.height = Math.min(el.scrollHeight, 320) + 'px';
    };
    autosize();
    // Recompute on window resize
    const onResize = () => autosize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [comment, isOpen]);

  const handleAdd = useCallback(() => {
    const text = (comment || '').trim();
    if (text) onAddComment?.(text);
  }, [comment, onAddComment]);

  if (!isOpen) return null;

  return (
    <>
      <div className="comment-modal-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="comment-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add a Paragraph Comment"
      >
        <div className="modal-title">Add a Chapter Comment</div>

        {/* Multiline textarea – default 4 rows, auto-resizes with content */}
        <textarea
          ref={inputRef}
          className="modal-textarea"
          placeholder="What's your thought?"
          rows={4} // default height ~ 4 lines
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            // Cmd/Ctrl + Enter to submit; Esc to close
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') onClose?.();
          }}
        />

        <button onClick={handleAdd} className="modal-add-button" type="button">
          Add
        </button>
      </div>
    </>
  );
}
