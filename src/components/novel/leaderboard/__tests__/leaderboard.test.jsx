import { render, screen, cleanup } from '@testing-library/react';
import Leaderboard from '../leaderboard';

// Mock NovelCard so tests focus on Leaderboard behaviour and props passed down.
// The mock renders data attributes we can assert on.
jest.mock('../../novelcard/novelcard', () => {
  return {
    __esModule: true,
    default: ({ cover, title, category, rating }) => (
      <div
        data-testid="mock-novelcard"
        data-cover={cover}
        data-title={title}
        data-category={category}
        data-rating={rating}
      />
    ),
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('Leaderboard component', () => {
  test('renders header and MORE button', () => {
    render(<Leaderboard />);
    expect(screen.getByText('Top Fanfic Books')).toBeInTheDocument();
    expect(screen.getByText('MORE')).toBeInTheDocument();
  });

  test('renders no items when data is empty', () => {
    render(<Leaderboard data={[]} />);
    expect(screen.queryAllByTestId('mock-novelcard').length).toBe(0);
  });

  test('renders list items and passes correct props to NovelCard; rank colors match mapping', () => {
    const sample = [
      { id: 'a', cover: 'c1.png', title: 'Book One', category: 'Fantasy', rating: 4.5 },
      { id: 'b', cover: 'c2.png', title: 'Book Two', category: 'Sci-Fi', rating: 4.2 },
      { id: 'c', cover: 'c3.png', title: 'Book Three', category: 'Mystery', rating: 4.1 },
      { id: 'd', cover: 'c4.png', title: 'Book Four', category: 'Romance', rating: 3.9 },
    ];

    const { container } = render(<Leaderboard data={sample} />);

    // verify number of rendered NovelCard mocks
    const cards = screen.getAllByTestId('mock-novelcard');
    expect(cards.length).toBe(sample.length);

    // verify props forwarded to mock by checking data attributes
    sample.forEach((book, idx) => {
      const card = cards[idx];
      expect(card.getAttribute('data-title')).toBe(book.title);
      expect(card.getAttribute('data-cover')).toBe(book.cover);
      expect(card.getAttribute('data-category')).toBe(book.category);
      expect(card.getAttribute('data-rating')).toBe(String(book.rating));
    });

    // helper replicating leaderboard's rank color mapping (compare computed RGB)
    const expectedColor = (i) => {
      if (i === 0) return 'rgb(231, 76, 60)'; // #e74c3c
      if (i === 1) return 'rgb(250, 173, 20)'; // #faad14
      if (i === 2) return 'rgb(82, 196, 26)'; // #52c41a
      return 'rgb(136, 136, 136)'; // #888
    };

    const rankEls = container.querySelectorAll('.leaderboard-rank');
    expect(rankEls.length).toBe(sample.length);

    // verify rank numbers and inline color styles
    rankEls.forEach((el, i) => {
      expect(el.textContent.trim()).toBe(String(i + 1));
      const color = window.getComputedStyle(el).color;
      expect(color).toBe(expectedColor(i));
    });
  });
});
