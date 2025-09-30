import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, Card, Empty, Breadcrumb } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './leaderboard.css';
import LeaderboardFilters from '../../components/leaderboard/leaderboard-filters';
import LeaderboardList from '../../components/leaderboard/leaderboard-list';
import {
  getNovelsLeaderboard,
  getUsersLeaderboard,
  getWritersLeaderboard,
} from '../../services/leaderboard';

const TAB_KEYS = {
  NOVELS: 'novels',
  READERS: 'users',  
  WRITERS: 'writers',
};

const DEFAULT_QUERY = {
  timeRange: 'overall',
  genre: 'all',
  sortBy: 'views',
  page: 1,
  pageSize: 20,
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.NOVELS);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({ items: [], total: 0 });
  const location = useLocation();
  const navigate = useNavigate();

  // 1) Determine active tab based on URL path
  // 2) Define tabs (labels: Readers)
  // 3) Update route on tab change (keep /rankings prefix)
  // 4) Fetch data
  useEffect(() => {
    const p = location.pathname;
    if (/\/(leaderboard|rankings)\/Readers/i.test(p)) {
      setActiveTab(TAB_KEYS.READERS);
    } else if (/\/(leaderboard|rankings)\/Writers/i.test(p)) {
      setActiveTab(TAB_KEYS.WRITERS);
    } else {
      setActiveTab(TAB_KEYS.NOVELS);
    }
  }, [location.pathname]);

  // Define tabs for the leaderboard
  const tabs = useMemo(
    () => [
      { key: TAB_KEYS.NOVELS, label: 'Novels' },
      { key: TAB_KEYS.READERS, label: 'Readers' },
      { key: TAB_KEYS.WRITERS, label: 'Writers' },
    ],
    []
  );

  // 3) Update route on tab change (keep /rankings prefix)
  const pushRouteForTab = (key) => {
    if (key === TAB_KEYS.NOVELS) navigate('/rankings/Novel');
    else if (key === TAB_KEYS.READERS) navigate('/rankings/Readers');
    else navigate('/rankings/Writers');
  };

  // 4) Fetch data
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        let res;
        if (activeTab === TAB_KEYS.NOVELS) {
          res = await getNovelsLeaderboard(query);
        } else if (activeTab === TAB_KEYS.READERS) {
          const sortBy = query.sortBy === 'views' ? 'levelxp' : query.sortBy || 'levelxp';
          res = await getUsersLeaderboard({ ...query, sortBy });
        } else {
          const sortBy = query.sortBy || 'score';
          res = await getWritersLeaderboard({ ...query, sortBy });
        }
        if (!cancelled) setData({ items: res.items || [], total: res.total || 0 });
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Failed to load leaderboard. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [activeTab, query.timeRange, query.genre, query.sortBy, query.page, query.pageSize]);

  return (
    <div className="leaderboard-wrapper">
      <Breadcrumb
        items={[
          { title: <Link to="/">Home</Link> },
          { title: 'Leaderboard' },
        ]}
        style={{ marginBottom: 12 }}
      />

      <Card bordered className="leaderboard-card">
        <Tabs
          items={tabs}
          activeKey={activeTab}
          onChange={(k) => {
            setActiveTab(k);
            setQuery((q) => {
              const defaultSort = k === TAB_KEYS.NOVELS ? 'views' : k === TAB_KEYS.READERS ? 'levelxp' : 'score';
              return { ...q, page: 1, sortBy: defaultSort };
            });
            pushRouteForTab(k);
          }}
        />

        <LeaderboardFilters
          tab={activeTab === TAB_KEYS.READERS ? 'users' : activeTab} // 复用 users 的过滤器定义
          query={query}
          onChange={(patch) => setQuery((q) => ({ ...q, ...patch, page: 1 }))}
        />

        <LeaderboardList
          tab={activeTab === TAB_KEYS.READERS ? 'users' : activeTab}
          loading={loading}
          error={error}
          data={data}
          page={query.page}
          pageSize={query.pageSize}
          onPageChange={(p, ps) => setQuery((q) => ({ ...q, page: p, pageSize: ps }))}
        />

        {!loading && !error && data.total === 0 && (
          <div style={{ padding: 16 }}>
            <Empty description="No data" />
          </div>
        )}
      </Card>
    </div>
  );
}