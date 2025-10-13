import React from 'react';
import './featurenovels.css';
import { handleImageError } from '../../../utils/imageUtils';
import fallbackImage from '../../../assets/images/novel_default.png';

const FeatureNovels = ({ title = 'Featured Novels', novels = [], onNovelClick }) => {
  const onImageError = (e) => handleImageError(e, fallbackImage);

  return (
    <div className="feature-novels-container" style={{ background: '#f6f8fa', width: '100%' }}>
      <div className="feature-novels-title">{title}</div>
      <div className="feature-novels-divider" />
      <div className="feature-novels-list">
        {novels.map((novel) => (
          <div
            className="feature-novel-card"
            key={novel.id}
            onClick={() => onNovelClick && onNovelClick(novel)}
            style={{
              cursor: onNovelClick ? 'pointer' : 'default',
              transition: 'transform 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              if (onNovelClick) {
                e.target.style.transform = 'translateY(-4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (onNovelClick) {
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            <img
              src={novel.cover}
              alt={novel.title}
              className="feature-novel-cover"
              onError={onImageError}
            />
            <div className="feature-novel-title">{novel.title}</div>
            <div className="feature-novel-category">{novel.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureNovels;
