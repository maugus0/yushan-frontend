import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Breadcrumb, Button } from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import './leaderboard.css';
import LeaderboardFilters from '../../components/leaderboard/leaderboard-filters';
import LeaderboardList from '../../components/leaderboard/leaderboard-list';
import rankingsApi from '../../services/rankings';
import categoriesService from '../../services/categories';

const TAB_KEYS = { NOVELS: 'novels', READERS: 'users', WRITERS: 'writers' };
const DEFAULT_FILTERS = { timeRange: 'overall', genre: 'all', sortBy: 'views', pageSize: 50 };

// Storage helpers – make catch blocks non-empty to satisfy eslint(no-empty)
function loadGlobalTimeRange() {
  try {
    return localStorage.getItem('rankings.timeRange') || null;
  } catch (e) {
    return null;
  }
}

function saveGlobalTimeRange(timeRange) {
  try {
    if (timeRange) localStorage.setItem('rankings.timeRange', timeRange);
  } catch (e) {
    // noop
    void 0;
  }
}

function loadSortForTab(tab) {
  try {
    const k = {
      novels: 'rankings.sort.novels',
      writers: 'rankings.sort.writers',
      users: 'rankings.sort.readers',
    }[tab];
    return k ? localStorage.getItem(k) || null : null;
  } catch (e) {
    return null;
  }
}

function saveSortForTab(tab, sortBy) {
  try {
    const k = {
      novels: 'rankings.sort.novels',
      writers: 'rankings.sort.writers',
      users: 'rankings.sort.readers',
    }[tab];
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

// SORT
function mapSortType(tab, sortBy) {
  if (tab === TAB_KEYS.NOVELS) {
    if (sortBy === 'votes') return 'vote';
    if (sortBy === 'views') return 'view';
    return 'view';
  }
  if (tab === TAB_KEYS.WRITERS) {
    if (sortBy === 'books' || sortBy === 'novelNum') return 'novelNum';
    if (sortBy === 'votes') return 'vote';
    if (sortBy === 'views') return 'view';
    return 'novelNum';
  }
  return sortBy;
}

export default function LeaderboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [activeTab, setActiveTab] = useState(TAB_KEYS.NOVELS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [catsOpen, setCatsOpen] = useState(true);

  // category damically from backend
  const [categories, setCategories] = useState([]);
  const [catSlugToId, setCatSlugToId] = useState({});
  const [catIdToCat, setCatIdToCat] = useState({});

  // fetch the BE category
  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await categoriesService.getCategories();
        setCategories(cats);
        // slug -> id
        const slugToId = {};
        const idToCat = {};
        cats.forEach((c) => {
          slugToId[c.slug] = c.id;
          idToCat[c.id] = c;
        });
        setCatSlugToId(slugToId);
        setCatIdToCat(idToCat);
      } catch (e) {
        setCategories([]);
        setCatSlugToId({});
        setCatIdToCat({});
      }
    }
    fetchCategories();
  }, []);

  const [items, setItems] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);

  const reqSeqRef = useRef(0);

  // fetchPage function
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
          const selectedId = slug ? catSlugToId[slug] : undefined;
          const sortType = mapSortType(TAB_KEYS.NOVELS, sortBy);

          res = await rankingsApi.getNovels({
            page,
            size: pageSize,
            categoryId: selectedId,
            sortType,
            timeRange,
          });

          let batch = Array.isArray(res?.items) ? res.items : [];
          // enrich categoryName/slug from categories
          batch = batch.map((it) => {
            const cat = catIdToCat[it.categoryId];
            return {
              ...it,
              categoryName: cat?.name || it.categoryName || '',
              categorySlug: cat?.slug || '',
            };
          });

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
          const sortType = mapSortType(TAB_KEYS.WRITERS, sortBy);
          res = await rankingsApi.getWriters({
            page,
            size: pageSize,
            timeRange,
            sortType,
          });
          let batch = Array.isArray(res?.items) ? res.items : [];
          if (reqId !== reqSeqRef.current) return;
          if (replace) setItems(batch);
          else setItems((prev) => [...prev, ...batch]);
          const more = batch.length === (res?.size ?? pageSize);
          hasMoreRef.current = more;
          setHasMore(more);
        }
      } catch (e) {
        if (reqId !== reqSeqRef.current) return;
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
    [activeTab, catSlugToId, catIdToCat]
  );

  // Keep a ref of current items so we can preserve them during replace loads
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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

  // current slug
  const uiGenre = useMemo(() => {
    if (!/(leaderboard|rankings)\/Novel/i.test(location.pathname)) return 'all';
    const slug = extractUrlCategory(location.pathname);
    return slug ? slug.toLowerCase() : 'all';
  }, [location.pathname]);

  // category select from UI
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
                  {categories.map((c) => {
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

          {/* Right rankings */}
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
                  tab={
                    activeTab === TAB_KEYS.READERS
                      ? 'users'
                      : activeTab === TAB_KEYS.WRITERS
                        ? 'writer'
                        : activeTab
                  }
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
