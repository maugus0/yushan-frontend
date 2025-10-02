import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Empty, Breadcrumb, Button } from 'antd';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import './leaderboard.css';
import LeaderboardFilters from '../../components/leaderboard/leaderboard-filters';
import LeaderboardList from '../../components/leaderboard/leaderboard-list';
import {
  getNovelsLeaderboard,
  getUsersLeaderboard,
  getWritersLeaderboard,
} from '../../services/leaderboard';

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

// Treat "all" as undefined when calling backend
function normalizeGenre(g) {
  if (!g) return undefined;
  return String(g).toLowerCase() === 'all' ? undefined : g;
}

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

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const [hasMore, setHasMore] = useState(true);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Parse URL to determine active tab and category
  useEffect(() => {
    const p = location.pathname;
    let nextTab = TAB_KEYS.NOVELS;
    let nextGenre = 'all'; // Default to 'all' for showing all novels
    let shouldOpenCats = true; // Default to open categories

    // Check for specific paths
    if (/(leaderboard|rankings)\/Readers/i.test(p)) {
      nextTab = TAB_KEYS.READERS;
      shouldOpenCats = false;
    } else if (/(leaderboard|rankings)\/Writers/i.test(p)) {
      nextTab = TAB_KEYS.WRITERS;
      shouldOpenCats = false;
    } else if (/(leaderboard|rankings)\/Novel/i.test(p)) {
      nextTab = TAB_KEYS.NOVELS;
      // Extract category from URL parameters
      if (params.category) {
        // Don't replace hyphens with spaces - keep original format
        const urlCategory = decodeURIComponent(params.category);
        console.log('Raw URL Category:', urlCategory, 'Available categories:', NOVEL_CATEGORIES); // Debug log

        // Find exact match in NOVEL_CATEGORIES
        const matchedCategory = NOVEL_CATEGORIES.find(
          (cat) => cat === urlCategory || cat.toLowerCase() === urlCategory.toLowerCase()
        );

        if (matchedCategory) {
          nextGenre = matchedCategory; // Use the exact matched category name
          shouldOpenCats = true; // Open categories when on a specific category page
          console.log('Matched category:', matchedCategory); // Debug log
        } else {
          console.log('Category not found, trying with space replacement'); // Debug log
          // Fallback: try replacing hyphens with spaces
          const urlCategoryWithSpaces = urlCategory.replace(/-/g, ' ');
          const fallbackMatch = NOVEL_CATEGORIES.find(
            (cat) => cat.toLowerCase() === urlCategoryWithSpaces.toLowerCase()
          );
          if (fallbackMatch) {
            nextGenre = fallbackMatch;
            shouldOpenCats = true;
            console.log('Fallback matched category:', fallbackMatch); // Debug log
          } else {
            console.log('No category match found, defaulting to all'); // Debug log
            nextGenre = 'all';
            shouldOpenCats = true;
          }
        }
      } else {
        // /rankings/Novel without category - show all novels with accordion open
        nextGenre = 'all';
        shouldOpenCats = true; // Keep accordion open for /rankings/Novel
      }
    } else if (/(leaderboard|rankings)\/?$/i.test(p)) {
      // Default route shows all novels - redirect to /rankings/Novel to maintain consistency
      nextTab = TAB_KEYS.NOVELS;
      nextGenre = 'all';
      shouldOpenCats = true; // Open accordion for default entry

      // Redirect to /rankings/Novel for consistency
      navigate('/rankings/Novel', { replace: true });
      return; // Exit early to avoid state updates before redirect
    }

    console.log('Final setting genre to:', nextGenre); // Debug log

    // Update tab and category state
    setActiveTab(nextTab);
    setCatsOpen(shouldOpenCats);

    // Update filters - preserve existing sortBy unless explicitly changing tabs
    setFilters((prev) => {
      const tabChanged = prev && activeTab !== nextTab;
      return {
        ...prev,
        genre: nextGenre,
        // Only reset sortBy when actually changing tabs, not when changing categories within novels
        sortBy: tabChanged ? defaultSortFor(nextTab) : prev.sortBy || defaultSortFor(nextTab),
      };
    });
  }, [location.pathname, params.category, navigate, activeTab]);

  const goTab = useCallback(
    (key) => {
      if (key === TAB_KEYS.NOVELS) navigate('/rankings/Novel');
      else if (key === TAB_KEYS.READERS) navigate('/rankings/Readers');
      else navigate('/rankings/Writers');
    },
    [navigate]
  );

  const fetchPage = useCallback(
    async ({ page, pageSize, timeRange, genre, sortBy }, replace = false) => {
      setError('');
      if (replace) setLoadingInitial(true);
      else setLoadingMore(true);

      try {
        const payload = { page, pageSize, timeRange };
        const g = normalizeGenre(genre);
        if (g !== undefined) payload.genre = g;

        let res;
        if (activeTab === TAB_KEYS.NOVELS) {
          res = await getNovelsLeaderboard({ ...payload, sortBy });
        } else if (activeTab === TAB_KEYS.READERS) {
          res = await getUsersLeaderboard({ ...payload, sortBy: 'levelxp' });
        } else {
          res = await getWritersLeaderboard({ ...payload, sortBy: sortBy || 'books' });
        }

        const batch = Array.isArray(res?.items) ? res.items : [];
        const more = batch.length === pageSize;

        if (replace) setItems(batch);
        else setItems((prev) => [...prev, ...batch]);

        hasMoreRef.current = more;
        setHasMore(more);
      } catch (e) {
        console.error(e);
        setError('Failed to load leaderboard. Please try again.');
      } finally {
        if (replace) setLoadingInitial(false);
        else setLoadingMore(false);
      }
    },
    [activeTab]
  );

  const resetAndFetch = useCallback(
    (patch = {}, baseFilters) => {
      // Use the latest filters passed in (fallback to ref if not provided)
      const base = baseFilters ?? filtersRef.current;

      const next = { ...base, ...patch };

      // Only set default sortBy if it's not already provided
      if (activeTab === TAB_KEYS.READERS) {
        next.sortBy = 'levelxp';
      } else if (!next.sortBy) {
        next.sortBy = defaultSortFor(activeTab);
      }

      setFilters(next);
      setItems([]);
      pageRef.current = 1;
      hasMoreRef.current = true;
      setHasMore(true);

      fetchPage(
        {
          page: 1,
          pageSize: next.pageSize,
          timeRange: next.timeRange,
          genre: next.genre,
          sortBy: next.sortBy,
        },
        true
      );
    },
    [activeTab, fetchPage]
  );

  // Helper function to refetch data with current filters
  const refetchData = useCallback(() => {
    const currentFilters = filtersRef.current;
    setItems([]);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);

    fetchPage(
      {
        page: 1,
        pageSize: currentFilters.pageSize,
        timeRange: currentFilters.timeRange,
        genre: currentFilters.genre,
        sortBy: currentFilters.sortBy,
      },
      true
    );
  }, [fetchPage]);

  // Handle major changes (genre, activeTab) - these should reset sortBy if needed
  useEffect(() => {
    // Pass the latest filters so genre from URL (e.g., Martial Arts) is preserved
    resetAndFetch({}, { ...filters });
  }, [filters.genre, activeTab, resetAndFetch]);

  // Handle timeRange changes without resetting sortBy
  useEffect(() => {
    if (filters.timeRange) {
      refetchData();
    }
  }, [filters.timeRange]);

  // Handle sortBy changes without resetting other filters
  useEffect(() => {
    if (filters.sortBy) {
      refetchData();
    }
  }, [filters.sortBy]);

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

  // Handle category selection with URL navigation
  const onSelectCategory = useCallback(
    (label) => {
      console.log('onSelectCategory called with label:', label); // Debug log

      if (String(label).toLowerCase() === 'all') {
        navigate('/rankings/Novel');
      } else {
        // Find the exact category match to ensure proper casing
        const exactCategory = NOVEL_CATEGORIES.find(
          (cat) => cat.toLowerCase() === String(label).toLowerCase()
        );

        if (exactCategory) {
          // Use the exact category name as URL path (preserve hyphens in Sci-Fi)
          const categoryPath = exactCategory.replace(/\s+/g, '-');
          console.log('Navigating to:', `/rankings/Novel/${categoryPath}`); // Debug log
          navigate(`/rankings/Novel/${categoryPath}`);
        } else {
          console.log('Category not found, navigating to all novels'); // Debug log
          navigate('/rankings/Novel');
        }
      }
    },
    [navigate]
  );

  // Handle novels nav item click
  const handleNovelsClick = useCallback(() => {
    const currentPath = location.pathname;
    const currentGenre = filters.genre || 'all';

    // Check if we're currently on a specific category page
    const isOnCategoryPage = params.category && currentGenre !== 'all';

    if (isOnCategoryPage) {
      // If on a category page, navigate to show all novels but keep accordion open
      navigate('/rankings/Novel');
    } else if (activeTab === TAB_KEYS.NOVELS && currentPath === '/rankings/Novel') {
      // If already on all novels page, toggle the accordion
      setCatsOpen((prev) => !prev);
    } else {
      // If on other tabs, navigate to novels
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
          {/* Custom left nav with category routing support */}
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

              {/* Novel categories accordion - shows when novels tab is active */}
              {activeTab === TAB_KEYS.NOVELS && catsOpen && (
                <div className="side-accordion-body">
                  <button
                    key="all-novels"
                    type="button"
                    className={`cat-pill${filters.genre === 'all' || !filters.genre ? ' active' : ''}`}
                    onClick={() => onSelectCategory('all')}
                  >
                    All Novels
                  </button>
                  {NOVEL_CATEGORIES.map((category, i) => {
                    const currentGenre = filters.genre || 'all';
                    // Use exact string comparison since URL parsing ensures exact match
                    const isActive = currentGenre === category;
                    console.log(
                      `Category: ${category}, Current: ${currentGenre}, Active: ${isActive}`
                    ); // Debug log
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
                onClick={() => goTab(TAB_KEYS.READERS)}
                aria-selected={activeTab === TAB_KEYS.READERS}
              >
                Readers
              </button>

              <button
                type="button"
                className={`side-nav-item${activeTab === TAB_KEYS.WRITERS ? ' active' : ''}`}
                onClick={() => goTab(TAB_KEYS.WRITERS)}
                aria-selected={activeTab === TAB_KEYS.WRITERS}
              >
                Writers
              </button>
            </nav>
          </div>

          <div className="rankings-right">
            <div className="rankings-filters">
              <LeaderboardFilters
                tab={activeTab === TAB_KEYS.READERS ? 'users' : activeTab}
                query={{ ...filters, page: pageRef.current }}
                onChange={(patch) => {
                  console.log('Filter onChange called with:', patch); // Debug log
                  // Simply update filters state, let the separate useEffects handle the logic
                  setFilters((prev) => ({ ...prev, ...patch }));
                }}
                hideSort={activeTab === TAB_KEYS.READERS}
              />
            </div>

            {error ? (
              <div className="rankings-error">
                <div className="rankings-error-text">{error}</div>
                <Button onClick={() => resetAndFetch()}>Retry</Button>
              </div>
            ) : (
              <>
                <LeaderboardList
                  tab={activeTab === TAB_KEYS.READERS ? 'users' : activeTab}
                  loadingInitial={loadingInitial}
                  loadingMore={loadingMore}
                  data={{ items }}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                />
                {!loadingInitial && items.length === 0 && (
                  <div style={{ padding: 16 }}>
                    <Empty description="No data" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
