// __tests__/leaderboard.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LeaderboardPage from '../leaderboard';
import rankingsApi from '../../../services/rankings';
import categoriesService from '../../../services/categories';

// Mock child components
jest.mock('../../../components/leaderboard/leaderboard-filters', () => {
  const FiltersMock = (props) => <div data-testid="filters-mock">{props.tab}</div>;
  FiltersMock.displayName = 'FiltersMock';
  return FiltersMock;
});

jest.mock('../../../components/leaderboard/leaderboard-list', () => {
  const ListMock = (props) => (
    <div data-testid="list-mock">
      {props.data.items.length} items - tab: {props.tab}
    </div>
  );
  ListMock.displayName = 'ListMock';
  return ListMock;
});

// Mock API
jest.mock('../../../services/rankings');
jest.mock('../../../services/categories');

describe('LeaderboardPage', () => {
  const mockCategories = [{ id: 1, slug: 'fantasy', name: 'Fantasy' }];
  const mockNovels = [
    { id: 101, title: 'Novel A', categoryId: 1 },
    { id: 102, title: 'Novel B', categoryId: 1 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    categoriesService.getCategories.mockResolvedValue(mockCategories);
    rankingsApi.getNovels.mockResolvedValue({ items: mockNovels, size: 50 });
    rankingsApi.getReaders.mockResolvedValue({ items: [], size: 50 });
    rankingsApi.getWriters.mockResolvedValue({ items: [], size: 50 });
    localStorage.clear();
  });

  it('renders Novels tab with categories and list', async () => {
    render(
      <MemoryRouter initialEntries={['/rankings/Novel']}>
        <LeaderboardPage />
      </MemoryRouter>
    );

    // wait for categories to load
    await waitFor(() => screen.getByTestId('list-mock'));

    // Verify Filters rendering
    expect(screen.getByTestId('filters-mock')).toHaveTextContent('novels');

    // Verify List rendering
    expect(screen.getByTestId('list-mock')).toHaveTextContent('0 items');
    expect(screen.getByTestId('list-mock')).toHaveTextContent('tab: novels');
  });

  it('switches tab to Readers', async () => {
    render(
      <MemoryRouter initialEntries={['/rankings/Novel']}>
        <LeaderboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId('list-mock'));

    // Click Readers tab
    fireEvent.click(screen.getByRole('button', { name: /Readers/i }));

    await waitFor(() => screen.getByTestId('list-mock'));
    expect(screen.getByTestId('list-mock')).toHaveTextContent('tab: users');
  });

  it('switches tab to Writers', async () => {
    render(
      <MemoryRouter initialEntries={['/rankings/Novel']}>
        <LeaderboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId('list-mock'));

    // Click Writers tab
    fireEvent.click(screen.getByRole('button', { name: /Writers/i }));

    await waitFor(() => screen.getByTestId('list-mock'));
    expect(screen.getByTestId('list-mock')).toHaveTextContent('tab: writer');
  });

  it('retry button calls API after error', async () => {
    rankingsApi.getNovels.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/']}>
        <LeaderboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Network error/i));
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Click Retry，API should be called again
    fireEvent.click(retryBtn);
    await waitFor(() => expect(rankingsApi.getNovels).toHaveBeenCalledTimes(2));
  });

  it('selects category "All Novels"', async () => {
    render(
      <MemoryRouter initialEntries={['/rankings/Novel/fantasy']}>
        <LeaderboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId('list-mock'));

    const allBtn = screen.getByRole('button', { name: /All Novels/i });
    fireEvent.click(allBtn);

    await waitFor(() => expect(window.location.pathname).toBe('/'));
  });
});
