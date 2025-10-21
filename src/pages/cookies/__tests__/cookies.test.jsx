import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CookiePolicy from '../cookies';

describe('CookiePolicy Component', () => {
  beforeAll(() => {
    // Mock window.matchMedia for Ant Design components
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });
  // Mock window.ResizeObserver
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = () => {
  return render(<CookiePolicy />);
};

// Test 1: Renders main title and last updated date
test('renders page title and last updated date', () => {
  renderComponent();
  expect(
    screen.getByRole('heading', { name: 'Cookie Policy', level: 1 })
  ).toBeInTheDocument();

  expect(screen.getByText(/Last updated: October 12, 2025/i)).toBeInTheDocument();
});

// Test 2: Renders all section headings
test('renders all major section headings', () => {
  renderComponent();

  const expectedHeadings = [
    'What Are Cookies?',
    'How We Use Cookies',
    'Types of Cookies We Use',
    'Managing Your Cookie Preferences',
    'Essential Cookies',
    'Third-Party Cookies',
    'Updates to This Policy',
    'Contact Us',
  ];

  expectedHeadings.forEach((heading) => {
    expect(
      screen.getByRole('heading', { name: heading, level: 2 })
    ).toBeInTheDocument();
  });
});

// Test 3: Renders "What Are Cookies?" section content
test('renders "What Are Cookies?" section with correct description', () => {
  renderComponent();

  expect(
    screen.getByText(/Cookies are small text files that are stored on your device/i)
  ).toBeInTheDocument();
});

// Test 4: Renders "How We Use Cookies" list items
test('renders all items in "How We Use Cookies" list', () => {
  renderComponent();

  expect(screen.getByText(/Keeping you logged in to your account/i)).toBeInTheDocument();
  expect(screen.getByText(/Remembering your reading preferences and settings/i)).toBeInTheDocument();
  expect(screen.getByText(/Analyzing site traffic and user behavior/i)).toBeInTheDocument();
  expect(screen.getByText(/Personalizing content and recommendations/i)).toBeInTheDocument();
  expect(screen.getByText(/Improving our services and user experience/i)).toBeInTheDocument();
});

// Test 5: Renders cookie types table with all cookie types
test('renders cookie types table with all cookie types', () => {
  renderComponent();

  const table = screen.getByRole('table');

  expect(within(table).getByText('Essential Cookies')).toBeInTheDocument();
  expect(within(table).getByText('Analytics Cookies')).toBeInTheDocument();
  expect(within(table).getByText('Preference Cookies')).toBeInTheDocument();
  expect(within(table).getByText('Marketing Cookies')).toBeInTheDocument();
});

// Test 6: Renders table column headers
test('renders table with correct column headers', () => {
  renderComponent();

  expect(screen.getByText('Cookie Type')).toBeInTheDocument();
  expect(screen.getByText('Purpose')).toBeInTheDocument();
  expect(screen.getByText('Duration')).toBeInTheDocument();
  expect(screen.getByText('Examples')).toBeInTheDocument();
});

// Test 7: Renders Essential Cookies details
test('renders Essential Cookies information in the table', () => {
  renderComponent();

  expect(screen.getByText(/Authentication, security, and basic site functionality/i)).toBeInTheDocument();
  expect(screen.getByText(/Session\/30 days/i)).toBeInTheDocument();
  expect(screen.getByText(/auth_token, session_id/i)).toBeInTheDocument();
});

// Test 8: Renders Analytics Cookies details
test('renders Analytics Cookies information in the table', () => {
  renderComponent();

  expect(screen.getByText(/Understanding how users interact with our platform/i)).toBeInTheDocument();
  expect(screen.getByText('2 years')).toBeInTheDocument();
  expect(screen.getByText(/Google Analytics cookies/i)).toBeInTheDocument();
});

// Test 9: Renders Preference Cookies details
test('renders Preference Cookies information in the table', () => {
  renderComponent();

  expect(screen.getByText(/Remembering user settings and preferences/i)).toBeInTheDocument();
  expect(screen.getByText('1 year')).toBeInTheDocument();
  expect(screen.getByText(/theme_preference, language_setting/i)).toBeInTheDocument();
});

// Test 10: Renders Marketing Cookies details
test('renders Marketing Cookies information in the table', () => {
  renderComponent();

  expect(screen.getByText(/Delivering relevant advertisements and tracking campaigns/i)).toBeInTheDocument();
  expect(screen.getByText('90 days')).toBeInTheDocument();
  expect(screen.getByText(/ad_tracking, campaign_source/i)).toBeInTheDocument();
});

// Test 11: Renders "Managing Your Cookie Preferences" content
test('renders cookie management options', () => {
  renderComponent();

  expect(screen.getByText(/Browser Settings:/i)).toBeInTheDocument();
  expect(screen.getByText(/Most browsers allow you to view, manage/i)).toBeInTheDocument();
  expect(screen.getByText(/Opt-out Tools:/i)).toBeInTheDocument();
  expect(screen.getByText(/Do Not Track:/i)).toBeInTheDocument();
});

// Test 12: Renders "Essential Cookies" section
test('renders essential cookies explanation', () => {
  renderComponent();

  expect(
    screen.getByText(/Some cookies are essential for our website to function properly/i)
  ).toBeInTheDocument();
});

// Test 13: Renders "Third-Party Cookies" section with services
test('renders third-party cookies information', () => {
  renderComponent();

  expect(screen.getByText(/Google Analytics:/i)).toBeInTheDocument();
  expect(screen.getByText(/For website analytics and performance monitoring/i)).toBeInTheDocument();
  expect(screen.getByText(/Social Media:/i)).toBeInTheDocument();
  expect(screen.getByText(/For social sharing functionality/i)).toBeInTheDocument();
  expect(screen.getByText(/Content Delivery Networks:/i)).toBeInTheDocument();
  expect(screen.getByText(/For faster content delivery/i)).toBeInTheDocument();
});

// Test 14: Renders "Updates to This Policy" section
test('renders policy updates information', () => {
  renderComponent();

  expect(
    screen.getByText(/We may update this Cookie Policy from time to time/i)
  ).toBeInTheDocument();
});

// Test 15: Renders contact information
test('renders contact information in "Contact Us" section', () => {
  renderComponent();

  expect(screen.getByText(/If you have any questions about our use of cookies/i)).toBeInTheDocument();
  expect(screen.getByText(/Email:/i)).toBeInTheDocument();
  expect(screen.getByText(/privacy@yushan.com/i)).toBeInTheDocument();
  expect(screen.getByText(/Address:/i)).toBeInTheDocument();
  expect(screen.getByText(/Yushan Interactive Pte. Ltd., Singapore/i)).toBeInTheDocument();
});

// Test 16: Verifies table structure
test('renders table with correct structure', () => {
  renderComponent();

  const table = screen.getByRole('table');
  expect(table).toBeInTheDocument();

  // Verify all 4 cookie types are present
  const cookieTypes = ['Essential Cookies', 'Analytics Cookies', 'Preference Cookies', 'Marketing Cookies'];
  cookieTypes.forEach((type) => {
    expect(screen.getByText(type)).toBeInTheDocument();
  });
});

// Test 17: Checks component structure with CSS classes
test('renders with proper container structure', () => {
  const { container } = renderComponent();

  expect(container.querySelector('.cookies-page')).toBeInTheDocument();
  expect(container.querySelector('.cookies-container')).toBeInTheDocument();
  expect(container.querySelector('.cookies-card')).toBeInTheDocument();
});

// Test 18: Verifies content sections exist
test('renders all content sections', () => {
  const { container } = renderComponent();

  expect(container.querySelector('.cookies-header')).toBeInTheDocument();
  expect(container.querySelector('.cookies-content')).toBeInTheDocument();
});