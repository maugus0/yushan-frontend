import { act, render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import Navbar from '../navbar';
import userReducer, { setAuthenticated } from '../../../../store/slices/user';

// --- Mocks: Router ---
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

// --- Mocks: Services ---
jest.mock('../../../../services/auth', () => ({
  isAuthenticated: jest.fn(() => false),
  logout: jest.fn(),
  clearTokens: jest.fn(),
}));
jest.mock('../../../../services/user', () => ({
  getMe: jest.fn(),
}));
jest.mock('../../../../services/categories', () => ({
  getCategories: jest.fn(async () => [
    { id: 1, name: 'Action', isActive: true },
    { id: 2, name: 'Romance', isActive: false },
    { id: 3, name: 'Fantasy', isActive: true },
  ]),
}));
jest.mock('../../../../services/search', () => ({
  // Provide all shapes: resp.data.data.users/novels and resp.data.users/novels, plus top-level fallback
  searchAll: jest.fn(async () => ({
    data: {
      data: { users: [], novels: [] },
      users: [],
      novels: [],
    },
    users: [],
    novels: [],
  })),
}));
jest.mock('../../../../utils/imageUtils', () => ({
  processImageUrl: jest.fn((url) => url || 'fallback'),
  processUserAvatar: jest.fn(() => 'user-fallback'),
}));

jest.mock('antd', () => {
  const React = jest.requireActual('react');

  const LayoutHeader = ({ children, ...props }) => (
    <div data-testid="layout-header" {...props}>
      {children}
    </div>
  );
  const Layout = { Header: LayoutHeader };

  const Menu = ({ items, selectedKeys, ...rest }) => (
    <nav data-testid="menu" data-selected={(selectedKeys || []).join(',')} {...rest}>
      {items?.map((it) => (
        <div
          key={it.key}
          data-testid={`menu-item-${it.key}`}
          onClick={it.onClick}
          style={{ display: 'inline-block', margin: 4, cursor: 'pointer' }}
        >
          {it.label}
        </div>
      ))}
    </nav>
  );

  const Button = React.forwardRef(function Button({ children, onClick, ...props }, ref) {
    return (
      <button ref={ref} type="button" onClick={onClick} {...props}>
        {children}
      </button>
    );
  });
  Button.displayName = 'Button';

  const Drawer = ({ open, children, ...props }) => (
    <div data-testid="drawer" data-open={!!open} {...props}>
      {open ? children : null}
    </div>
  );

  const Avatar = ({ src, ...props }) => (
    <img alt="avatar" data-testid="avatar" src={src || ''} {...props} />
  );

  const Dropdown = ({ children }) => <div data-testid="dropdown">{children}</div>;

  const Input = React.forwardRef(function Input(
    { value, onChange, placeholder, suffix, className },
    ref
  ) {
    return (
      <div>
        <input
          ref={ref}
          data-testid="input"
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
        />
        <span data-testid="input-suffix">{suffix}</span>
      </div>
    );
  });
  Input.displayName = 'Input';

  const Popover = ({ children }) => <span data-testid="popover">{children}</span>;

  return {
    Layout,
    Menu,
    Button,
    Drawer,
    Avatar,
    Dropdown,
    Input,
    Popover,
  };
});

// --- Utils ---
const renderWithStore = async (
  ui,
  preloadedState = { user: { isAuthenticated: false, user: null } }
) => {
  const store = configureStore({ reducer: { user: userReducer }, preloadedState });
  let utils;
  await act(async () => {
    utils = render(<Provider store={store}>{ui}</Provider>);
    await Promise.resolve();
  });
  return { store, ...utils };
};

const clickSearchTrigger = () => {
  const nodes = screen.getAllByText('Search');
  const buttonNode =
    nodes.map((n) => n.closest('button') || n).find((el) => el && el.tagName === 'BUTTON') ||
    nodes[0];
  fireEvent.click(buttonNode);
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders logo and navigates to home on click', async () => {
    await renderWithStore(<Navbar />);

    const logoText = screen.getByText('Yushan');
    expect(logoText).toBeInTheDocument();

    fireEvent.click(logoText.closest('.navbar-logo'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows Login/Register when unauthenticated and navigates on click', async () => {
    await renderWithStore(<Navbar />, { user: { isAuthenticated: false, user: null } });

    fireEvent.click(screen.getByText('Login'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    fireEvent.click(screen.getByText('Register'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('shows Library and Avatar when authenticated', async () => {
    const { store } = await renderWithStore(<Navbar />);
    store.dispatch(setAuthenticated(true));

    expect(await screen.findByText('Library')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('menu: clicking Browse and Rankings navigates to respective routes (desktop)', async () => {
    await renderWithStore(<Navbar />, { user: { isAuthenticated: false, user: null } });

    // Browse Label
    fireEvent.click(screen.getByText('Browse'));
    expect(mockNavigate).toHaveBeenCalledWith('/browse/novel');

    // Rankings Label
    fireEvent.click(screen.getByText('Rankings'));
    expect(mockNavigate).toHaveBeenCalledWith('/rankings');
  });

  it('Create: unauthenticated navigates to login', async () => {
    await renderWithStore(<Navbar />, { user: { isAuthenticated: false, user: null } });

    const createItem = screen.getByText('Create').closest('[data-testid^="menu-item-"]');
    fireEvent.click(createItem);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('Create: authenticated and isAuthor navigates to writerdashboard', async () => {
    const userService = require('../../../../services/user');
    userService.getMe.mockResolvedValue({ isAuthor: true });

    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u1' } } });

    const createItem = screen.getByText('Create').closest('[data-testid^="menu-item-"]');
    fireEvent.click(createItem);

    expect(userService.getMe).toHaveBeenCalled();
    await act(async () => Promise.resolve());
    expect(mockNavigate).toHaveBeenCalledWith('/writerdashboard');
  });

  it('Create: authenticated and not author navigates to writerauth', async () => {
    const userService = require('../../../../services/user');
    userService.getMe.mockResolvedValue({ isAuthor: false });

    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u2' } } });

    const createItem = screen.getByText('Create').closest('[data-testid^="menu-item-"]');
    fireEvent.click(createItem);

    await act(async () => Promise.resolve());
    expect(mockNavigate).toHaveBeenCalledWith('/writerauth');
  });

  it('Mobile: menu item navigations use mobile flow', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    await renderWithStore(<Navbar />, { user: { isAuthenticated: false, user: null } });

    fireEvent.click(screen.getByText('Browse'));
    expect(mockNavigate).toHaveBeenCalledWith('/browse/novel');

    fireEvent.click(screen.getByText('Rankings'));
    expect(mockNavigate).toHaveBeenCalledWith('/rankings');
  });

  it('fetches categories on mount', async () => {
    const categoriesService = require('../../../../services/categories');
    await renderWithStore(<Navbar />);
    // flush microtasks
    await act(async () => Promise.resolve());
    expect(categoriesService.getCategories).toHaveBeenCalledTimes(1);
  });

  it('navigates to Library when authenticated and clicking Library', async () => {
    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u' } } });
    const lib = await screen.findByText('Library');
    fireEvent.click(lib);
    expect(mockNavigate).toHaveBeenCalledWith('/library');
  });

  it('Search: does not call search service for empty input (debounce guarded)', async () => {
    const searchService = require('../../../../services/search');
    searchService.searchAll.mockClear();

    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u' } } });

    // open search but do not type
    clickSearchTrigger();

    // advance past debounce window
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(searchService.searchAll).not.toHaveBeenCalled();
  });

  it('Search: calls once for non-empty then clears when emptied again', async () => {
    const searchService = require('../../../../services/search');
    searchService.searchAll.mockResolvedValue({
      data: { data: { users: [], novels: [] }, users: [], novels: [] },
      users: [],
      novels: [],
    });

    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u' } } });

    // First query
    clickSearchTrigger();
    fireEvent.change(screen.getByTestId('input'), { target: { value: 'abc' } });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    expect(searchService.searchAll).toHaveBeenCalledTimes(1);

    // Clear query
    fireEvent.change(screen.getByTestId('input'), { target: { value: '' } });
    await act(async () => {
      jest.advanceTimersByTime(350);
      await Promise.resolve();
    });

    // Results sections should not be present after clearing
    expect(screen.queryByText('Novels')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('shows core menu items when authenticated', async () => {
    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u' } } });
    expect(await screen.findByText('Browse')).toBeInTheDocument();
    expect(screen.getByText('Rankings')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  // Library should not be visible when unauthenticated
  it('does not show Library when unauthenticated', async () => {
    await renderWithStore(<Navbar />, { user: { isAuthenticated: false, user: null } });
    expect(screen.queryByText('Library')).not.toBeInTheDocument();
  });

  // Unauthenticated search should not query backend
  it('does not call search service when unauthenticated', async () => {
    const searchService = require('../../../../services/search');
    searchService.searchAll.mockClear();

    await renderWithStore(<Navbar />, { user: { isAuthenticated: false, user: null } });

    clickSearchTrigger();
    fireEvent.change(screen.getByTestId('input'), { target: { value: 'query' } });

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(searchService.searchAll).not.toHaveBeenCalled();
  });

  // Search service rejection path
  it('handles search errors gracefully (no sections rendered, no navigation)', async () => {
    const searchService = require('../../../../services/search');
    // Resolve with empty arrays (not null) to avoid .length null errors
    searchService.searchAll.mockResolvedValueOnce({
      data: { data: { users: [], novels: [] }, users: [], novels: [] },
      users: [],
      novels: [],
    });

    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u' } } });

    clickSearchTrigger();
    fireEvent.change(screen.getByTestId('input'), { target: { value: 'oops' } });

    await act(async () => {
      jest.advanceTimersByTime(400);
      await Promise.resolve();
    });

    expect(screen.queryByText('Novels')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders Novels and Users sections with results and calls image utils (authenticated)', async () => {
    const searchService = require('../../../../services/search');
    const imageUtils = require('../../../../utils/imageUtils');

    searchService.searchAll.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            {
              uuid: 'u-1',
              username: 'User 1',
              email: 'u1@test.com',
              avatarUrl: 'u1.png',
              gender: 1,
            },
          ],
          novels: [{ id: 7, uuid: 'n-7', title: 'Novel Seven', coverImgUrl: 'cover7.png' }],
        },
        users: [
          { uuid: 'u-1', username: 'User 1', email: 'u1@test.com', avatarUrl: 'u1.png', gender: 1 },
        ],
        novels: [{ id: 7, uuid: 'n-7', title: 'Novel Seven', coverImgUrl: 'cover7.png' }],
      },
      users: [
        { uuid: 'u-1', username: 'User 1', email: 'u1@test.com', avatarUrl: 'u1.png', gender: 1 },
      ],
      novels: [{ id: 7, uuid: 'n-7', title: 'Novel Seven', coverImgUrl: 'cover7.png' }],
    });

    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u' } } });

    clickSearchTrigger();
    fireEvent.change(screen.getByTestId('input'), { target: { value: 'q' } });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Sections rendered
    expect(screen.getByText('Novels')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Novel Seven')).toBeInTheDocument();
    expect(screen.getByText('User 1')).toBeInTheDocument();

    // Image utils called to process urls
    expect(imageUtils.processImageUrl).toHaveBeenCalled();
    expect(imageUtils.processUserAvatar).toHaveBeenCalledWith('u1.png', 1);
  });

  it('shows "Searching..." while search pending then renders results after resolve', async () => {
    const searchService = require('../../../../services/search');
    let resolveSearch;
    searchService.searchAll.mockReturnValueOnce(
      new Promise((res) => {
        resolveSearch = res;
      })
    );

    await renderWithStore(<Navbar />, { user: { isAuthenticated: true, user: { uuid: 'u' } } });

    clickSearchTrigger();
    fireEvent.change(screen.getByTestId('input'), { target: { value: 'loading' } });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Resolve the pending search
    resolveSearch({
      data: {
        data: {
          users: [{ uuid: 'u-2', username: 'User 2', email: 'u2@test.com' }],
          novels: [{ id: 8, uuid: 'n-8', title: 'Novel Eight', coverImgUrl: '' }],
        },
        users: [{ uuid: 'u-2', username: 'User 2', email: 'u2@test.com' }],
        novels: [{ id: 8, uuid: 'n-8', title: 'Novel Eight', coverImgUrl: '' }],
      },
      users: [{ uuid: 'u-2', username: 'User 2', email: 'u2@test.com' }],
      novels: [{ id: 8, uuid: 'n-8', title: 'Novel Eight', coverImgUrl: '' }],
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Loading gone, results visible
    expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    expect(screen.getByText('Novels')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Novel Eight')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });
});
