import { render } from '@testing-library/react';
import { MaleIcon, FemaleIcon } from '../gendericon';

describe('Gender icons', () => {
  test('MaleIcon renders svg with correct default size and fill color', () => {
    const { container } = render(<MaleIcon />);
    const svg = container.querySelector('svg');
    const path = container.querySelector('path');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
    expect(path.getAttribute('fill')).toBe('#14BCD0');
  });

  test('FemaleIcon accepts size/style props and has expected fill', () => {
    const { container } = render(
      <FemaleIcon width={40} height={40} style={{ transform: 'rotate(1deg)' }} />
    );
    const svg = container.querySelector('svg');
    const path = container.querySelector('path');
    expect(svg.getAttribute('width')).toBe('40');
    expect(svg.getAttribute('height')).toBe('40');
    // style propagated
    expect(svg.style.transform).toContain('rotate');
    expect(path.getAttribute('fill')).toBe('#D01484');
  });
});
