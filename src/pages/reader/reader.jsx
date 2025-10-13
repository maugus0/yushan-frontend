import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReadingSettings } from '../../store/readingSettings';
import { saveProgress, getProgress } from '../../utils/reader';
import './reader.css';
import novelsApi from '../../services/novels';
import commentsApi from '../../services/comments';
import { Button, Input, Pagination } from 'antd';

const SAVE_MS = 2500;

export default function ReaderPage() {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { settings, updateSetting } = useReadingSettings();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [globalTip, setGlobalTip] = useState({ message: '', type: 'success', visible: false });

  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef(0);
  const pageRef = useRef(null); // reader-page container
  const toolbarRef = useRef(null); // top toolbar (contains Aa button)

  // Fetch chapter content
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    async function fetchChapter() {
      try {
        const res = await novelsApi.getChapterContent(novelId, chapterId);
        if (!mounted) return;
        setChapter(res);
        setLoading(false);
        const stored = getProgress(novelId);
        if (stored && Number(stored.chapterId) === Number(chapterId)) {
          requestAnimationFrame(() => {
            window.scrollTo(0, stored.scrollOffset || 0);
            setProgress(stored.progress || 0);
          });
        } else {
          window.scrollTo(0, 0);
          setProgress(0);
        }
      } catch {
        if (mounted) {
          setLoading(false);
          setChapter(null);
        }
      }
    }
    fetchChapter();
    return () => {
      mounted = false;
    };
  }, [novelId, chapterId]);

  const computeProgress = useCallback(() => {
    const st = window.scrollY || document.documentElement.scrollTop;
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, st / total)) : 0;
  }, []);

  // Update progress on scroll
  useEffect(() => {
    const onScroll = () => setProgress(computeProgress());
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [computeProgress]);

  // Throttled auto-save
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (Math.abs(progress - lastSavedRef.current) >= 0.01 || progress === 1) {
        saveProgress({
          novelId,
          chapterId: Number(chapterId),
          progress,
          scrollOffset: window.scrollY || document.documentElement.scrollTop,
        });
        lastSavedRef.current = progress;
      }
    }, SAVE_MS);
    return () => clearTimeout(saveTimerRef.current);
  }, [progress, novelId, chapterId]);

  // Save on unload
  useEffect(() => {
    const handler = () =>
      saveProgress({
        novelId,
        chapterId: Number(chapterId),
        progress: computeProgress(),
        scrollOffset: window.scrollY || document.documentElement.scrollTop,
      });
    window.addEventListener('beforeunload', handler);
    window.addEventListener('visibilitychange', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('visibilitychange', handler);
    };
  }, [computeProgress, novelId, chapterId]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setPanelOpen(false);
      if (e.key === '[' && chapter?.previousChapterId)
        navigate(`/read/${novelId}/${chapter.previousChapterId}`);
      if (e.key === ']' && chapter?.nextChapterId)
        navigate(`/read/${novelId}/${chapter.nextChapterId}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chapter, navigate, novelId]);

  const pct = Math.round(progress * 100);

  // Cleanup any legacy global vars on mount & unmount (defensive)
  useEffect(() => {
    const root = document.documentElement;
    const clear = () => {
      root.style.removeProperty('--reader-font-size');
      root.style.removeProperty('--reader-font-family');
    };
    clear();
    return clear;
  }, []);

  // Keep body white background only on reader page (footer remains intact)
  useEffect(() => {
    document.body.classList.add('reader-full-bg');
    return () => document.body.classList.remove('reader-full-bg');
  }, []);

  // Measure toolbar Y position and align the sidebar top to it
  useLayoutEffect(() => {
    const updateTop = () => {
      if (!pageRef.current || !toolbarRef.current) return;
      const p = pageRef.current.getBoundingClientRect();
      const t = toolbarRef.current.getBoundingClientRect();
      const top = Math.max(72, t.top - p.top); // fallback minimum
      pageRef.current.style.setProperty('--reader-aside-top', `${Math.round(top)}px`);
    };
    updateTop();
    window.addEventListener('resize', updateTop);
    // Also recalc after fonts/images load
    const i = setTimeout(updateTop, 50);
    return () => {
      window.removeEventListener('resize', updateTop);
      clearTimeout(i);
    };
  }, []);

  // Fetch comments for current chapter
  useEffect(() => {
    async function fetchComments() {
      if (!chapter?.id) return; // Use chapter.id
      try {
        const res = await commentsApi.listByChapter(chapter.id, {
          page: commentPage - 1,
          size: 20,
        });
        setComments(Array.isArray(res?.comments) ? res.comments : []);
        setCommentTotal(res?.totalCount || 0);
      } catch {
        setComments([]);
        setCommentTotal(0);
      }
    }
    fetchComments();
  }, [chapter?.id, commentPage]);

  // Add comment
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      setCommentError('Please enter your comment.');
      return;
    }
    if (!chapter?.id) {
      showTip('Chapter information is loading, please try again later.', 'error');
      return;
    }
    setCommenting(true);
    setCommentError('');
    try {
      await commentsApi.create({ chapterId: chapter.id, content: commentText }); // Use chapter.id
      setCommentText('');
      showTip('Comment submitted successfully', 'success');
      // Refresh comments
      const res = await commentsApi.listByChapter(chapter.id, { page: 0, size: 20 });
      setComments(Array.isArray(res?.comments) ? res.comments : []);
      setCommentTotal(res?.totalCount || 0);
      setCommentPage(1);
    } catch (e) {
      showTip(e?.response?.data?.message || e?.message || 'Failed to submit comment', 'error');
    } finally {
      setCommenting(false);
    }
  };

  const showTip = (message, type = 'success', duration = 2000) => {
    setGlobalTip({ message, type, visible: true });
    setTimeout(() => {
      setGlobalTip({ message: '', type, visible: false });
    }, duration);
  };

  const handlePrev = async () => {
    if (!chapter?.previousChapterUuid) return;
    // 通过 uuid 查 chapterNumber
    const prev = await novelsApi.getChapterByUuid(chapter.previousChapterUuid);
    if (prev?.chapterNumber) {
      navigate(`/read/${novelId}/${prev.chapterNumber}`);
    }
  };

  const handleNext = async () => {
    if (!chapter?.nextChapterUuid) return;
    const next = await novelsApi.getChapterByUuid(chapter.nextChapterUuid);
    if (next?.chapterNumber) {
      navigate(`/read/${novelId}/${next.chapterNumber}`);
    }
  };

  return (
    <div
      ref={pageRef}
      className="reader-page"
      style={{
        // Scoped reading typography (does not leak globally)
        '--_reader-font-size': `${settings.fontSize}px`,
        '--_reader-font-family':
          settings.fontFamily === 'serif'
            ? 'Georgia, "Times New Roman", serif'
            : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      {/* Main centered content column */}
      <div className="reader-inner">
        {/* Toolbar (ref used to align sidebar header with Aa button) */}
        <div ref={toolbarRef} className="reader-toolbar" style={{ position: 'relative' }}>
          <div
            className="reader-toolbar-left"
            style={{ display: 'flex', gap: 12, alignItems: 'center' }}
          >
            <Link to={`/novel/${novelId}`}>← Back</Link>
            <strong>{chapter?.title || 'Loading...'}</strong>
          </div>
          <div>
            <button
              className="reader-settings-panel-btn"
              onClick={() => setPanelOpen((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={panelOpen}
            >
              Aa
            </button>
            {panelOpen && (
              <div className="reader-settings-panel" role="dialog" aria-label="Reading settings">
                <label>
                  Font Size ({settings.fontSize}px)
                  <input
                    type="range"
                    min={14}
                    max={22}
                    step={1}
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                  />
                </label>
                <label>
                  Font Family
                  <span className="reading-select-wrapper">
                    <select
                      className="reading-select"
                      value={settings.fontFamily}
                      onChange={(e) => updateSetting('fontFamily', e.target.value)}
                    >
                      <option value="serif">Serif (Georgia)</option>
                      <option value="sans">Sans (System UI)</option>
                    </select>
                  </span>
                </label>
                <button
                  className="reader-nav-btn"
                  type="button"
                  onClick={() => setPanelOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="reader-progress-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>

        {/* Chapter HTML */}
        <div
          className="reader-content-html"
          dangerouslySetInnerHTML={{
            __html: loading ? '<p>Loading...</p>' : chapter?.content || '',
          }}
        />

        <div className="reader-footer-nav">
          <button
            className="reader-nav-btn"
            disabled={!chapter?.previousChapterUuid}
            onClick={handlePrev}
          >
            ← Previous
          </button>
          <button
            className="reader-nav-btn"
            disabled={!chapter?.nextChapterUuid}
            onClick={handleNext}
          >
            Next →
          </button>
          <span className="reader-progress-text" aria-live="polite">
            {pct}%
          </span>
        </div>
      </div>

      {/* Right sidebar (smaller, inside white card) */}
      <div
        className="reader-aside-fixed"
        role="complementary"
        aria-label="Chapter comments sidebar"
      >
        <div>
          <h3>Chapter Comments ({commentTotal})</h3>
          <div style={{ marginBottom: 12 }}>
            <Input.TextArea
              rows={3}
              placeholder="Write a comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={commenting}
            />
            {commentError && <div style={{ color: 'red', marginTop: 4 }}>{commentError}</div>}
            <Button
              type="primary"
              onClick={handleSubmitComment}
              loading={commenting}
              style={{ marginTop: 8 }}
            >
              Add Comment
            </Button>
          </div>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{ background: '#f7f8fa', borderRadius: 8, padding: 10, marginBottom: 8 }}
            >
              {c.userId ? (
                <Link
                  to={`/profile?userId=${encodeURIComponent(c.userId)}`}
                  style={{ color: '#1677ff', fontWeight: 600 }}
                >
                  {c.username}
                </Link>
              ) : (
                <span style={{ color: '#1677ff', fontWeight: 600 }}>{c.username}</span>
              )}
              <span style={{ marginLeft: 12, color: '#888', fontSize: 12 }}>
                {c.createTime ? new Date(c.createTime).toLocaleString() : ''}
              </span>
              <div style={{ marginTop: 4 }}>{c.content}</div>
            </div>
          ))}
          <Pagination
            current={commentPage}
            pageSize={20}
            total={commentTotal}
            showSizeChanger={false}
            onChange={setCommentPage}
            style={{ marginTop: 12 }}
          />
        </div>
      </div>
      {globalTip.visible && (
        <div
          style={{
            position: 'fixed',
            top: '30vh',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 240,
            background: globalTip.type === 'success' ? '#52c41a' : '#ff4d4f',
            color: '#fff',
            padding: '18px 32px',
            borderRadius: 8,
            fontSize: '1.1rem',
            zIndex: 9999,
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            opacity: 0.97,
            pointerEvents: 'none',
          }}
        >
          {globalTip.message}
        </div>
      )}
    </div>
  );
}
