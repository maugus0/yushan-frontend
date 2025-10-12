import React from 'react';
import { Card, Image } from 'antd';
import { StarFilled } from '@ant-design/icons';
import './novelcard.css';
import fallbackImage from '../../../assets/images/novel_default.png';

const NovelCard = ({ cover, title, category, rating, onClick }) => (
  <Card 
    className="novel-card" 
    styles={{ body: { padding: 0 } }}
    onClick={onClick}
    style={{ 
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s ease-in-out'
    }}
    hoverable={!!onClick}
  >
    <div className="novel-card-flex">
      <div className="novel-card-img">
        <Image
          src={cover || fallbackImage}
          alt={title}
          width={48}
          height={64}
          preview={false}
          fallback={fallbackImage}
          style={{ borderRadius: '8px', objectFit: 'cover' }}
        />
      </div>
      <div className="novel-card-content">
        <div className="novel-card-title">{title}</div>
        <div className="novel-card-category">{category}</div>
        <div className="novel-card-rating">
          <StarFilled style={{ color: '#bbb', fontSize: '12px' }} />
          <span className="novel-card-score">{rating}</span>
        </div>
      </div>
    </div>
  </Card>
);

export default NovelCard;
