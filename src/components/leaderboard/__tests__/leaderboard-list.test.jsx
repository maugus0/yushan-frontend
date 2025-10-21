/* global global */
// __tests__/leaderboard-list.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LeaderboardList from '../leaderboard-list';

// Mock Antd
jest.mock('antd', () => {
  const MockList = ({ dataSource, renderItem, footer }) => (
    <div data-testid="mock-list">
      {dataSource.map((item, idx) => renderItem(item, idx))}
      {footer}
    </div>
  );
  MockList.displayName = 'MockList';
  MockList.Item = ({ children }) => <div>{children}</div>;
  MockList.Item.displayName = 'MockList.Item';

  const MockAvatar = (props) => <div {...props} data-testid="avatar" />;
  MockAvatar.displayName = 'MockAvatar';

  const MockSpin = (props) => <div {...props}>Spin</div>;
  MockSpin.displayName = 'MockSpin';

  const MockSkeletonInput = (props) => <div {...props} data-testid="skeleton-input" />;
  MockSkeletonInput.displayName = 'MockSkeletonInput';
  const MockSkeletonAvatar = (props) => <div {...props} data-testid="skeleton-avatar" />;
  MockSkeletonAvatar.displayName = 'MockSkeletonAvatar';

  return {
    List: MockList,
    Avatar: MockAvatar,
    Spin: MockSpin,
    Skeleton: {
      Input: MockSkeletonInput,
      Avatar: MockSkeletonAvatar,
    },
  };
});

// Mock Antd Icons
jest.mock('@ant-design/icons', () => ({
  CrownFilled: (props) => <span {...props}>Crown</span>,
  UserOutlined: (props) => <span {...props}>User</span>,
  ReadOutlined: (props) => <span {...props}>Read</span>,
  LikeFilled: (props) => <span {...props}>Like</span>,
  BookFilled: (props) => <span {...props}>Book</span>,
  EyeOutlined: (props) => <span {...props}>Eye</span>,
}));

// Mock levels utils
jest.mock('../../../utils/levels', () => ({
  xpToLevel: () => 1,
  levelMeta: () => ({ title: 'Novice' }),
}));

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = class {
    constructor() {}
    observe() {}
    disconnect() {}
  };
});

describe('LeaderboardList', () => {
  test('renders novel rows', () => {
    const data = {
      items: [{ id: 1, title: 'Novel A', views: 100, votes: 20 }],
    };

    render(
      <MemoryRouter>
        <LeaderboardList tab="novels" data={data} loadingInitial={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Novel A')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('renders skeletons when loadingInitial is true', () => {
    const data = { items: [] };
    render(
      <MemoryRouter>
        <LeaderboardList tab="novels" data={data} loadingInitial={true} />
      </MemoryRouter>
    );

    expect(screen.getAllByTestId('skeleton-input').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('skeleton-avatar').length).toBeGreaterThan(0);
  });
});
