import { render, screen, fireEvent, act } from '@testing-library/react';
import WriterNavbar from '../writernavbar';
import { UserContext } from '../../../../store/UserContext';

// Mock react-router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Lightweight antd mocks used by WriterNavbar
jest.mock('antd', () => {
  const Sider = ({ children, ...props }) => (
    <aside data-testid="sider" {...props}>
      {children}
    </aside>
  );

  const Button = ({ children, onClick, ...props }) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );

  const Avatar = ({ src, ...props }) => (
    <img alt="avatar" data-testid="writer-avatar" src={src || ''} {...props} />
  );

  const Tooltip = ({ children }) => <>{children}</>;

  return { Layout: { Sider }, Button, Avatar, Tooltip };
});

// Replace spyOn with a configurable getter + helper
let mockWidth = 1024;
const setViewport = (w) => {
  mockWidth = w;
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    get: () => mockWidth,
  });
};

const renderNavbar = async ({
  user = { username: 'Writer', avatarUrl: 'avatar.png' },
  width = 1024,
} = {}) => {
  setViewport(width);
  let utils;
  await act(async () => {
    utils = render(
      <UserContext.Provider value={user}>
        <WriterNavbar />
      </UserContext.Provider>
    );
    await Promise.resolve();
  });
  return { ...utils };
};

describe('WriterNavbar', () => {
  afterEach(() => {
    jest.clearAllMocks();
    setViewport(1024);
  });

  it('renders expanded by default (>=900px): shows username and menu labels', async () => {
    const user = { username: 'Alice', avatarUrl: 'a.png' };
    await renderNavbar({ user, width: 1200 });

    // Username visible
    expect(screen.getByText('Alice')).toBeInTheDocument();
    // Menu labels visible
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Interaction')).toBeInTheDocument();
    // Avatar present
    expect(screen.getByTestId('writer-avatar')).toBeInTheDocument();
  });

  it('navigates on button clicks in expanded mode', async () => {
    await renderNavbar({ width: 1200 });

    // Back button
    const backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');

    // Menu clicks
    fireEvent.click(screen.getByText('Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/writerdashboard');

    fireEvent.click(screen.getByText('Workspace'));
    expect(mockNavigate).toHaveBeenCalledWith('/writerworkspace');

    fireEvent.click(screen.getByText('Interaction'));
    expect(mockNavigate).toHaveBeenCalledWith('/writerinteraction');
  });

  it('renders collapsed when width < 900: hides username and menu labels', async () => {
    const user = { username: 'Bob', avatarUrl: 'b.png' };
    await renderNavbar({ user, width: 800 });

    // Username hidden in collapsed state
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    // Labels hidden
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
    expect(screen.queryByText('Interaction')).not.toBeInTheDocument();
    // Avatar still present
    expect(screen.getByTestId('writer-avatar')).toBeInTheDocument();
  });

  it('responds to window resize: toggles collapsed state', async () => {
    // Start expanded
    await renderNavbar({ width: 1200 });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Collapse to mobile
    setViewport(800);
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();

    // Expand back
    setViewport(1000);
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
