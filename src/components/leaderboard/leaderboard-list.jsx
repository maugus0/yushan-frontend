import React, { useEffect, useMemo, useRef, useState } from 'react';
import { List, Avatar, Skeleton, Spin } from 'antd';
import { Link } from 'react-router-dom';
import {
  CrownFilled,
  UserOutlined,
  ReadOutlined,
  FireFilled,
  LikeFilled,
  BookFilled,
} from '@ant-design/icons';
import { xpToLevel, levelMeta } from '../../utils/levels';
import './leaderboard-list.css';

// Build absolute URL for images from backend (staging or same-origin /api)
const API_BASE = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');
function toAbsoluteUrl(u) {
  if (!u) return undefined;
  const s = String(u).trim();
  if (/^https?:\/\//i.test(s) || /^data:/i.test(s)) return s;
  const path = s
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/^api\/+/i, '');
  return `${API_BASE}/${path}`;
}

// For now we do NOT request protected images. If URL points to our API, return undefined
// so Antd Avatar uses its fallback icon. This avoids 401 image requests.
function resolveImageSrc(u) {
  const abs = toAbsoluteUrl(u);
  if (!abs) return undefined;
  return abs.startsWith(`${API_BASE}/`) ? undefined : abs;
}

function AvatarMaybeAuth({ src, ...rest }) {
  const [url, setUrl] = useState(resolveImageSrc(src));
  useEffect(() => {
    setUrl(resolveImageSrc(src));
  }, [src]);
  // onError: keep icon fallback
  return <Avatar {...rest} src={url} onError={() => false} />;
}

const Medal = ({ rank }) => {
  if (rank > 3) return null;
  const colors = ['#fadb14', '#d9d9d9', '#ad6800'];
  return <CrownFilled style={{ color: colors[rank - 1], marginRight: 6 }} />;
};

// Format rank as 3 digits (001, 002, ...)
const RankCell = ({ rank }) => (
  <div className="lb-cell lb-cell--rank">
    <span className="rank-number">{String(rank).padStart(3, '0')}</span>
  </div>
);

// helper: prefer a, else b
const or = (a, b) => (a !== undefined && a !== null ? a : b);

export default function LeaderboardList({
  tab,
  loadingInitial,
  loadingMore,
  data,
  hasMore,
  onLoadMore,
}) {
  const pageSizeGuess = 50;

  // IO anchor and guards
  const anchorRef = useRef(null);
  const pendingRef = useRef(false);
  const scrolledRef = useRef(false);
  const triedMoreRef = useRef(false);

  // Mark interaction so we don't auto-load on first paint
  useEffect(() => {
    const mark = () => {
      scrolledRef.current = true;
    };
    const onKey = (e) => {
      if (['PageDown', 'End', 'ArrowDown', ' '].includes(e.key)) mark();
    };
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
        if (
          entry.isIntersecting &&
          scrolledRef.current &&
          hasMore &&
          !loadingMore &&
          !pendingRef.current
        ) {
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

  const renderNovelRow = (item, index) => {
    const rank = index + 1;
    const id = item.id ?? item.uuid; // prefer numeric id for /api/novels/{id}
    const views = or(item.views, item.viewCnt);
    const votes = or(item.votes, item.voteCnt);

    return (
      <div className="lb-row lb-row--novel" key={id || `novel-${index}`}>
        <RankCell rank={rank} />
        <div className="lb-cell lb-cell--avatar">
          <AvatarMaybeAuth
            shape="square"
            size={48}
            src={item.coverImgUrl || item.cover}
            icon={<ReadOutlined />}
          />
        </div>

        <div className="lb-cell lb-cell--content-line1">
          <Medal rank={rank} />
          <Link
            to={`/novel/${id}`}
            className="title-link"
            state={{ from: window.location.pathname }}
          >
            {item.title || `Novel ${id}`}
          </Link>
          {item.categoryName && <span className="category-pill">{item.categoryName}</span>}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className="novel-tags">
              {item.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="lb-cell lb-cell--content-line2">
          <span className="desc-item">
            <FireFilled className="desc-icon views" /> {views?.toLocaleString?.() || 0}
          </span>
          <span className="separator">•</span>
          <span className="desc-item">
            <LikeFilled className="desc-icon votes" /> {votes?.toLocaleString?.() || 0}
          </span>
        </div>
      </div>
    );
  };

  const renderUserRow = (item, index) => {
    const rank = index + 1;
    const username = item.username || 'User';
    const userKey = item.uuid || or(item.userId, username);
    const xp = or(item.exp, item.xp) || 0;
    const level = item.level ?? xpToLevel(xp);
    const meta = levelMeta(level);

    return (
      <div className="lb-row" key={userKey || `user-${index}`}>
        <RankCell rank={rank} />
        <div className="lb-cell lb-cell--avatar">
          <AvatarMaybeAuth size={48} src={item.avatarUrl || item.avatar} icon={<UserOutlined />} />
        </div>
        <div className="lb-cell lb-cell--content">
          <div className="row-title">
            <Medal rank={rank} />
            <Link to={`/profile/${userKey}`} className="title-link">
              {username}
            </Link>
          </div>
          <div className="row-desc">
            <span className="level-pill nowrap">
              Lv.{level} · {meta.title}
            </span>
            <span className="separator">•</span>
            <span className="desc-item nowrap">
              Experience Points: {xp?.toLocaleString?.() || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderWriterRow = (item, index) => {
    const rank = index + 1;
    const key = item.uuid || item.username || `writer-${index}`;

    return (
      <div className="lb-row" key={key}>
        <RankCell rank={rank} />
        <div className="lb-cell lb-cell--avatar">
          <AvatarMaybeAuth size={48} src={item.avatarUrl || item.avatar} icon={<UserOutlined />} />
        </div>
        <div className="lb-cell lb-cell--content">
          <div className="row-title">
            <Medal rank={rank} />
            <Link to={`/profile/${key}`} className="title-link">
              {item.username || 'Writer'}
            </Link>
          </div>
          <div className="row-desc">
            <span className="desc-item">
              <BookFilled className="desc-icon books" /> {item.novelNum ?? 0}
            </span>
            <span className="separator">•</span>
            <span className="desc-item">
              <LikeFilled className="desc-icon votes" />{' '}
              {item.totalVoteCnt?.toLocaleString?.() ?? 0}
            </span>
            <span className="separator">•</span>
            <span className="desc-item">
              <FireFilled className="desc-icon views" />{' '}
              {item.totalViewCnt?.toLocaleString?.() ?? 0}
            </span>
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
      : data.items || [];

  const showNoMore =
    !loadingInitial && !loadingMore && !hasMore && (scrolledRef.current || triedMoreRef.current);

  return (
    <div className="leaderboard-list lb-list">
      <List
        dataSource={listData}
        renderItem={(it, idx) =>
          it.__skeleton ? (
            <List.Item key={`skeleton-${idx}`}>
              <div className="lb-row lb-row--novel">
                <div className="lb-cell lb-cell--rank">
                  <Skeleton.Input active style={{ width: 28 }} size="small" />
                </div>
                <div className="lb-cell lb-cell--avatar">
                  <Skeleton.Avatar active size={48} shape="square" />
                </div>
                <div className="lb-cell lb-cell--content-line1">
                  <Skeleton.Input active style={{ width: 320 }} />
                </div>
                <div className="lb-cell lb-cell--content-line2">
                  <Skeleton.Input active style={{ width: 420 }} />
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
              {loadingMore ? (
                <Spin />
              ) : showNoMore ? (
                <span className="lb-end">No more results</span>
              ) : null}
            </div>
          ) : null
        }
      />
    </div>
  );
}
