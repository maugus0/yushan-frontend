import { render, screen, fireEvent } from '@testing-library/react';
import FeatureNovels from '../featurenovels';
import fallbackImage from '../../../assets/images/novel_default.png';

describe('FeatureNovels', () => {
  test('renders default title and no cards when novels empty', () => {
    const onNovelClick = jest.fn();
    const { container } = render(<FeatureNovels novels={[]} onNovelClick={onNovelClick} />);
    expect(screen.getByText('Featured Novels')).toBeInTheDocument();
    // list exists but no cards
    expect(container.querySelectorAll('.feature-novel-card').length).toBe(0);
  });

  test('renders custom title and novel items', () => {
    const novels = [
      { id: '1', cover: 'cover1.png', title: 'Book 1', category: 'Fantasy' },
      { id: '2', cover: 'cover2.png', title: 'Book 2', category: 'Sci-Fi' },
    ];
    render(<FeatureNovels title="Top Picks" novels={novels} />);
    expect(screen.getByText('Top Picks')).toBeInTheDocument();

    // both titles and categories rendered
    expect(screen.getByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();

    // number of cards equals novels length
    const cards = document.querySelectorAll('.feature-novel-card');
    expect(cards.length).toBe(2);
  });

  test('clicking card calls onNovelClick and cursor/style behaviors', () => {
    const novels = [{ id: '1', cover: 'c.png', title: 'Book', category: 'X' }];
    const onNovelClick = jest.fn();
    render(<FeatureNovels novels={novels} onNovelClick={onNovelClick} />);

    const card = document.querySelector('.feature-novel-card');
    expect(card.style.cursor).toBe('pointer');

    // click triggers callback with novel object
    fireEvent.click(card);
    expect(onNovelClick).toHaveBeenCalledWith(novels[0]);

    // mouse enter/leave adjusts transform style
    fireEvent.mouseEnter(card);
    expect(card.style.transform).toBe('translateY(-4px)');
    fireEvent.mouseLeave(card);
    expect(card.style.transform).toBe('translateY(0)');
  });

  test('when no onNovelClick provided cursor is default and hover does not transform', () => {
    const novels = [{ id: '1', cover: 'c.png', title: 'Book', category: 'X' }];
    render(<FeatureNovels novels={novels} />);

    const card = document.querySelector('.feature-novel-card');
    expect(card.style.cursor).toBe('default');

    fireEvent.mouseEnter(card);
    // since no onNovelClick, transform should not be applied
    expect(card.style.transform).toBe('');
  });

  test('image onError sets src to fallback image', () => {
    const novels = [{ id: '1', cover: 'bad.png', title: 'Broken', category: 'Y' }];
    render(<FeatureNovels novels={novels} />);
    const img = document.querySelector('.feature-novel-cover');
    // initial src attribute should be the provided cover
    expect(img.getAttribute('src')).toContain('bad.png');

    // simulate image loading error; handler will replace src with fallback
    fireEvent.error(img);
    // getAttribute should now reference the mocked fallback import
    expect(img.getAttribute('src')).toBe(fallbackImage);
  });

  test('image error does not infinite-loop when already fallback', () => {
    const novels = [{ id: '1', cover: fallbackImage, title: 'AlreadyFallback', category: 'Z' }];
    render(<FeatureNovels novels={novels} />);
    const img = document.querySelector('.feature-novel-cover');
    // simulate error when src already equals fallback; handler should not change it
    fireEvent.error(img);
    expect(img.getAttribute('src')).toBe(fallbackImage);
  });
});
