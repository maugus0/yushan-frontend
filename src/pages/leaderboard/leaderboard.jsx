import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Empty, Breadcrumb, Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './leaderboard.css';
import LeaderboardFilters from '../../components/leaderboard/leaderboard-filters';
import LeaderboardList from '../../components/leaderboard/leaderboard-list';
import { getNovelsLeaderboard, getUsersLeaderboard, getWritersLeaderboard } from '../../services/leaderboard';

const TAB_KEYS = { NOVELS: 'novels', READERS: 'users', WRITERS: 'writers' };

const DEFAULT_FILTERS = { timeRange: 'overall', genre: 'all', sortBy: 'views', pageSize: 20 };

const NOVEL_CATEGORIES = [
  'Action', 'Adventure', 'Martial Arts', 'Fantasy', 'Sci-Fi', 'Urban',
  'Historical', 'Eastern Fantasy', 'Wuxia', 'Xianxia', 'Military', 'Sports',
  'Romance', 'Drama', 'Slice of Life', 'School Life', 'Comedy',
];

// Treat "all" as undefined when calling backend
function normalizeGenre(g) {
  if (!g) return undefined;
  return String(g).toLowerCase() === 'all' ? undefined : g;
}

function defaultSortFor(tab) {
  if (tab === TAB_KEYS.READERS) return 'levelxp';
  if (tab === TAB_KEYS.WRITERS) return 'books'; // Writers default: By Books
  return 'views';
}

export default function LeaderboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

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
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  useEffect(() => {
    const p = location.pathname;
    let next = TAB_KEYS.NOVELS;
    if (/\/(leaderboard|rankings)\/Readers/i.test(p)) next = TAB_KEYS.READERS;
    else if (/\/(leaderboard|rankings)\/Writers/i.test(p)) next = TAB_KEYS.WRITERS;

    setActiveTab((prev) => (prev === next ? prev : next));
    setCatsOpen(next === TAB_KEYS.NOVELS);
  }, [location.pathname]);

  const goTab = useCallback((key) => {
    if (key === TAB_KEYS.NOVELS) navigate('/rankings/Novel');
    else if (key === TAB_KEYS.READERS) navigate('/rankings/Readers');
    else navigate('/rankings/Writers');
    setActiveTab(key);
    setCatsOpen(key === TAB_KEYS.NOVELS);
  }, [navigate]);

  const fetchPage = useCallback(
    async ({ page, pageSize, timeRange, genre, sortBy }, replace = false) => {
      setError('');
      if (replace) setLoadingInitial(true); else setLoadingMore(true);

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
          // Writers now accept 'books' | 'votes' | 'views'
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
        if (replace) setLoadingInitial(false); else setLoadingMore(false);
      }
    },
    [activeTab]
  );

  const resetAndFetch = useCallback((patch = {}) => {
    const base = filtersRef.current;
    const next = { ...base, ...patch };
    if (activeTab === TAB_KEYS.READERS) next.sortBy = 'levelxp';
    if (!next.sortBy) next.sortBy = defaultSortFor(activeTab);

    setFilters(next);
    setItems([]);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);

    fetchPage({ page: 1, pageSize: next.pageSize, timeRange: next.timeRange, genre: next.genre, sortBy: next.sortBy }, true);
  }, [activeTab, fetchPage]);

  useEffect(() => {
    resetAndFetch({ sortBy: defaultSortFor(activeTab) });
  }, [activeTab, resetAndFetch]);

  const loadMore = useCallback(() => {
    if (loadingInitial || loadingMore || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    const f = filtersRef.current;
    const sort = activeTab === TAB_KEYS.READERS ? 'levelxp' : (f.sortBy || defaultSortFor(activeTab));
    fetchPage({ page: nextPage, pageSize: f.pageSize, timeRange: f.timeRange, genre: f.genre, sortBy: sort });
  }, [activeTab, fetchPage, loadingInitial, loadingMore]);

  const onSelectCategory = (label) => {
    const v = String(label).toLowerCase() === 'all' ? 'all' : label;
    resetAndFetch({ genre: v });
  };

  return (
    <div className="rankings-layout">
      <div className="rankings-breadcrumb">
        <Breadcrumb items={[{ title: <Link to="/">Home</Link> }, { title: 'Leaderboard' }]} />
      </div>

      <Card bordered className="rankings-card">
        <div className="rankings-content">
          {/* Custom left nav (no ink bars / no borders). "Novels" is the accordion trigger. */}
          <div className="rankings-left">
            <nav className="side-nav" role="tablist" aria-orientation="vertical">
              <button
                type="button"
                className={`side-nav-item${activeTab === TAB_KEYS.NOVELS ? ' active' : ''}`}
                onClick={() => {
                  if (activeTab !== TAB_KEYS.NOVELS) goTab(TAB_KEYS.NOVELS);
                  else setCatsOpen((v) => !v);
                }}
                aria-selected={activeTab === TAB_KEYS.NOVELS}
                aria-expanded={activeTab === TAB_KEYS.NOVELS ? catsOpen : undefined}
              >
                Novels
                <span className={`caret ${activeTab === TAB_KEYS.NOVELS && catsOpen ? 'open' : ''}`} />
              </button>

              {activeTab === TAB_KEYS.NOVELS && catsOpen && (
                <div className="side-accordion-body">
                  {['All', ...NOVEL_CATEGORIES].map((c, i) => {
                    const current = (filtersRef.current.genre || 'all');
                    const isActive = String(current).toLowerCase() === (String(c).toLowerCase() === 'all' ? 'all' : String(c).toLowerCase());
                    return (
                      <button
                        key={`${c}-${i}`}
                        type="button"
                        className={`cat-pill${isActive ? ' active' : ''}`}
                        onClick={() => onSelectCategory(c)}
                      >
                        {c}
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
                query={{ ...filtersRef.current, page: pageRef.current }}
                onChange={(patch) => {
                  const { page: _ignore, sortBy, ...rest } = patch || {};
                  const nextPatch = (activeTab === TAB_KEYS.READERS) ? { ...rest, sortBy: 'levelxp' } : { ...rest, sortBy };
                  resetAndFetch(nextPatch);
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