/* global global */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LeaderboardList from '../leaderboard-list';

// Mock Antd, icons, levels, IntersectionObserver same as before
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
  return {
    List: MockList,
    Avatar: (props) => <div {...props} data-testid="avatar" />,
    Skeleton: {
      Input: (props) => <div {...props} data-testid="skeleton-input" />,
      Avatar: (props) => <div {...props} data-testid="skeleton-avatar" />,
    },
    Spin: (props) => <div {...props}>Spin</div>,
  };
});

jest.mock('@ant-design/icons', () => ({
  CrownFilled: (props) => <span {...props}>Crown</span>,
  UserOutlined: (props) => <span {...props}>User</span>,
  ReadOutlined: (props) => <span {...props}>Read</span>,
  LikeFilled: (props) => <span {...props}>Like</span>,
  BookFilled: (props) => <span {...props}>Book</span>,
  EyeOutlined: (props) => <span {...props}>Eye</span>,
}));

jest.mock('../../../utils/levels', () => ({
  xpToLevel: () => 1,
  levelMeta: () => ({ title: 'Novice' }),
}));

beforeAll(() => {
  global.IntersectionObserver = class {
    constructor() {}
    observe() {}
    disconnect() {}
  };
});

describe('LeaderboardList full coverage', () => {
  const novelItem = {
    id: 1,
    title: 'Novel A',
    coverImgUrl: 'cover.png',
    views: 100,
    votes: 20,
    categoryName: 'Fantasy',
    tags: ['tag1', 'tag2'],
    synopsis: 'A story',
  };

  const userItem = {
    uuid: 'user-1',
    username: 'Alice',
    avatarUrl: 'avatar.png',
    xp: 200,
    level: 2,
  };

  const writerItem = {
    uuid: 'writer-1',
    username: 'Bob',
    avatarUrl: 'avatar.png',
    novelNum: 5,
    totalVoteCnt: 100,
    totalViewCnt: 200,
  };

  test('renders novel tab with medal, category, tags, synopsis', () => {
    render(
      <MemoryRouter>
        <LeaderboardList tab="novels" data={{ items: [novelItem] }} loadingInitial={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Novel A')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('A story')).toBeInTheDocument();
    expect(screen.getByText('Crown')).toBeInTheDocument(); // rank <=3 medal
  });

  test('renders users tab', () => {
    render(
      <MemoryRouter>
        <LeaderboardList tab="users" data={{ items: [userItem] }} loadingInitial={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/Lv\.2 · Novice/)).toBeInTheDocument();
    expect(screen.getByText(/EXP: 200/)).toBeInTheDocument();
  });

  test('renders writers tab', () => {
    render(
      <MemoryRouter>
        <LeaderboardList tab="writer" data={{ items: [writerItem] }} loadingInitial={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  test('renders skeletons when loadingInitial is true', () => {
    render(
      <MemoryRouter>
        <LeaderboardList tab="novels" data={{ items: [] }} loadingInitial={true} />
      </MemoryRouter>
    );

    expect(screen.getAllByTestId('skeleton-input').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('skeleton-avatar').length).toBeGreaterThan(0);
  });

  test('renders footer loadingMore and showNoMore', () => {
    render(
      <MemoryRouter>
        <LeaderboardList
          tab="novels"
          data={{ items: [] }}
          loadingInitial={false}
          loadingMore={true}
          hasMore={true}
          onLoadMore={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Spin')).toBeInTheDocument();
  });
});
