import React from 'react';
import './featurenovels.css';
import fallbackImage from '../../../assets/images/novel_default.png';

const FeatureNovels = ({ title = 'Featured Novels', novels = [] }) => {
  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  return (
    <div className="feature-novels-container" style={{ background: '#f6f8fa', width: '100%' }}>
      <div className="feature-novels-title">{title}</div>
      <div className="feature-novels-divider" />
      <div className="feature-novels-list">
        {novels.map((novel) => (
          <div className="feature-novel-card" key={novel.id}>
            <img
              src={novel.cover}
              alt={novel.title}
              className="feature-novel-cover"
              onError={handleImageError}
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
