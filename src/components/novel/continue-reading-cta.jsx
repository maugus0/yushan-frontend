// Optional CTA component (not auto-injected to preserve current layout)
import React from 'react';
import { Link } from 'react-router-dom';
import { getProgress } from '../../utils/reader';

export default function ContinueReadingCTA({ novelId, firstChapterId = 1 }) {
  const p = getProgress(novelId);
  if (p) {
    const pct = Math.round((p.progress || 0) * 100);
    return (
      <Link to={`/read/${novelId}/${p.chapterId}`} style={{ fontWeight: 600 }}>
        Continue reading (Chapter {p.chapterId} · {pct}%)
      </Link>
    );
  }
  return (
    <Link to={`/read/${novelId}/${firstChapterId}`} style={{ fontWeight: 600 }}>
      Start reading
    </Link>
  );
}
