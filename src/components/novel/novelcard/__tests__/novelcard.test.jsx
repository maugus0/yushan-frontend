import { render, screen, fireEvent } from '@testing-library/react';
import NovelCard from '../novelcard';
import fallbackImage from '../../../../assets/images/novel_default.png';

afterEach(() => {
  jest.clearAllMocks();
});

describe('NovelCard', () => {
  test('renders title, category, rating and image src when cover provided; onClick fires and cursor is pointer', () => {
    const onClick = jest.fn();
    render(
      <NovelCard
        cover="https://example.test/cover.png"
        title="Test Title"
        category="Fantasy"
        rating={4.5}
        onClick={onClick}
      />
    );

    // title / category / rating text
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();

    // image uses provided cover
    const img = screen.getByAltText('Test Title');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toContain('cover.png');

    // card outer element has class and inline cursor style
    const card = document.querySelector('.novel-card');
    expect(card).toBeTruthy();
    expect(card.style.cursor).toBe('pointer');

    // clicking card invokes handler
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('uses fallback image when cover is falsy', () => {
    render(<NovelCard cover={null} title="No Cover" category="Mystery" rating={3.2} />);

    const img = screen.getByAltText('No Cover');
    expect(img).toBeTruthy();
    // The project asset mock resolves imports to a string; import the same fallback and compare
    expect(img.getAttribute('src')).toBe(fallbackImage);
  });

  test('when no onClick provided cursor is default and hoverable is false', () => {
    render(<NovelCard cover="c.png" title="NC" category="X" rating={1.2} />);

    const card = document.querySelector('.novel-card');
    expect(card).toBeTruthy();
    // inline style set by component should be 'default' when no onClick
    expect(card.style.cursor).toBe('default');
  });
});
