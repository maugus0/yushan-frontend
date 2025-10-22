import { render } from '@testing-library/react';
import { WriterIcon } from '../userrolesicon';

describe('WriterIcon', () => {
  test('renders svg and exposes width/height/style props', () => {
    const { container } = render(
      <WriterIcon width={48} height={48} style={{ marginLeft: '8px' }} />
    );
    const svg = container.querySelector('svg');
    const firstPath = container.querySelector('path');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('48');
    expect(svg.getAttribute('height')).toBe('48');
    expect(svg.style.marginLeft).toBe('8px');
    // verify one of the fill colors used in the component
    expect(firstPath.getAttribute('fill')).toBe('#FEC9A3');
  });

  test('renders without props (defaults)', () => {
    const { container } = render(<WriterIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });
});
