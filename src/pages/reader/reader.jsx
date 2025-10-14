import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReadingSettings } from '../../store/readingSettings';
import { saveProgress, getProgress } from '../../utils/reader';
import './reader.css';
import ChapterComments from '../../components/novel/chapter-comments/ChapterComments';

// Mock fetch (replace with real API)
async function fetchChapter(novelId, chapterId) {
  await new Promise((r) => setTimeout(r, 250));
  const num = Number(chapterId);
  return {
    novelId,
    chapterId: num,
    title: `Chapter ${num}`,
    previousChapterId: num > 1 ? num - 1 : null,
    nextChapterId: num < 9999 ? num + 1 : null,
    // Simple mock paragraphs
    content: Array.from(
      { length: 30 },
      (_, i) =>
        `<p>Paragraph ${i + 1} of chapter ${num}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>`
    ).join(''),
  };
}

const SAVE_MS = 2500;

export default function ReaderPage() {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { settings, updateSetting } = useReadingSettings();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef(0);
  const pageRef = useRef(null); // reader-page container
  const toolbarRef = useRef(null); // top toolbar (contains Aa button)

  // Load chapter and restore scroll
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchChapter(novelId, chapterId)
      .then((data) => {
        if (!mounted) return;
        setChapter(data);
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
      })
      .catch(() => mounted && setLoading(false));
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
            disabled={!chapter?.previousChapterId}
            onClick={() => navigate(`/read/${novelId}/${chapter.previousChapterId}`)}
          >
            ← Previous
          </button>
          <button
            className="reader-nav-btn"
            disabled={!chapter?.nextChapterId}
            onClick={() => navigate(`/read/${novelId}/${chapter.nextChapterId}`)}
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
        <ChapterComments novelId={novelId} chapterId={chapterId} />
      </div>
    </div>
  );
}
