import React from 'react';
import NovelCard from '../novelcard/novelcard';
import { Button } from 'antd';
import './leaderboard.css';


const getRankColor = (idx) => {
  if (idx === 0) return '#e74c3c';     // 1
  if (idx === 1) return '#faad14';     // 2
  if (idx === 2) return '#52c41a';     // 3
  return '#888';                       // Others gray
};

const Leaderboard = ({ data = [] }) => (
  <div className="leaderboard-container">
    <div className="leaderboard-header">
      <div className="leaderboard-title">Top Fanfic Books</div>
      <Button type="link" className="leaderboard-more">MORE</Button>
    </div>
    <div className="leaderboard-divider" />
    <div className="leaderboard-list">
      {data.map((book, idx) => (
        <div className="leaderboard-item" key={book.id}>
          <span
            className="leaderboard-rank"
            style={{
              color: getRankColor(idx),
              fontFamily: 'Segoe UI, Arial, sans-serif',
              fontWeight: 500,
              fontSize: '1.2rem',
              letterSpacing: '1px'
            }}
          >
            {idx + 1}
          </span>
          <NovelCard
            cover={book.cover}
            title={book.title}
            category={book.category}
            rating={book.rating}
          />
        </div>
      ))}
    </div>
  </div>
);
export default Leaderboard;
