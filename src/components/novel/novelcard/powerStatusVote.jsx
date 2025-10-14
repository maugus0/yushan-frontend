import { Button } from 'antd';
import { TrophyOutlined, StarOutlined } from '@ant-design/icons';
import './powerStatusVote.css';

const PowerStatusVote = ({
  ranking,
  voteCount = 0,
  votesLeft = 0,
  onVote,
  loading = false,
  disableVote = false,
  rankType = 'Vote Ranking',
}) => {
  return (
    <div className="power-status-vote">
      <div className="vote-item" style={{ marginRight: '30px' }}>
        <TrophyOutlined style={{ color: 'red' }} />
        <span className="vote-number">NO. {ranking ?? '-'}</span>
        <span className="vote-description">{rankType}</span>
      </div>
      <div className="vote-item">
        <StarOutlined style={{ color: '#6a5acd' }} />
        <span className="vote-number">{voteCount ?? 0}</span>
        <span className="vote-description">Votes</span>
      </div>
      <div className="vote-button-container">
        <Button
          type="primary"
          className="vote-button"
          onClick={onVote}
          loading={loading}
          disabled={disableVote || votesLeft <= 0}
          style={{
            backgroundColor: disableVote || votesLeft <= 0 ? '#ccc' : 'orange',
            borderColor: disableVote || votesLeft <= 0 ? '#ccc' : 'orange',
            color: 'white',
            cursor: disableVote || votesLeft <= 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <span className="vote-button-title">VOTE</span>
          <span className="vote-left">{votesLeft ?? 0} YUAN LEFT</span>
        </Button>
      </div>
    </div>
  );
};

export default PowerStatusVote;
