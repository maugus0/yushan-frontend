import { render, screen } from '@testing-library/react';

// Mock AntD responsive utilities (prevent responsiveObserver errors in JSDOM)
jest.mock('antd/lib/grid/hooks/useBreakpoint', () => () => ({
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  xxl: true,
}));
jest.mock('antd/lib/_util/responsiveObserver', () => ({
  __esModule: true,
  default: () => ({
    subscribe: (listener) => {
      try {
        listener({ xs: true, sm: true, md: true, lg: true, xl: true, xxl: true });
      } catch (e) {
        void e;
      }
      return () => {};
    },
    unsubscribe: () => {},
    dispatch: () => {},
  }),
}));

import TermsOfService from '../terms';

describe('TermsOfService page', () => {
  test('renders main title and updated date', () => {
    const { container } = render(<TermsOfService />);
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1).toHaveTextContent(/Terms of Service/i);

    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
    expect(container.querySelector('.terms-page')).toBeTruthy();
  });

  test('renders all 10 section headings (h2) and main paragraphs', () => {
    const { container } = render(<TermsOfService />);
    // Section headings are rendered as h2 (10 sections in the component)
    const h2s = container.querySelectorAll('h2');
    expect(h2s.length).toBeGreaterThanOrEqual(10);

    // Spot-check some paragraph content
    expect(
      screen.getByText(/Yushan is a gamified platform for reading and writing web novels/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Users are responsible for the content they post/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /These terms shall be interpreted and governed in accordance with the laws of Singapore/i
      )
    ).toBeInTheDocument();
  });

  test('renders contact information and address', () => {
    render(<TermsOfService />);
    expect(screen.getByText(/support@yushan.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Yushan Interactive Pte. Ltd., Singapore/i)).toBeInTheDocument();
  });

  test('matches snapshot structure', () => {
    const { container } = render(<TermsOfService />);
    expect(container).toMatchSnapshot();
  });
});
