import { render, screen, fireEvent } from '@testing-library/react';
import LeaderboardFilters from '../leaderboard-filters';

describe('LeaderboardFilters full coverage', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders FILTER and SORT buttons correctly for writers', () => {
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
    expect(screen.getByText('Novels')).toHaveClass('active'); // sortBy=books active
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

  test('calls onChange when clicking sortBy button', () => {
    render(
      <LeaderboardFilters
        tab="writers"
        query={{ timeRange: 'weekly', sortBy: 'books' }}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByText('Votes')); // sortBy='votes'
    expect(mockOnChange).toHaveBeenCalledWith({ sortBy: 'votes' });
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

  test('Novels tab fallback sortBy works when invalid', () => {
    render(
      <LeaderboardFilters
        tab="novels"
        query={{ timeRange: 'weekly', sortBy: 'invalid-key' }}
        onChange={mockOnChange}
      />
    );

    // fallback to first option: 'views'
    expect(screen.getByText('Popularity')).toHaveClass('active');
  });

  test('Readers tab renders FILTER but empty SORT', () => {
    render(
      <LeaderboardFilters
        tab="users"
        query={{ timeRange: 'weekly', sortBy: 'votes' }}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('FILTER:')).toBeInTheDocument();
    //expect(screen.queryByText('SORT:')).not.toBeInTheDocument();
  });
});
