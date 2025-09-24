import React from 'react';
import './featurenovels.css';

const FeatureNovels = ({ title = 'Featured Novels', novels = [] }) => (
  <div className="feature-novels-container" style={{ background: '#f6f8fa', width: '100%' }}>
    <div className="feature-novels-title">{title}</div>
    <div className="feature-novels-divider" />
    <div className="feature-novels-list">
      {novels.map((novel) => (
        <div className="feature-novel-card" key={novel.id}>
          <img src={novel.cover} alt={novel.title} className="feature-novel-cover" />
          <div className="feature-novel-title">{novel.title}</div>
          <div className="feature-novel-category">{novel.category}</div>
          </div>
      ))}
    </div>
  </div>
);

export default FeatureNovels;
