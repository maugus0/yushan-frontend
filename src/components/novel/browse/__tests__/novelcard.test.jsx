import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock fallback image import used in component
jest.mock('../../../assets/images/novel_default.png', () => 'fallback.png', { virtual: true });

import NovelCard from '../novelcard';

afterEach(() => {
  jest.clearAllMocks();
});

describe('NovelCard', () => {
  const baseNovel = {
    id: 'n1',
    title: 'My Book',
    author: 'Auth',
    cover: 'cover.png',
    genres: ['A', 'B', 'C', 'D'],
    status: 'Ongoing',
    description: 'x'.repeat(200),
    stats: { chapters: 12, popularity: 1234, rating: 4.23 },
  };

  test('renders cover, title, author and stats; trims description in list view', () => {
    const onClick = jest.fn();
    const { container } = render(<NovelCard novel={baseNovel} viewMode="list" onClick={onClick} />);

    // Title, author and stats
    expect(screen.getByText('My Book')).toBeInTheDocument();
    expect(screen.getByText('Auth')).toBeInTheDocument();
    expect(container.querySelector('.browse-card__stats')).toBeInTheDocument();

    // description truncated
    const desc = container.querySelector('.browse-card__desc');
    expect(desc).toBeTruthy();
    expect(desc.textContent.length).toBeLessThan(200);

    // tags show top 3 and +1 overflow badge
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  test('uses fallback image when cover missing or on error', async () => {
    const onClick = jest.fn();
    const n = { ...baseNovel, cover: null, id: 'n2' };
    const { container } = render(<NovelCard novel={n} viewMode="grid" onClick={onClick} />);
    const img = container.querySelector('img');
    // initially uses fallback since cover null
    expect(img.getAttribute('src')).toContain('fallback.png');

    // when cover present but img error occurs, src switches to fallback
    const n2 = { ...baseNovel, cover: 'good.png', id: 'n3' };
    const { container: c2 } = render(<NovelCard novel={n2} viewMode="grid" onClick={onClick} />);
    const img2 = c2.querySelector('img');
    // simulate error
    fireEvent.error(img2);
    await waitFor(() => {
      expect(img2.getAttribute('src')).toContain('fallback.png');
    });
  });

  test('keyboard Enter triggers onClick', () => {
    const onClick = jest.fn();
    const { container } = render(<NovelCard novel={baseNovel} viewMode="grid" onClick={onClick} />);
    const article = container.querySelector('[role="article"]');
    fireEvent.keyDown(article, { key: 'Enter', code: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(baseNovel);
  });

  test('clicking card calls onClick with novel', () => {
    const onClick = jest.fn();
    const { container } = render(<NovelCard novel={baseNovel} viewMode="grid" onClick={onClick} />);
    fireEvent.click(container.querySelector('[role="article"]'));
    expect(onClick).toHaveBeenCalledWith(baseNovel);
  });
});
