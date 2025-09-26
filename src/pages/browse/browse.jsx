import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Breadcrumb, Drawer, message, Typography, Alert, Button } from 'antd';
import { Link, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { FunnelPlotOutlined } from '@ant-design/icons';

import ViewToggle from '../../components/novel/browse/viewtoggle';
import ResultsList from '../../components/novel/browse/resultslist';
import GenreSidebar from '../../components/novel/browse/genresidebar';
import './browse.css';

const { Title } = Typography;

/** Slug <-> display helpers must match navbar */
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const DISPLAY = {
  'action': 'Action',
  'adventure': 'Adventure',
  'martial-arts': 'Martial Arts',
  'fantasy': 'Fantasy',
  'sci-fi': 'Sci-Fi',
  'urban': 'Urban',
  'historical': 'Historical',
  'eastern-fantasy': 'Eastern Fantasy',
  'wuxia': 'Wuxia',
  'xianxia': 'Xianxia',
  'military': 'Military',
  'sports': 'Sports',
  'romance': 'Romance',
  'drama': 'Drama',
  'slice-of-life': 'Slice of Life',
  'school-life': 'School Life',
  'comedy': 'Comedy',
  'manga': 'Manga',
  'manhua': 'Manhua',
  'webtoon': 'Webtoon',
  'superhero': 'Superhero',
  'anime': 'Anime',
  'game': 'Game',
  'movie': 'Movie',
  'tv': 'TV',
  'book': 'Book',
  'original': 'Original',
};
const unslug = (slug) => DISPLAY[slug] || null;

/** Parse supported paths (no male/female in URL) */
function parseBrowsePath(pathname) {
  const parts = pathname.toLowerCase().split('/').filter(Boolean);
  let section = 'novel';
  let genre = null;

  if (parts[0] !== 'browse') return { section, genre };

  const p2 = parts[1];
  if (p2 === 'novel' || p2 === 'novels') section = 'novel';
  else if (p2 === 'comics') section = 'comics';
  else if (p2 === 'fan-fics' || p2 === 'fanfics') section = 'fan-fics';

  const p3 = parts[2];
  if (p3) genre = unslug(p3);
  return { section, genre };
}

/** Demo data (unchanged) */
const MOCK_GENRES = ['Fantasy','Action','Romance','Sci-Fi','Drama','Comedy','Adventure','Mystery','Horror','History','War'];
const MOCK_STATUSES = ['Ongoing','Completed'];
const MOCK_NOVELS = Array.from({ length: 120 }).map((_, i) => {
  const genreCount = 1 + (i % 3);
  const genres = [];
  for (let g = 0; g < genreCount; g++) genres.push(MOCK_GENRES[(i + g) % MOCK_GENRES.length]);
  const lead = i % 2 === 0 ? 'male' : 'female';
  return {
    id: i + 1,
    title: `Novel Title ${i + 1}`,
    author: `Author ${((i % 10) + 1).toString().padStart(2, '0')}`,
    cover: `https://picsum.photos/seed/novel_${i + 1}/300/400`,
    genres,
    status: MOCK_STATUSES[i % 2],
    description: 'Static mock description. Replace with real summary from backend later.',
    stats: { chapters: 50 + (i % 200), popularity: 1000 + ((i * 13) % 5000), rating: 3 + ((i * 37) % 20) / 10 },
    createdAt: Date.now() - i * 86400000,
    lead,
  };
});

const PAGE_SIZE = 24;
const STORAGE_KEY = 'browsePageState_v5';

function loadStoredState() { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw); } catch { return null; } }
function saveState(partial) { try { const prev = loadStoredState() || {}; localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...partial })); } catch {return null} }

const BrowsePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();

  // Only restore when going back (POP)
  const persisted = useRef(navType === 'POP' ? loadStoredState() : null);

  const [viewMode, setViewMode] = useState(persisted.current?.viewMode || 'grid');

  // Derive section/genre from URL
  const initial = useRef(parseBrowsePath(location.pathname));
  const [section, setSection] = useState(initial.current.section);
  const [activeGenre, setActiveGenre] = useState(initial.current.genre);

  // Lead is UI-only
  const [lead, setLead] = useState('male');

  const [filters, setFilters] = useState(persisted.current?.filters || { status: null, sort: 'popularity' });
  const [pageCount, setPageCount] = useState(persisted.current?.pageCount || 1);
  const [novels, setNovels] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [softError, setSoftError] = useState('');

  const sentinelRef = useRef(null);
  const restoringScroll = useRef(navType === 'POP');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const parsed = parseBrowsePath(location.pathname);
    setSection(parsed.section);
    setActiveGenre(parsed.genre);
    setPageCount(1);
    if (parsed.section === 'novel') setLead('male');
  }, [location.pathname]);

  const fetchNovels = useCallback(async () => {
    setLoading(true);
    setSoftError('');
    try {
      await new Promise((r) => setTimeout(r, 180));
      let data = [...MOCK_NOVELS];

      if (section === 'novel') data = data.filter((n) => n.lead === lead);
      if (activeGenre) data = data.filter((n) => n.genres.includes(activeGenre));
      if (filters.status) data = data.filter((n) => n.status === filters.status);

      switch (filters.sort) {
        case 'latest': data.sort((a, b) => b.createdAt - a.createdAt); break;
        case 'rating': data.sort((a, b) => b.stats.rating - a.stats.rating); break;
        default: data.sort((a, b) => b.stats.popularity - a.stats.popularity);
      }
      setNovels(data);
    } catch {
      setSoftError('Network error (simulated).');
    } finally {
      setLoading(false);
    }
  }, [section, lead, activeGenre, filters.status, filters.sort]);

  useEffect(() => { fetchNovels(); }, [fetchNovels]);

  useEffect(() => { setDisplayed(novels.slice(0, PAGE_SIZE * pageCount)); }, [novels, pageCount]);

  useEffect(() => { saveState({ viewMode, filters, pageCount, scrollY: window.scrollY }); }, [viewMode, filters, pageCount]);

  useEffect(() => {
    if (restoringScroll.current && persisted.current?.scrollY != null) {
      setTimeout(() => { window.scrollTo(0, persisted.current.scrollY); restoringScroll.current = false; }, 50);
    }
  }, []);

  const hasMore = displayed.length < novels.length;
  useEffect(() => {
    if (!sentinelRef.current) return;
    const node = sentinelRef.current;
    const obs = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting && hasMore && !loading && !softError) setPageCount((c) => c + 1);
      },
      { root: null, rootMargin: '600px 0px 0px 0px', threshold: 0 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [hasMore, loading, softError]);

  const handleReset = () => {
    setFilters({ status: null, sort: 'popularity' });
    setPageCount(1);
    message.success('Filters reset');
  };

  const handleRetry = () => { setSoftError(''); fetchNovels(); };

  const toSectionRoot = (sec) => navigate(`/browse/${sec === 'novel' ? 'novel' : sec}`);
  const toNovelGenre = (name) => navigate(`/browse/novel/${slugify(name)}`);
  const toSectionGenre = (sec, name) => navigate(`/browse/${sec}/${slugify(name)}`);

  const viewToggleEl = <ViewToggle mode={viewMode} onChange={setViewMode} />;

  return (
    <div className="browse-layout-wrapper">
      <Breadcrumb items={[{ title: <Link to="/">Home</Link> }, { title: 'Browse' }]} style={{ marginBottom: 12 }} />

      <div className="browse-layout">
        {!isMobile && (
          <GenreSidebar
            section={section}
            lead={lead}
            activeGenre={activeGenre}
            onClickSection={(sec) => { toSectionRoot(sec); setPageCount(1); }}
            onClickLead={(leadType) => { setLead(leadType); setPageCount(1); }}
            onClickAll={(sec) => { toSectionRoot(sec); setPageCount(1); }}
            onClickGenre={(sec, leadType, name) => {
              if (sec === 'novel') { if (leadType) setLead(leadType); toNovelGenre(name); }
              else { toSectionGenre(sec, name); }
              setPageCount(1);
            }}
          />
        )}

        <div className="browse-main">
          <div className="browse-main__header">
            <Title level={3} className="browse-main__title">Browse Novels</Title>
            {isMobile && (
              <Button icon={<FunnelPlotOutlined />} onClick={() => setDrawerOpen(true)} aria-label="Open filters drawer">
                Filters
              </Button>
            )}
          </div>

          {/* Filter / Sort (Reset placed on the same row after Sort pills) */}
          <div className="filter-pills" role="region" aria-label="Filter and sort">
            <div className="filter-pills__row">
              <div className="filter-pills__group" aria-label="Status Filter">
                <span className="filter-pills__label">Status:</span>
                <div>
                  <Button size="small" shape="round" className="pill-btn" aria-pressed={filters.status === null} onClick={() => setFilters((f) => ({ ...f, status: null }))}>
                    All
                  </Button>
                  <Button size="small" shape="round" className="pill-btn" aria-pressed={filters.status === 'Ongoing'} onClick={() => setFilters((f) => ({ ...f, status: 'Ongoing' }))} style={{ marginLeft: 8 }}>
                    Ongoing
                  </Button>
                  <Button size="small" shape="round" className="pill-btn" aria-pressed={filters.status === 'Completed'} onClick={() => setFilters((f) => ({ ...f, status: 'Completed' }))} style={{ marginLeft: 8 }}>
                    Completed
                  </Button>
                </div>
              </div>

              <div className="filter-pills__group" aria-label="Sort By" style={{ flex: 1 }}>
                <span className="filter-pills__label">Sort:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {['popularity', 'latest', 'rating'].map((s) => (
                    <Button
                      key={s}
                      size="small"
                      shape="round"
                      className="pill-btn"
                      aria-pressed={filters.sort === s}
                      onClick={() => setFilters((f) => ({ ...f, sort: s }))}
                    >
                      {s === 'popularity' ? 'Popular' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                  {/* Reset sits on the same row, after Sort pills */}
                  <Button size="small" shape="round" onClick={handleReset} aria-label="Reset filters" style={{ marginLeft: 8 }}>
                    Reset
                  </Button>
                </div>
              </div>

              {/* View toggle aligned to the far right, same baseline */}
              <div className="filter-pills__group" aria-label="View Mode">
                {viewToggleEl}
              </div>
            </div>
          </div>

          {softError && (
            <div style={{ marginTop: 8 }}>
              <Alert
                type="error"
                showIcon
                message="Failed to load novels"
                description={
                  <div>
                    {softError}
                    <div style={{ marginTop: 8 }}>
                      <Button size="small" onClick={handleRetry}>Retry</Button>
                    </div>
                  </div>
                }
              />
            </div>
          )}

          <ResultsList
            novels={displayed}
            loading={loading}
            error={null}
            viewMode={viewMode}
            onRetry={handleRetry}
            onItemClick={(n) => message.info(`Navigate to detail (placeholder): ${n.title}`)}
          />

          <div ref={sentinelRef} className="browse-infinite-sentinel" aria-hidden="true" />

          {!loading && !softError && displayed.length === 0 && (
            <div className="browse-end-indicator" role="status">No results.</div>
          )}
          {!loading && !softError && displayed.length > 0 && displayed.length === novels.length && (
            <div className="browse-end-indicator" role="status">All {novels.length} results loaded.</div>
          )}

          <div className="browse-backend-note">Backend integration placeholder: replace mock data with API calls.</div>
        </div>
      </div>

      <Drawer title="Filters" placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={280}>
        <div style={{ color: '#888' }}>Mobile filters placeholder</div>
      </Drawer>
    </div>
  );
};

export default BrowsePage;