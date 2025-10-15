import { useCallback, useEffect, useRef, useState } from 'react';
import { Breadcrumb, Drawer, message, Typography, Alert, Button, Pagination } from 'antd';
import { Link, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { FunnelPlotOutlined } from '@ant-design/icons';

import ViewToggle from '../../components/novel/browse/viewtoggle';
import ResultsList from '../../components/novel/browse/resultslist';
import GenreSidebar from '../../components/novel/browse/genresidebar';
import novelService from '../../services/novel';
import './browse.css';

const { Title } = Typography;

/* -------- Slug helpers (URL <-> display) -------- */
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const DISPLAY = {
  // Novels male
  action: 'Action',
  adventure: 'Adventure',
  'martial-arts': 'Martial Arts',
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
  urban: 'Urban',
  historical: 'Historical',
  'eastern-fantasy': 'Eastern Fantasy',
  wuxia: 'Wuxia',
  xianxia: 'Xianxia',
  military: 'Military',
  sports: 'Sports',
  // Novels female
  romance: 'Romance',
  drama: 'Drama',
  'slice-of-life': 'Slice of Life',
  'school-life': 'School Life',
  comedy: 'Comedy',
  // Comics
  manga: 'Manga',
  manhua: 'Manhua',
  webtoon: 'Webtoon',
  superhero: 'Superhero',
  // Fan-fics
  anime: 'Anime',
  game: 'Game',
  movie: 'Movie',
  tv: 'TV',
  book: 'Book',
  original: 'Original',
};
const unslug = (slug) => DISPLAY[slug] || null;

/* -------- Lead classification sets -------- */
const MALE_GENRES_SET = new Set([
  'Action',
  'Adventure',
  'Martial Arts',
  'Fantasy',
  'Sci-Fi',
  'Urban',
  'Historical',
  'Eastern Fantasy',
  'Wuxia',
  'Xianxia',
  'Military',
  'Sports',
]);
const FEMALE_GENRES_SET = new Set(['Romance', 'Drama', 'Slice of Life', 'School Life', 'Comedy']);

/* -------- Route parser (no lead in URL) --------
   - /browse
   - /browse/novel
   - /browse/novel/:genre
   - /browse/comics
   - /browse/comics/:genre
   - /browse/fanfics
   - /browse/fanfics/:genre
   Also handles URL query params like ?category=13
*/
function parseBrowsePath(pathname, searchParams) {
  const parts = pathname.toLowerCase().split('/').filter(Boolean);
  let section = 'novel';
  let genre = null;
  let categoryId = null;

  if (parts[0] !== 'browse') return { section, genre, categoryId };

  const p2 = parts[1];
  if (p2 === 'novel' || p2 === 'novels') section = 'novel';
  else if (p2 === 'comics') section = 'comics';
  else if (p2 === 'fan-fics' || p2 === 'fanfics') section = 'fanfics';

  const p3 = parts[2];
  if (p3) genre = unslug(p3);

  // Check for category query parameter
  const categoryParam = searchParams.get('category');
  if (categoryParam) {
    categoryId = parseInt(categoryParam, 10);
  }

  return { section, genre, categoryId };
}

/* -------- Demo data -------- */
const PAGE_SIZE = 20;
const STORAGE_KEY = 'browsePageState_v6';

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveState(partial) {
  try {
    const prev = loadStoredState() || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...partial }));
  } catch {
    return null;
  }
}

const BrowsePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();
  const searchParams = new URLSearchParams(location.search);

  const persisted = useRef(navType === 'POP' ? loadStoredState() : null);

  const [viewMode, setViewMode] = useState(persisted.current?.viewMode || 'grid');

  // Derived from URL
  const initial = useRef(parseBrowsePath(location.pathname, searchParams));
  const [section, setSection] = useState(initial.current.section);
  const [activeGenre, setActiveGenre] = useState(initial.current.genre);
  const [activeCategoryId, setActiveCategoryId] = useState(initial.current.categoryId);

  // Lead: UI-only; default male once
  const [lead, setLead] = useState('male');

  const [filters, setFilters] = useState(
    persisted.current?.filters || { status: null, sort: 'popularity' }
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [softError, setSoftError] = useState('');
  const [totalNovels, setTotalNovels] = useState(0);

  const restoringScroll = useRef(navType === 'POP');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  /* -------- FIX: infer lead from genre when URL has a novel genre -------- */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const parsed = parseBrowsePath(location.pathname, searchParams);
    setSection(parsed.section);
    setActiveGenre(parsed.genre);
    setActiveCategoryId(parsed.categoryId);

    if (parsed.section === 'novel') {
      if (parsed.genre) {
        // If URL includes a novel genre, decide lead by which group it belongs to
        if (FEMALE_GENRES_SET.has(parsed.genre)) setLead('female');
        else if (MALE_GENRES_SET.has(parsed.genre)) setLead('male');
        // else keep previous lead (unknown genre)
      } else {
        // No genre in URL: DO NOT force male; keep current lead
        // setLead((prev) => prev); // no-op, just for clarity
      }
    }
    setCurrentPage(1); // Reset to first page when URL changes
  }, [location.pathname, location.search]);

  /* -------- Fetch novels from API -------- */
  const fetchNovels = useCallback(
    async (page = 1) => {
      setLoading(true);
      setSoftError('');
      try {
        // Map frontend filters to API parameters
        const apiParams = {
          page: page - 1, // API uses 0-based pagination
          size: PAGE_SIZE,
          status: 'published', // Only show published novels
        };

        // Add category filter if we have an active category
        if (activeCategoryId) {
          apiParams.category = activeCategoryId;
        }

        // Map sort options to API parameters
        switch (filters.sort) {
          case 'latest':
            apiParams.sort = 'createTime';
            apiParams.order = 'desc';
            break;
          case 'rating':
            apiParams.sort = 'avgRating';
            apiParams.order = 'desc';
            break;
          case 'popularity':
          default:
            apiParams.sort = 'viewCnt';
            apiParams.order = 'desc';
            break;
        }

        const response = await novelService.getNovels(apiParams);
        let data = response.content || [];

        // Apply frontend filters that aren't handled by the API
        if (filters.status === 'Completed') {
          data = data.filter((n) => n.isCompleted === true);
        } else if (filters.status === 'Ongoing') {
          data = data.filter((n) => n.isCompleted === false || n.isCompleted === null);
        }
        // If filters.status is null, show all novels (no filtering)

        // Transform API response to match expected format
        const transformedNovels = data.map((novel) => ({
          id: novel.id,
          title: novel.title,
          author: novel.authorUsername || 'Unknown Author',
          cover: novel.coverImgUrl || null, // Let NovelCard handle null cover
          genres: [novel.categoryName],
          status: novel.isCompleted ? 'Completed' : 'Ongoing',
          description: novel.synopsis || 'No description available.',
          stats: {
            chapters: novel.chapterCnt || 0,
            popularity: novel.viewCnt || 0,
            rating: novel.avgRating || 0,
          },
          createdAt: new Date(novel.createTime || novel.publishTime).getTime(),
          lead: 'male', // Default since API doesn't provide this
        }));

        setNovels(transformedNovels);
        setTotalNovels(response.totalElements || 0);
      } catch (error) {
        console.error('Failed to fetch novels:', error);
        setSoftError('Failed to load novels. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [activeCategoryId, filters.status, filters.sort]
  );

  useEffect(() => {
    fetchNovels(currentPage); // Fetch novels for current page when filters change
  }, [activeCategoryId, filters.status, filters.sort, currentPage, fetchNovels]);

  useEffect(() => {
    saveState({ viewMode, filters, currentPage, scrollY: window.scrollY });
  }, [viewMode, filters, currentPage]);

  useEffect(() => {
    if (restoringScroll.current && persisted.current?.scrollY != null) {
      setTimeout(() => {
        window.scrollTo(0, persisted.current.scrollY);
        restoringScroll.current = false;
      }, 50);
    }
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  };

  /* -------- Navigation helpers -------- */
  const toSectionRoot = (sec) => navigate(`/browse/${sec === 'novel' ? 'novel' : sec}`);
  const toNovelGenre = (name, categoryId) => {
    if (categoryId) {
      // Use category ID for better URL structure
      navigate(`/browse?category=${categoryId}`);
    } else {
      // Fallback to slug-based navigation
      navigate(`/browse/novel/${slugify(name)}`);
    }
  };
  const toSectionGenre = (sec, name) => navigate(`/browse/${sec}/${slugify(name)}`);

  const handleReset = () => {
    setFilters({ status: null, sort: 'popularity' });
    setCurrentPage(1);
    // Clear URL parameters and navigate to base browse page
    navigate('/browse', { replace: true });
    message.success('Filters reset');
  };

  const handleRetry = () => {
    setSoftError('');
    fetchNovels(currentPage);
  };

  const viewToggleEl = <ViewToggle mode={viewMode} onChange={setViewMode} />;

  return (
    <div className="browse-layout-wrapper">
      <Breadcrumb
        items={[{ title: <Link to="/">Home</Link> }, { title: 'Browse' }]}
        style={{ marginBottom: 12 }}
      />

      <div className="browse-layout">
        {!isMobile && (
          <GenreSidebar
            section={section}
            lead={lead}
            activeGenre={activeGenre}
            activeCategoryId={activeCategoryId}
            onClickSection={(sec) => {
              toSectionRoot(sec);
              setCurrentPage(1);
            }}
            onClickLead={(leadType) => {
              setLead(leadType);
              setCurrentPage(1);
            }}
            onClickAll={(sec) => {
              toSectionRoot(sec);
              setCurrentPage(1);
            }}
            onClickGenre={(sec, leadType, name, categoryId) => {
              if (sec === 'novel') {
                if (leadType) setLead(leadType);
                toNovelGenre(name, categoryId);
              } else {
                toSectionGenre(sec, name);
              }
              setCurrentPage(1);
            }}
          />
        )}

        <div className="browse-main">
          <div className="browse-main__header">
            <Title level={3} className="browse-main__title">
              Browse Novels
            </Title>
            {isMobile && (
              <Button
                icon={<FunnelPlotOutlined />}
                onClick={() => setDrawerOpen(true)}
                aria-label="Open filters drawer"
              >
                Filters
              </Button>
            )}
          </div>

          <div className="filter-pills" role="region" aria-label="Filter and sort">
            <div className="filter-pills__row">
              <div className="filter-pills__group" aria-label="Status Filter">
                <span className="filter-pills__label">Status:</span>
                <div>
                  <Button
                    size="small"
                    shape="round"
                    className="pill-btn"
                    aria-pressed={filters.status === null}
                    onClick={() => setFilters((f) => ({ ...f, status: null }))}
                  >
                    All
                  </Button>
                  <Button
                    size="small"
                    shape="round"
                    className="pill-btn"
                    aria-pressed={filters.status === 'Ongoing'}
                    onClick={() => setFilters((f) => ({ ...f, status: 'Ongoing' }))}
                    style={{ marginLeft: 8 }}
                  >
                    Ongoing
                  </Button>
                  <Button
                    size="small"
                    shape="round"
                    className="pill-btn"
                    aria-pressed={filters.status === 'Completed'}
                    onClick={() => setFilters((f) => ({ ...f, status: 'Completed' }))}
                    style={{ marginLeft: 8 }}
                  >
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
                  <Button
                    size="small"
                    shape="round"
                    onClick={handleReset}
                    aria-label="Reset filters"
                    style={{ marginLeft: 8 }}
                  >
                    Reset
                  </Button>
                </div>
              </div>

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
                      <Button size="small" onClick={handleRetry}>
                        Retry
                      </Button>
                    </div>
                  </div>
                }
              />
            </div>
          )}

          <ResultsList
            novels={novels}
            loading={loading}
            error={null}
            viewMode={viewMode}
            onRetry={handleRetry}
            onItemClick={(n) =>
              navigate(`/novel/${n.id}`, {
                state: { from: '/browse' },
              })
            }
          />

          {!loading && !softError && novels.length === 0 && (
            <div className="browse-end-indicator" role="status">
              No results found.
            </div>
          )}

          {!loading && !softError && totalNovels > PAGE_SIZE && (
            <div
              style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 24 }}
            >
              <Pagination
                current={currentPage}
                total={totalNovels}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} novels`}
              />
            </div>
          )}

          <div className="browse-backend-note">Browse powered by real API data.</div>
        </div>
      </div>

      <Drawer
        title="Filters"
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
      >
        <div style={{ color: '#888' }}>Mobile filters placeholder</div>
      </Drawer>
    </div>
  );
};

export default BrowsePage;
