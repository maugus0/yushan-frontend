import React, { useEffect, useMemo, useRef } from 'react';
import { List, Avatar, Skeleton, Spin, Button } from 'antd';
import {
  CrownFilled,
  UserOutlined,
  ReadOutlined,
  FireFilled,
  LikeFilled,
  BookFilled,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { xpToLevel, levelMeta } from '../../utils/levels';
import './leaderboard-list.css';

const Medal = ({ rank }) => {
  if (rank > 3) return null;
  const colors = ['#fadb14', '#d9d9d9', '#ad6800'];
  return <CrownFilled style={{ color: colors[rank - 1], marginRight: 6 }} />;
};

/**
 * Renders ranking rows with a stable CSS Grid:
 * - Novels (strict two lines): [avatar | (line1, line2) | actions(centered)]
 * - Users/Writers: [avatar | content]
 * Spinner/No-more stays at the bottom footer only.
 */
export default function LeaderboardList({
  tab,
  loadingInitial,
  loadingMore,
  data,
  hasMore,
  onLoadMore,
}) {
  const navigate = useNavigate();
  const pageSizeGuess = 20;

  // IO anchor and guards
  const anchorRef = useRef(null);
  const pendingRef = useRef(false);
  const scrolledRef = useRef(false);
  const triedMoreRef = useRef(false);

  // Mark interaction so we don't auto-load on first paint
  useEffect(() => {
    const mark = () => { scrolledRef.current = true; };
    const onKey = (e) => { if (['PageDown', 'End', 'ArrowDown', ' '].includes(e.key)) mark(); };
    window.addEventListener('scroll', mark, { passive: true });
    window.addEventListener('wheel', mark, { passive: true });
    window.addEventListener('touchmove', mark, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', mark);
      window.removeEventListener('wheel', mark);
      window.removeEventListener('touchmove', mark);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const loadMoreStable = useMemo(() => onLoadMore, [onLoadMore]);

  // Attach IO after initial page is rendered
  useEffect(() => {
    if (loadingInitial) return;
    const node = anchorRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && scrolledRef.current && hasMore && !loadingMore && !pendingRef.current) {
          pendingRef.current = true;
          triedMoreRef.current = true;
          loadMoreStable?.();
        }
      },
      { root: null, rootMargin: '300px', threshold: 0.01 }
    );

    io.observe(node);
    return () => {
      io.disconnect();
      pendingRef.current = false;
    };
  }, [hasMore, loadingInitial, loadingMore, loadMoreStable]);

  useEffect(() => {
    if (!loadingMore) pendingRef.current = false;
  }, [loadingMore]);

  const handleAdd = (item) => {
    // TODO: integrate with Library service
    console.log('Add to library:', item?.title || item?.name || item?.username);
  };

  const renderNovelRow = (item, index) => {
    const rank = index + 1;
    const id = item.novelId || item.id;
    return (
      <div className="lb-row lb-row--novel" key={id || `novel-${index}`}>
        {/* Avatar spans both lines */}
        <div className="lb-cell lb-cell--avatar">
          <Avatar shape="square" size={48} src={item.cover} icon={<ReadOutlined />} />
        </div>

        {/* Line 1: rank + title */}
        <div className="lb-cell lb-cell--content-line1">
          <Medal rank={rank} />
          <span className="rank-dot">{rank}.</span>
          <a href={`/read/${id}`} className="title-link">
            {item.title}
          </a>
        </div>

        {/* Line 2: views + votes */}
        <div className="lb-cell lb-cell--content-line2">
          <span className="desc-item">
            <FireFilled className="desc-icon views" /> {item.views?.toLocaleString?.() || 0}
          </span>
          <span className="separator">•</span>
          <span className="desc-item">
            <LikeFilled className="desc-icon votes" /> {item.votes?.toLocaleString?.() || 0}
          </span>
        </div>

        {/* Actions: vertically centered between two lines on the right */}
        <div className="lb-cell lb-cell--actions-center">
          <Button icon={<PlusOutlined />} onClick={() => handleAdd(item)} className="lb-btn">
            Add
          </Button>
          <Button
            type="primary"
            icon={<ReadOutlined />}
            onClick={() => navigate(`/read/${id}`)}
            className="lb-btn-primary"
          >
            Read
          </Button>
        </div>
      </div>
    );
  };

  const renderUserRow = (item, index) => {
    const rank = index + 1;
    const level = item.level ?? xpToLevel(item.xp || 0);
    const meta = levelMeta(level);
    const xp = item.xp ?? 0;
    return (
      <div className="lb-row" key={item.userId || item.username || `user-${index}`}>
        <div className="lb-cell lb-cell--avatar">
          <Avatar size={48} src={item.avatar} icon={<UserOutlined />} />
        </div>
        <div className="lb-cell lb-cell--content">
          <div className="row-title">
            <Medal rank={rank} />
            <span className="rank-dot">{rank}.</span>
            <a href={`/profile/${item.userId || item.username}`} className="title-link">
              {item.username}
            </a>
          </div>
          <div className="row-desc">
            <span className="level-pill nowrap">Lv.{level} · {meta.title}</span>
            <span className="separator">•</span>
            <span className="desc-item nowrap">Experience Points: {xp?.toLocaleString?.() || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderWriterRow = (item, index) => {
    const rank = index + 1;
    return (
      <div className="lb-row" key={item.writerId || item.name || `writer-${index}`}>
        <div className="lb-cell lb-cell--avatar">
          <Avatar size={48} src={item.avatar} icon={<UserOutlined />} />
        </div>
        <div className="lb-cell lb-cell--content">
          <div className="row-title">
            <Medal rank={rank} />
            <span className="rank-dot">{rank}.</span>
            <a href={`/profile/${item.writerId || item.name}`} className="title-link">
              {item.name}
            </a>
          </div>
          <div className="row-desc">
            <span className="desc-item"><BookFilled className="desc-icon books" /> {item.books || 0}</span>
            <span className="separator">•</span>
            <span className="desc-item"><LikeFilled className="desc-icon votes" /> {item.votes?.toLocaleString?.() || 0}</span>
            <span className="separator">•</span>
            <span className="desc-item"><FireFilled className="desc-icon views" /> {item.views?.toLocaleString?.() || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderRow = (item, idx) => {
    if (tab === 'novels') return renderNovelRow(item, idx);
    if (tab === 'users') return renderUserRow(item, idx);
    return renderWriterRow(item, idx);
  };

  const listData =
    loadingInitial && (!data?.items || data.items.length === 0)
      ? Array.from({ length: pageSizeGuess }).map((_, i) => ({ __skeleton: i }))
      : data.items;

  const showNoMore =
    !loadingInitial && !loadingMore && !hasMore && (scrolledRef.current || triedMoreRef.current);

  return (
    <div className="leaderboard-list">
      <List
        dataSource={listData}
        renderItem={(it, idx) =>
          it.__skeleton ? (
            <List.Item key={`skeleton-${idx}`}>
              <div className="lb-row lb-row--novel">
                <div className="lb-cell lb-cell--avatar">
                  <Skeleton.Avatar active size={48} shape="circle" />
                </div>
                <div className="lb-cell lb-cell--content-line1">
                  <Skeleton.Input active style={{ width: 320 }} />
                </div>
                <div className="lb-cell lb-cell--content-line2">
                  <Skeleton.Input active style={{ width: 420 }} />
                </div>
                <div className="lb-cell lb-cell--actions-center">
                  <Skeleton.Button active style={{ width: 64, marginRight: 8 }} />
                  <Skeleton.Button active style={{ width: 72 }} />
                </div>
              </div>
            </List.Item>
          ) : (
            <List.Item key={idx}>{renderRow(it, idx)}</List.Item>
          )
        }
        footer={
          !loadingInitial ? (
            <div className="lb-footer">
              <div ref={anchorRef} className="lb-sentinel-anchor" />
              {loadingMore ? <Spin /> : showNoMore ? <span className="lb-end">No more results</span> : null}
            </div>
          ) : null
        }
      />
    </div>
  );
}