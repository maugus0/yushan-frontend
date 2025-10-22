// src/pages/cookies/cookies.test.jsx
import { render, screen } from '@testing-library/react';
import CookiePolicy from '../cookies';

describe('CookiePolicy page', () => {
  test('renders main header and updated date', () => {
    const { container } = render(<CookiePolicy />);
    // main heading - select the actual H1 to avoid matching other occurrences of the phrase
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1).toHaveTextContent(/Cookie Policy/i);
    // updated date text - scope to header element to avoid ambiguous matches
    const updated = container.querySelector('.cookies-updated');
    expect(updated).toBeTruthy();
    expect(updated).toHaveTextContent(/Last updated:/i);
    // container sanity
    expect(container.querySelector('.cookies-page')).toBeTruthy();
  });

  test('renders section headings and usage list items', () => {
    render(<CookiePolicy />);
    expect(screen.getByText(/What Are Cookies\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How We Use Cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/Types of Cookies We Use/i)).toBeInTheDocument();
    expect(screen.getByText(/Managing Your Cookie Preferences/i)).toBeInTheDocument();
    // check some list items
    expect(screen.getByText(/Keeping you logged in to your account/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Remembering your reading preferences and settings/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Google Analytics:/i)).toBeInTheDocument();
  });

  test('renders table with expected columns and rows', () => {
    const { container } = render(<CookiePolicy />);
    // AntD Table renders a semantic table
    const table = container.querySelector('table');
    expect(table).toBeTruthy();

    // Check column headers exist (use text)
    const thead = table.querySelector('thead');
    expect(thead).toBeTruthy();
    const headerText = thead.textContent;
    expect(headerText).toMatch(/Cookie Type/i);
    expect(headerText).toMatch(/Purpose/i);
    expect(headerText).toMatch(/Duration/i);
    expect(headerText).toMatch(/Examples/i);

    // Data rows are in tbody
    const tbodyRows = container.querySelectorAll('tbody tr');
    // Expect number of data rows equals 4 (based on component data)
    expect(tbodyRows.length).toBe(4);

    // Validate first row cell contents
    const firstRowCells = tbodyRows[0].querySelectorAll('td');
    // first column: cookie name
    expect(firstRowCells[0].textContent).toContain('Essential Cookies');
    // second column: purpose snippet
    expect(firstRowCells[1].textContent).toMatch(/Authentication, security/i);
    // third column: duration
    expect(firstRowCells[2].textContent).toMatch(/30 days|Session/i);
    // fourth column: examples
    expect(firstRowCells[3].textContent).toMatch(/auth_token|session_id/i);
  });

  test('renders contact information and additional paragraphs', () => {
    render(<CookiePolicy />);
    // Contact email and address present
    expect(screen.getByText(/privacy@yushan.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Yushan Interactive Pte. Ltd., Singapore/i)).toBeInTheDocument();
    // Some paragraph contents
    expect(screen.getByText(/Cookies are small text files/i)).toBeInTheDocument();
    expect(screen.getByText(/We may update this Cookie Policy/i)).toBeInTheDocument();
  });

  test('table elements are queryable via role and snapshot', () => {
    const { container } = render(<CookiePolicy />);
    // role-based table query
    const roleTable = screen.getByRole('table');
    expect(roleTable).toBe(container.querySelector('table'));

    // snapshot to cover rendering markup
    expect(container).toMatchSnapshot();
  });
});

// Mock AntD responsive utilities to avoid runtime errors in JSDOM
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
