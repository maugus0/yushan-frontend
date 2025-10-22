import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '../herosection';

describe('HeroSection', () => {
  const sampleData = [
    { title: 'One', desc: 'First item', img: 'one.png' },
    { title: 'Two', desc: 'Second item', img: 'two.png' },
  ];

  test('renders default title and list items', () => {
    render(<HeroSection data={sampleData} />);
    expect(screen.getByText('Meet Webnovel')).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByAltText('One')).toHaveAttribute('src', 'one.png');
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByAltText('Two')).toHaveAttribute('src', 'two.png');

    // each item renders the divider (component uses idx < data.length)
    const itemDividers = document.querySelectorAll('.hero-section-item-divider');
    expect(itemDividers.length).toBe(sampleData.length);
  });

  test('accepts custom title', () => {
    render(<HeroSection data={[]} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('calls onItemClick with item and index when clicked and sets pointer cursor', () => {
    const onItemClick = jest.fn();
    const { container } = render(<HeroSection data={sampleData} onItemClick={onItemClick} />);
    const items = container.querySelectorAll('.hero-section-item');
    expect(items.length).toBe(2);

    // pointer cursor applied when onItemClick provided
    expect(items[0].style.cursor).toBe('pointer');

    fireEvent.click(items[1]);
    expect(onItemClick).toHaveBeenCalledWith(sampleData[1], 1);
  });

  test('uses default cursor when onItemClick is not provided', () => {
    const { container } = render(<HeroSection data={sampleData} />);
    const items = container.querySelectorAll('.hero-section-item');
    expect(items[0].style.cursor).toBe('default');
  });

  test('renders nothing (no crash) when data is undefined or empty', () => {
    const { rerender } = render(<HeroSection data={undefined} />);
    // container should render root structure but no items
    expect(document.querySelectorAll('.hero-section-item').length).toBe(0);

    rerender(<HeroSection data={[]} />);
    expect(document.querySelectorAll('.hero-section-item').length).toBe(0);
  });
});
