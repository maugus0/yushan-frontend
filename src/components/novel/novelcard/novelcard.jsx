import React from 'react';
import { Card, Image } from 'antd';
import { StarFilled } from '@ant-design/icons';
import './novelcard.css';

const NovelCard = ({ cover, title, category, rating }) => (
  <Card className="novel-card" styles={{ body: { padding: 0 } }}>
    <div className="novel-card-flex">
      <div className="novel-card-img">
        <Image
          src={cover}
          alt={title}
          width={48}
          height={64}
          preview={false}
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