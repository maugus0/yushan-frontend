// Progress persistence helpers.
const PROGRESS_KEY = 'yushan.reader.progress.v1';

function loadMap() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMap(map) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function saveProgress({ novelId, chapterId, progress, scrollOffset }) {
  if (!novelId || !chapterId) return;
  const map = loadMap();
  map[novelId] = {
    novelId,
    chapterId,
    progress: Math.min(1, Math.max(0, progress || 0)),
    scrollOffset: scrollOffset || 0,
    updatedAt: new Date().toISOString(),
  };
  saveMap(map);
}

export function getProgress(novelId) {
  if (!novelId) return null;
  return loadMap()[novelId] || null;
}