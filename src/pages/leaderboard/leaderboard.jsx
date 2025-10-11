import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Breadcrumb, Button } from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import './leaderboard.css'; // Ensure this file contains responsive styles
import LeaderboardFilters from '../../components/leaderboard/leaderboard-filters';
import LeaderboardList from '../../components/leaderboard/leaderboard-list';
import rankingsApi from '../../services/rankings'; // backend only

const TAB_KEYS = { NOVELS: 'novels', READERS: 'users', WRITERS: 'writers' };

const DEFAULT_FILTERS = { timeRange: 'overall', genre: 'all', sortBy: 'views', pageSize: 20 };

const NOVEL_CATEGORIES = [
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
  'Romance',
  'Drama',
  'Slice of Life',
  'School Life',
  'Comedy',
];

// Persisted filtering
const TIME_STORAGE_KEY = 'lb_time_global';
const SORT_STORAGE_KEYS = {
  [TAB_KEYS.NOVELS]: 'lb_sort_novels',
  [TAB_KEYS.WRITERS]: 'lb_sort_writers',
};

function loadGlobalTimeRange() {
  try {
    return localStorage.getItem(TIME_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}
function saveGlobalTimeRange(timeRange) {
  try {
    if (timeRange) localStorage.setItem(TIME_STORAGE_KEY, timeRange);
  } catch {
    // ignore
  }
}
function loadSortForTab(tab) {
  try {
    const key = SORT_STORAGE_KEYS[tab];
    if (!key) return null;
    return localStorage.getItem(key) || null;
  } catch {
    return null;
  }
}
function saveSortForTab(tab, sortBy) {
  try {
    const key = SORT_STORAGE_KEYS[tab];
    if (!key || !sortBy) return;
    localStorage.setItem(key, sortBy);
  } catch {
    // ignore
  }
}

function extractUrlCategory(pathname) {
  const m = pathname.match(/(?:leaderboard|rankings)\/Novel\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

// function normalizeGenre(g) {
//   if (!g) return undefined;
//   return String(g).toLowerCase() === 'all' ? undefined : g;
// }

function defaultSortFor(tab) {
  if (tab === TAB_KEYS.READERS) return 'levelxp';
  if (tab === TAB_KEYS.WRITERS) return 'books';
  return 'views';
}

export default function LeaderboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [activeTab, setActiveTab] = useState(TAB_KEYS.NOVELS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [catsOpen, setCatsOpen] = useState(true);

  const [items, setItems] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [isReplacing, setIsReplacing] = useState(false); // keep old list visible with a light overlay

  // Latest request sequence – only accept the newest response
  const reqSeqRef = useRef(0);

  // Single source of truth fetch. Do not clear items before fetch.
  // Accept only the newest response to avoid "flash then empty".
  const fetchPage = useCallback(
    async ({ page, pageSize, genre }, replace = false) => {
      const reqId = ++reqSeqRef.current; // mark this call as the latest
      setError('');
      if (replace) {
        setLoadingInitial(true);
        setIsReplacing(true);
      } else {
        setLoadingMore(true);
      }

      try {
        let res;
        if (activeTab === TAB_KEYS.NOVELS) {
          res = await rankingsApi.getNovels({
            page,
            size: pageSize,
            categoryName: genre === 'all' ? undefined : genre,
          });
        } else if (activeTab === TAB_KEYS.READERS) {
          res = await rankingsApi.getReaders({ page, size: pageSize });
        } else {
          res = await rankingsApi.getWriters({ page, size: pageSize });
        }

        const batch = Array.isArray(res?.items) ? res.items : [];
        const more = batch.length === (res?.size ?? pageSize);

        // Ignore stale responses
        if (reqId !== reqSeqRef.current) return;

        if (replace) {
          // Replace with backend result (even empty) – no stale data
          setItems(batch);
        } else {
          setItems((prev) => [...prev, ...batch]);
        }
        hasMoreRef.current = more;
        setHasMore(more);
      } catch (e) {
        // Ignore stale errors
        if (reqId !== reqSeqRef.current) return;

        console.error(e);
        setError(e?.response?.data?.message || e?.message || 'Failed to load leaderboard.');
        if (replace) {
          // On replace failures show empty; user can Retry
          setItems([]);
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        if (reqId === reqSeqRef.current) {
          if (replace) {
            setLoadingInitial(false);
            setIsReplacing(false);
          } else {
            setLoadingMore(false);
          }
        }
      }
    },
    [activeTab]
  );

  // Keep a ref of current items so we can preserve them during replace loads
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // REMOVE unused refs (they triggered ESLint warnings)
  // const prevSortRef = useRef(filters.sortBy);
  // const prevTimeRef = useRef(filters.timeRange);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const [hasMore, setHasMore] = useState(true);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const urlInitializedRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const initialLoadingRef = useRef(false); // NEW: guard to prevent double initial fetch

  useEffect(() => {
    // Detect tab + category from URL and prime filters
    const p = location.pathname;
    let nextTab = TAB_KEYS.NOVELS;
    let nextGenre = 'all';
    let shouldOpenCats = true;

    if (/(leaderboard|rankings)\/Readers/i.test(p)) {
      nextTab = TAB_KEYS.READERS;
      shouldOpenCats = false;
    } else if (/(leaderboard|rankings)\/Writers/i.test(p)) {
      nextTab = TAB_KEYS.WRITERS;
      shouldOpenCats = false;
    } else if (/(leaderboard|rankings)\/Novel/i.test(p)) {
      nextTab = TAB_KEYS.NOVELS;
      const rawCategory = params.category || extractUrlCategory(p);
      if (rawCategory) {
        const matched =
          NOVEL_CATEGORIES.find(
            (cat) => cat === rawCategory || cat.toLowerCase() === rawCategory.toLowerCase()
          ) ||
          NOVEL_CATEGORIES.find(
            (cat) => cat.toLowerCase() === rawCategory.replace(/-/g, ' ').toLowerCase()
          );
        nextGenre = matched || 'all';
      } else {
        nextGenre = 'all';
      }
      shouldOpenCats = true;
    } else if (/(leaderboard|rankings)\/?$/i.test(p)) {
      nextTab = TAB_KEYS.NOVELS;
      nextGenre = 'all';
      shouldOpenCats = true;
      navigate('/rankings/Novel', { replace: true });
      return;
    }

    const savedTime = loadGlobalTimeRange() || DEFAULT_FILTERS.timeRange;
    let savedSort = null;
    if (nextTab === TAB_KEYS.NOVELS || nextTab === TAB_KEYS.WRITERS) {
      savedSort = loadSortForTab(nextTab) || defaultSortFor(nextTab);
    }

    const merged = {
      ...DEFAULT_FILTERS,
      timeRange: savedTime,
      genre: nextGenre,
      sortBy: savedSort,
    };

    setActiveTab(nextTab);
    setCatsOpen(shouldOpenCats);
    setFilters(merged);

    // Mark URL initialization; reset initial-load state
    urlInitializedRef.current = true;
    initialLoadDoneRef.current = false;
    initialLoadingRef.current = false; // NEW: clear pending flag on route change
  }, [location.pathname, params.category, navigate]);

  useEffect(() => {
    if (!urlInitializedRef.current) return;
    saveGlobalTimeRange(filters.timeRange);
  }, [filters.timeRange]);

  useEffect(() => {
    if (!urlInitializedRef.current) return;
    if (activeTab === TAB_KEYS.NOVELS || activeTab === TAB_KEYS.WRITERS) {
      saveSortForTab(activeTab, filters.sortBy);
    }
  }, [activeTab, filters.sortBy]);

  // Centralized filter change – triggers exactly one replace fetch
  const onFiltersChange = useCallback(
    (patch) => {
      const base = filtersRef.current;
      const next = { ...base, ...patch };

      if (activeTab === TAB_KEYS.READERS) next.sortBy = 'levelxp';
      if (activeTab === TAB_KEYS.NOVELS && !next.sortBy) next.sortBy = 'views';
      if (activeTab === TAB_KEYS.WRITERS && !next.sortBy) next.sortBy = 'books';

      setFilters(next);
      pageRef.current = 1;
      hasMoreRef.current = true;
      setHasMore(true);

      // Debounce rapid category clicks; only the last response will be applied
      fetchPage({ page: 1, pageSize: next.pageSize, genre: next.genre }, true);
    },
    [activeTab, fetchPage]
  );

  // Retry handler: re-fetch first page with current filters (keeps old items until replaced)
  const retry = useCallback(() => {
    const f = filtersRef.current;
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    fetchPage({ page: 1, pageSize: f.pageSize, genre: f.genre }, true);
  }, [fetchPage]);

  // Initial load – once per route change
  useEffect(() => {
    if (!urlInitializedRef.current || initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = false;
    const current = { ...filters };
    fetchPage({ page: 1, pageSize: current.pageSize, genre: current.genre }, true).finally(() => {
      initialLoadDoneRef.current = true;
    });
  }, [filters, activeTab, fetchPage]); // include fetchPage in deps; no disable comment

  // REMOVE loadMore, uiGenre, onSelectCategory, handleNovelsClick and render...
  const loadMore = useCallback(() => {
    if (loadingInitial || loadingMore || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    const f = filtersRef.current;
    const sort = activeTab === TAB_KEYS.READERS ? 'levelxp' : f.sortBy || defaultSortFor(activeTab);
    fetchPage({
      page: nextPage,
      pageSize: f.pageSize,
      timeRange: f.timeRange,
      genre: f.genre,
      sortBy: sort,
    });
  }, [activeTab, fetchPage, loadingInitial, loadingMore]);

  const uiGenre = useMemo(() => {
    if (!/(leaderboard|rankings)\/Novel/i.test(location.pathname)) return 'all';
    const raw = extractUrlCategory(location.pathname);
    if (!raw) return 'all';
    const match =
      NOVEL_CATEGORIES.find((c) => c.toLowerCase() === raw.toLowerCase()) ||
      NOVEL_CATEGORIES.find((c) => c.toLowerCase() === raw.replace(/-/g, ' ').toLowerCase());
    return match || 'all';
  }, [location.pathname]);

  const onSelectCategory = useCallback(
    (label) => {
      if (String(label).toLowerCase() === 'all') {
        navigate('/rankings/Novel');
      } else {
        const exactCategory = NOVEL_CATEGORIES.find(
          (cat) => cat.toLowerCase() === String(label).toLowerCase()
        );
        if (exactCategory) {
          const categoryPath = exactCategory.replace(/\s+/g, '-');
          navigate(`/rankings/Novel/${categoryPath}`);
        } else {
          navigate('/rankings/Novel');
        }
      }
    },
    [navigate]
  );

  const handleNovelsClick = useCallback(() => {
    const currentPath = location.pathname;
    const currentGenre = filters.genre || 'all';
    const isOnCategoryPage = params.category && currentGenre !== 'all';

    if (isOnCategoryPage) {
      navigate('/rankings/Novel');
    } else if (activeTab === TAB_KEYS.NOVELS && currentPath === '/rankings/Novel') {
      setCatsOpen((prev) => !prev);
    } else {
      navigate('/rankings/Novel');
    }
  }, [activeTab, location.pathname, filters.genre, params.category, navigate]);

  return (
    <div className="rankings-layout">
      <div className="rankings-breadcrumb">
        <Breadcrumb items={[{ title: <Link to="/">Home</Link> }, { title: 'Leaderboard' }]} />
      </div>

      <Card bordered className="rankings-card">
        <div className="rankings-content">
          {/* Left navigation with tabs and categories */}
          <div className="rankings-left">
            <nav className="side-nav" role="tablist" aria-orientation="vertical">
              <button
                type="button"
                className={`side-nav-item${activeTab === TAB_KEYS.NOVELS ? ' active' : ''}`}
                onClick={handleNovelsClick}
                aria-selected={activeTab === TAB_KEYS.NOVELS}
                aria-expanded={activeTab === TAB_KEYS.NOVELS ? catsOpen : undefined}
              >
                Novels
                <span
                  className={`caret ${activeTab === TAB_KEYS.NOVELS && catsOpen ? 'open' : ''}`}
                />
              </button>

              {activeTab === TAB_KEYS.NOVELS && catsOpen && (
                <div className="side-accordion-body">
                  <button
                    key="all-novels"
                    type="button"
                    className={`cat-pill${uiGenre === 'all' ? ' active' : ''}`}
                    onClick={() => onSelectCategory('all')}
                  >
                    All Novels
                  </button>
                  {NOVEL_CATEGORIES.map((category, i) => {
                    const isActive = uiGenre === category;
                    return (
                      <button
                        key={`${category}-${i}`}
                        type="button"
                        className={`cat-pill${isActive ? ' active' : ''}`}
                        onClick={() => onSelectCategory(category)}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                className={`side-nav-item${activeTab === TAB_KEYS.READERS ? ' active' : ''}`}
                onClick={() => navigate('/rankings/Readers')}
                aria-selected={activeTab === TAB_KEYS.READERS}
              >
                Readers
              </button>

              <button
                type="button"
                className={`side-nav-item${activeTab === TAB_KEYS.WRITERS ? ' active' : ''}`}
                onClick={() => navigate('/rankings/Writers')}
                aria-selected={activeTab === TAB_KEYS.WRITERS}
              >
                Writers
              </button>
            </nav>
          </div>

          {/* Right: filters + list */}
          <div className="rankings-right">
            <div className="rankings-filters">
              <LeaderboardFilters
                tab={activeTab === TAB_KEYS.READERS ? 'users' : activeTab}
                query={{ ...filters, page: pageRef.current }}
                onChange={onFiltersChange}
                hideSort={activeTab === TAB_KEYS.READERS}
              />
            </div>

            {error ? (
              <div className="rankings-error">
                <div className="rankings-error-text">{error}</div>
                <Button onClick={retry}>Retry</Button>
              </div>
            ) : (
              <div className={`rankings-list-wrap${isReplacing ? ' replacing' : ''}`}>
                <LeaderboardList
                  tab={activeTab === TAB_KEYS.READERS ? 'users' : activeTab}
                  loadingInitial={loadingInitial}
                  loadingMore={loadingMore}
                  data={{ items }}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
