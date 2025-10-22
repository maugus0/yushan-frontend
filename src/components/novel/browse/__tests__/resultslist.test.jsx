import { render, screen, fireEvent } from '@testing-library/react';

// Mock react-router useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock NovelCard to keep tests focused on ResultsList behaviour
jest.mock('../novelcard', () => ({
  __esModule: true,
  default: ({ novel, viewMode, onClick }) => (
    <div data-testid="mock-novelcard" data-mode={viewMode} onClick={() => onClick(novel)}>
      {novel.title}
    </div>
  ),
}));

import ResultsList from '../resultslist';

afterEach(() => {
  jest.clearAllMocks();
});

describe('ResultsList', () => {
  test('renders loading state', () => {
    const { container } = render(
      <ResultsList novels={[]} loading={true} error={null} viewMode="grid" onRetry={jest.fn()} />
    );
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    expect(screen.getByText(/Loading novels/i)).toBeInTheDocument();
  });

  test('renders error and retry button calls onRetry', async () => {
    const onRetry = jest.fn();
    render(
      <ResultsList novels={[]} loading={false} error="Boom" viewMode="grid" onRetry={onRetry} />
    );
    // Antd Alert plus wrapper both have role="alert" -> assert there is at least one
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
    const retry = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalled();
  });

  test('renders empty state when no novels', () => {
    render(
      <ResultsList novels={[]} loading={false} error={null} viewMode="grid" onRetry={jest.fn()} />
    );
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });

  test('renders list of novels and navigates on item click; respects viewMode class', async () => {
    const novels = [
      { id: '1', title: 'A', cover: 'c1' },
      { id: '2', title: 'B', cover: 'c2' },
    ];
    const { container, rerender } = render(
      <ResultsList
        novels={novels}
        loading={false}
        error={null}
        viewMode="grid"
        onRetry={jest.fn()}
      />
    );

    // grid view container class
    expect(container.querySelector('.novel-grid')).toBeInTheDocument();

    const items = screen.getAllByTestId('mock-novelcard');
    expect(items.length).toBe(2);

    // click first item -> navigate called with state
    fireEvent.click(items[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/novel/1', { state: { from: '/browse' } });

    // switch to list view
    rerender(
      <ResultsList
        novels={novels}
        loading={false}
        error={null}
        viewMode="list"
        onRetry={jest.fn()}
      />
    );
    expect(container.querySelector('.novel-list')).toBeInTheDocument();
  });
});
