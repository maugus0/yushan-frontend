import { render, screen, fireEvent } from '@testing-library/react';
import LeaderboardFilters from '../leaderboard-filters';

describe('LeaderboardFilters', () => {
  const mockOnChange = jest.fn();

  test('renders FILTER and SORT buttons correctly', () => {
    render(
      <LeaderboardFilters
        tab="writers"
        query={{ timeRange: 'weekly', sortBy: 'books' }}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('FILTER:')).toBeInTheDocument();
    expect(screen.getByText('SORT:')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toHaveClass('active');
  });

  test('calls onChange when clicking timeRange button', () => {
    render(
      <LeaderboardFilters
        tab="writers"
        query={{ timeRange: 'weekly', sortBy: 'books' }}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByText('Monthly'));
    expect(mockOnChange).toHaveBeenCalledWith({ timeRange: 'monthly' });
  });

  test('hides sort section when hideSort = true', () => {
    render(
      <LeaderboardFilters
        tab="users"
        query={{ timeRange: 'weekly' }}
        onChange={mockOnChange}
        hideSort
      />
    );

    expect(screen.queryByText('SORT:')).not.toBeInTheDocument();
  });
});
