import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Breadcrumb, Button } from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import './leaderboard.css';
import LeaderboardFilters from '../../components/leaderboard/leaderboard-filters';
import LeaderboardList from '../../components/leaderboard/leaderboard-list';
import rankingsApi from '../../services/rankings';

const TAB_KEYS = { NOVELS: 'novels', READERS: 'users', WRITERS: 'writers' };
const DEFAULT_FILTERS = { timeRange: 'overall', genre: 'all', sortBy: 'views', pageSize: 50 };

// Hardcoded categories with ids (used for left nav + local filtering)
const CATEGORY_LIST = [
  { id: 1, slug: 'action', name: 'Action' },
  { id: 2, slug: 'adventure', name: 'Adventure' },
  { id: 3, slug: 'martial-arts', name: 'Martial Arts' },
  { id: 4, slug: 'fantasy', name: 'Fantasy' },
  { id: 5, slug: 'sci-fi', name: 'Sci-Fi' },
  { id: 6, slug: 'urban', name: 'Urban' },
  { id: 7, slug: 'historical', name: 'Historical' },
  { id: 8, slug: 'eastern-fantasy', name: 'Eastern Fantasy' },
  { id: 9, slug: 'wuxia', name: 'Wuxia' },
  { id: 10, slug: 'xianxia', name: 'Xianxia' },
  { id: 11, slug: 'military', name: 'Military' },
  { id: 12, slug: 'sports', name: 'Sports' },
  { id: 13, slug: 'romance', name: 'Romance' },
  { id: 14, slug: 'drama', name: 'Drama' },
  { id: 15, slug: 'slice-of-life', name: 'Slice of Life' },
  { id: 16, slug: 'school-life', name: 'School Life' },
  { id: 17, slug: 'comedy', name: 'Comedy' },
];

const SLUG_TO_ID = CATEGORY_LIST.reduce((m, c) => ((m[c.slug] = c.id), m), {});
const ID_TO_CAT = CATEGORY_LIST.reduce((m, c) => ((m[c.id] = c), m), {});

// Add storage keys + helpers (fix undefined helpers)
const TIME_STORAGE_KEY = 'rankings.timeRange';
const SORT_STORAGE_KEYS = {
  [TAB_KEYS.NOVELS]: 'rankings.sort.novels',
  [TAB_KEYS.WRITERS]: 'rankings.sort.writers',
  [TAB_KEYS.READERS]: 'rankings.sort.readers',
};

// Storage helpers – make catch blocks non-empty to satisfy eslint(no-empty)
function loadGlobalTimeRange() {
  try {
    return localStorage.getItem(TIME_STORAGE_KEY) || null;
  } catch (e) {
    return null;
  }
}

function saveGlobalTimeRange(timeRange) {
  try {
    if (timeRange) localStorage.setItem(TIME_STORAGE_KEY, timeRange);
  } catch (e) {
    // noop
    void 0;
  }
}

function loadSortForTab(tab) {
  try {
    const k = SORT_STORAGE_KEYS[tab];
    return k ? localStorage.getItem(k) || null : null;
  } catch (e) {
    return null;
  }
}

function saveSortForTab(tab, sortBy) {
  try {
    const k = SORT_STORAGE_KEYS[tab];
    if (k && sortBy) localStorage.setItem(k, sortBy);
  } catch (e) {
    // noop
    void 0;
  }
}

function defaultSortFor(tab) {
  if (tab === TAB_KEYS.READERS) return 'levelxp';
  if (tab === TAB_KEYS.WRITERS) return 'books';
  return 'views';
}

// Extract slug from /rankings/Novel/:slug
function extractUrlCategory(pathname) {
  const m = pathname.match(/(?:leaderboard|rankings)\/Novel\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function LeaderboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [activeTab, setActiveTab] = useState(TAB_KEYS.NOVELS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [catsOpen, setCatsOpen] = useState(true);

  // Use backend categories if available, otherwise fallback to static list
  const navCats = CATEGORY_LIST;

  const [items, setItems] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [isReplacing, setIsReplacing] = useState(false); // keep old list visible with a light overlay

  // Latest request sequence – only accept the newest response
  const reqSeqRef = useRef(0);

  // Single source of truth fetch. Do not clear items before fetch.
  const fetchPage = useCallback(
    async ({ page, pageSize, genre, timeRange, sortBy }, replace = false) => {
      const reqId = ++reqSeqRef.current;
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
          const slug = genre && genre !== 'all' ? String(genre).toLowerCase() : null;
          const selectedId = slug ? SLUG_TO_ID[slug] : undefined;

          res = await rankingsApi.getNovels({
            page,
            size: pageSize,
            categoryId: selectedId,
            categorySlug: slug,
            timeRange,
            sortBy,
          });

          let batch = Array.isArray(res?.items) ? res.items : [];
          // enrich categoryName
          batch = batch.map((it) => ({
            ...it,
            categoryName:
              ID_TO_CAT[it.categoryId]?.slug ||
              ID_TO_CAT[it.categoryId]?.name ||
              it.categoryName ||
              '',
          }));
          // Local filter by categoryId (applies when backend does not filter)
          if (selectedId)
            batch = batch.filter((it) => Number(it.categoryId) === Number(selectedId));
          // fallback local sort for novels
          if (sortBy === 'views') {
            batch.sort((a, b) => Number(b.viewCnt ?? 0) - Number(a.viewCnt ?? 0));
          } else if (sortBy === 'votes') {
            batch.sort((a, b) => Number(b.voteCnt ?? 0) - Number(a.voteCnt ?? 0));
          }

          if (reqId !== reqSeqRef.current) return;
          if (replace) setItems(batch);
          else setItems((prev) => [...prev, ...batch]);
          const more = batch.length === (res?.size ?? pageSize);
          hasMoreRef.current = more;
          setHasMore(more);
        } else if (activeTab === TAB_KEYS.READERS) {
          res = await rankingsApi.getReaders({
            page,
            size: pageSize,
            timeRange,
            sortBy: 'levelxp',
          });
          const batch = Array.isArray(res?.items) ? res.items : [];
          if (reqId !== reqSeqRef.current) return;
          if (replace) setItems(batch);
          else setItems((prev) => [...prev, ...batch]);
          const more = batch.length === (res?.size ?? pageSize);
          hasMoreRef.current = more;
          setHasMore(more);
        } else {
          // WRITERS
          res = await rankingsApi.getWriters({ page, size: pageSize, timeRange, sortBy });
          let batch = Array.isArray(res?.items) ? res.items : [];
          // fallback local sort for writers
          if (sortBy === 'books') {
            batch.sort((a, b) => Number(b.novelNum ?? 0) - Number(a.novelNum ?? 0));
          } else if (sortBy === 'votes') {
            batch.sort((a, b) => Number(b.totalVoteCnt ?? 0) - Number(a.totalVoteCnt ?? 0));
          } else if (sortBy === 'views') {
            batch.sort((a, b) => Number(b.totalViewCnt ?? 0) - Number(a.totalViewCnt ?? 0));
          }

          if (reqId !== reqSeqRef.current) return;
          if (replace) setItems(batch);
          else setItems((prev) => [...prev, ...batch]);
          const more = batch.length === (res?.size ?? pageSize);
          hasMoreRef.current = more;
          setHasMore(more);
        }
      } catch (e) {
        if (reqId !== reqSeqRef.current) return;
        console.error(e);
        setError(e?.response?.data?.message || e?.message || 'Failed to load leaderboard.');
        if (replace) {
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
      const slug = (params.category || extractUrlCategory(p) || '').trim();
      nextGenre = slug ? slug.toLowerCase() : 'all';
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

    setActiveTab(nextTab);
    setCatsOpen(shouldOpenCats);
    setFilters({
      ...DEFAULT_FILTERS,
      timeRange: savedTime,
      genre: nextGenre, // slug
      sortBy: savedSort,
    });

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

  // Centralized filter change – now passes timeRange & sortBy
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

      fetchPage(
        {
          page: 1,
          pageSize: next.pageSize,
          genre: next.genre,
          timeRange: next.timeRange,
          sortBy: next.sortBy,
        },
        true
      );
    },
    [activeTab, fetchPage]
  );

  // Retry uses current sort/time
  const retry = useCallback(() => {
    const f = filtersRef.current;
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    fetchPage(
      {
        page: 1,
        pageSize: f.pageSize,
        genre: f.genre,
        timeRange: f.timeRange,
        sortBy: activeTab === TAB_KEYS.READERS ? 'levelxp' : f.sortBy || defaultSortFor(activeTab),
      },
      true
    );
  }, [activeTab, fetchPage]);

  // Initial load – pass timeRange & sortBy
  useEffect(() => {
    if (!urlInitializedRef.current || initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = false;
    const f = { ...filters };
    fetchPage(
      {
        page: 1,
        pageSize: f.pageSize,
        genre: f.genre,
        timeRange: f.timeRange,
        sortBy: activeTab === TAB_KEYS.READERS ? 'levelxp' : f.sortBy || defaultSortFor(activeTab),
      },
      true
    ).finally(() => {
      initialLoadDoneRef.current = true;
    });
  }, [filters, activeTab, fetchPage]);

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

  // Current slug from URL for highlighting
  const uiGenre = useMemo(() => {
    if (!/(leaderboard|rankings)\/Novel/i.test(location.pathname)) return 'all';
    const slug = extractUrlCategory(location.pathname);
    return slug ? slug.toLowerCase() : 'all';
  }, [location.pathname]);

  // Navigate using slug
  const onSelectCategory = useCallback(
    (slug) => {
      if (String(slug).toLowerCase() === 'all') navigate('/rankings/Novel');
      else navigate(`/rankings/Novel/${slug}`);
    },
    [navigate]
  );

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
                onClick={() => {
                  if (activeTab !== TAB_KEYS.NOVELS) {
                    setActiveTab(TAB_KEYS.NOVELS);
                    navigate('/rankings/Novel');
                    setCatsOpen(true);
                  } else {
                    setCatsOpen((v) => !v);
                  }
                }}
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

                  {navCats.map((c) => {
                    const slug = c.slug;
                    const isActive = uiGenre === slug;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`cat-pill${isActive ? ' active' : ''}`}
                        onClick={() => onSelectCategory(slug)}
                        title={c.description || c.name}
                      >
                        {c.name}
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
