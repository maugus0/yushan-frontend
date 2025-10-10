import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ChapterComments.css';

export default function CommentModal({ isOpen, onClose, onAddComment, defaultValue = '' }) {
  const [comment, setComment] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setComment(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // focus input when modal opens
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [isOpen]);

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
        <input
          ref={inputRef}
          type="text"
          placeholder="What's your thought?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') onClose?.();
          }}
          className="modal-input"
        />
        <button onClick={handleAdd} className="modal-add-button" type="button">
          Add
        </button>
      </div>
    </>
  );
}
