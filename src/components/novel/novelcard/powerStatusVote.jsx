import { Button } from 'antd';
import { TrophyOutlined, StarOutlined } from '@ant-design/icons';
import './powerStatusVote.css';

const PowerStatusVote = ({ ranking, votesLeft }) => {
  return (
    <div className="power-status-vote">
      <div className="vote-item" style={{ marginRight: '30px' }}>
        {' '}
        {/* Adjusted margin */}
        <TrophyOutlined style={{ color: 'red' }} />
        <span className="vote-number">NO. {ranking}</span>
        <span className="vote-description">Power Ranking</span>
      </div>
      <div className="vote-item">
        <StarOutlined style={{ color: '#6a5acd' }} />
        <span className="vote-number">{votesLeft}</span>
        <span className="vote-description">Power Stone</span>
      </div>
      <div className="vote-button-container">
        {' '}
        {/* Added container for button */}
        <Button type="primary" className="vote-button">
          <span className="vote-button-title">VOTE</span>
          <span className="vote-left">{votesLeft} POWER STONE LEFT</span>
        </Button>
      </div>
    </div>
  );
};

export default PowerStatusVote;
