import { render, screen, fireEvent } from '@testing-library/react';

// Avoid AntD responsiveObserver/useBreakpoint runtime errors in JSDOM
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

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const real = jest.requireActual('react-router-dom');
  return {
    ...real,
    useNavigate: () => mockNavigate,
  };
});

import Footer from '../footer';

afterEach(() => {
  jest.clearAllMocks();
});

test('renders footer sections, social links and contact info', () => {
  render(<Footer />);

  // company title & description
  expect(screen.getByText('Yushan')).toBeInTheDocument();
  expect(screen.getByText(/A gamified platform where stories come alive/i)).toBeInTheDocument();

  // social links with aria-label and href
  const github = screen.getByLabelText('GitHub');
  expect(github).toBeInTheDocument();
  expect(github.getAttribute('href')).toContain('github.com/maugus0/yushan-frontend');

  const twitter = screen.getByLabelText('Twitter');
  expect(twitter).toBeInTheDocument();
  expect(twitter.getAttribute('href')).toContain('yushan-backend');

  // contact info
  const phoneLink = screen.getByText('+65 8063-6867');
  expect(phoneLink).toBeInTheDocument();
  expect(phoneLink.getAttribute('href')).toBe('tel:+1234567890');

  const mailLink = screen.getByText('support@yushan.com');
  expect(mailLink).toBeInTheDocument();
  expect(mailLink.getAttribute('href')).toBe('mailto:support@yushan.com');

  // resources / discover headings present
  expect(screen.getByText('Discover')).toBeInTheDocument();
  expect(screen.getByText('Resources')).toBeInTheDocument();

  // bottom credit text
  expect(screen.getByText(/Made with/i)).toBeInTheDocument();
});

test('internal quick links and legal links call navigate with correct hrefs', () => {
  render(<Footer />);

  // Quick link: Browse Novels
  const browse = screen.getByText('Browse Novels');
  fireEvent.click(browse);
  expect(mockNavigate).toHaveBeenCalledWith('/browse');

  // Quick link: Home
  const home = screen.getByText('Home');
  fireEvent.click(home);
  expect(mockNavigate).toHaveBeenCalledWith('/');

  // Legal link: Join as Author
  const join = screen.getByText('Join as Author');
  fireEvent.click(join);
  expect(mockNavigate).toHaveBeenCalledWith('/writerdashboard');

  // ensure multiple navigations were recorded
  expect(mockNavigate).toHaveBeenCalledTimes(3);
});

test('renders current year copyright string', () => {
  const year = new Date().getFullYear();
  render(<Footer />);
  expect(screen.getByText(new RegExp(`© ${year} Yushan`, 'i'))).toBeInTheDocument();
});
