import React from 'react';
import { Tag, Tooltip } from 'antd';

/**
 * BrowseNovelCard (stable simplified)
 * Props:
 *  - novel: { id, title, author, cover, genres, status, description, stats }
 *  - viewMode: 'grid' | 'list'
 *  - onClick: (novel) => void
 */
const MAX_TAGS = 3;
const MAX_DESC = 160;

const NovelCard = ({ novel, viewMode, onClick }) => {
  const { title, author, cover, genres, status, description, stats } = novel;

  const desc =
    viewMode === 'list'
      ? (description || '').slice(0, MAX_DESC) + ((description || '').length > MAX_DESC ? '…' : '')
      : null;

  return (
    <div
      className={`browse-card ${viewMode === 'list' ? 'browse-card--list' : 'browse-card--grid'}`}
      tabIndex={0}
      role="article"
      aria-label={title}
      onClick={() => onClick(novel)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick(novel);
      }}
    >
      <div className="browse-card__cover">
        <img src={cover} alt={`${title} cover`} loading="lazy" draggable={false} />
      </div>
      <div className="browse-card__body">
        <h4 className="browse-card__title">{title}</h4>
        <div className="browse-card__author">{author}</div>
        <div className="browse-card__tags">
          {genres.slice(0, MAX_TAGS).map((g) => (
            <Tag key={g} color="blue">
              {g}
            </Tag>
          ))}
          {genres.length > MAX_TAGS && (
            <Tooltip title={genres.slice(MAX_TAGS).join(', ')}>
              <Tag color="default">+{genres.length - MAX_TAGS}</Tag>
            </Tooltip>
          )}
          <Tag color={status === 'Ongoing' ? 'green' : 'gold'}>{status}</Tag>
        </div>
        <div className="browse-card__stats">
          <span>{stats.chapters} chapters</span>
          <span>{stats.popularity} ⭐</span>
          <span>{stats.rating.toFixed(1)} / 5</span>
        </div>
        {desc && <div className="browse-card__desc">{desc}</div>}
      </div>
    </div>
  );
};

export default NovelCard;
