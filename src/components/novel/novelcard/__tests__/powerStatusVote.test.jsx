// PowerStatusVote.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import PowerStatusVote from '../powerStatusVote';

describe('PowerStatusVote Component', () => {
  const defaultProps = {
    ranking: 5,
    voteCount: 10,
    votesLeft: 3,
    onVote: jest.fn(),
    loading: false,
    disableVote: false,
    rankType: 'Vote Ranking',
    message: '',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders ranking correctly', () => {
    render(<PowerStatusVote {...defaultProps} />);
    expect(screen.getByText(/NO. 5/i)).toBeInTheDocument();
  });

  test('displays 100+ if message indicates not in top 100', () => {
    render(
      <PowerStatusVote
        {...defaultProps}
        ranking={null}
        message="Novel is not in the top 100 for this ranking."
      />
    );
    expect(screen.getByText(/NO. 100\+/i)).toBeInTheDocument();
  });

  test('displays "-" if ranking is null and message is not top 100', () => {
    render(<PowerStatusVote {...defaultProps} ranking={null} />);
    expect(screen.getByText(/NO. -/i)).toBeInTheDocument();
  });

  test('renders vote count and votes left correctly', () => {
    render(<PowerStatusVote {...defaultProps} />);
    expect(screen.getByText(/10/i)).toBeInTheDocument();
    expect(screen.getByText(/3 YUAN LEFT/i)).toBeInTheDocument();
  });

  test('renders default values if voteCount or votesLeft not provided', () => {
    render(<PowerStatusVote ranking={1} onVote={() => {}} />);

    expect(screen.getByText('0', { selector: '.vote-number' })).toBeInTheDocument();

    expect(screen.getByText(/0 YUAN LEFT/i)).toBeInTheDocument();

    expect(screen.getByText(/Vote Ranking/i)).toBeInTheDocument();
  });

  test('button calls onVote when clicked', () => {
    render(<PowerStatusVote {...defaultProps} />);
    const button = screen.getByRole('button', { name: /VOTE/i });
    fireEvent.click(button);
    expect(defaultProps.onVote).toHaveBeenCalledTimes(1);
  });

  test('button is disabled if disableVote is true', () => {
    render(<PowerStatusVote {...defaultProps} disableVote={true} />);
    const button = screen.getByRole('button', { name: /VOTE/i });
    expect(button).toBeDisabled();
  });

  test('button is disabled if votesLeft is 0', () => {
    render(<PowerStatusVote {...defaultProps} votesLeft={0} />);
    const button = screen.getByRole('button', { name: /VOTE/i });
    expect(button).toBeDisabled();
  });

  test('button shows loading state', () => {
    render(<PowerStatusVote {...defaultProps} loading={true} />);
    const button = screen.getByRole('button', { name: /VOTE/i });

    expect(button).toHaveClass('ant-btn-loading');
  });
});
