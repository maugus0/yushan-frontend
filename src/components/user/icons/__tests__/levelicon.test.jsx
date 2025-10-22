import { render } from '@testing-library/react';
import { LevelIcon1, LevelIcon2, LevelIcon3, LevelIcon4, LevelIcon5 } from '../levelicon';

describe('LevelIcon components', () => {
  test('LevelIcon1 renders an svg with default size and expected fill', () => {
    const { container } = render(<LevelIcon1 />);
    const svg = container.querySelector('svg');
    const path = container.querySelector('path');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
    expect(path.getAttribute('fill')).toBe('#BFBFBF');
  });

  test('LevelIcon2 accepts width/height/style props and has its fill', () => {
    const { container } = render(<LevelIcon2 width={32} height={32} style={{ opacity: 0.5 }} />);
    const svg = container.querySelector('svg');
    const path = container.querySelector('path');
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
    // style object rendered to element.style — verify opacity
    expect(svg.style.opacity).toBe('0.5');
    expect(path.getAttribute('fill')).toBe('#95DDB2');
  });

  test('Other LevelIcon exports render and have svg elements', () => {
    const all = [LevelIcon3, LevelIcon4, LevelIcon5];
    all.forEach((Comp) => {
      const { container } = render(<Comp />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });
});
