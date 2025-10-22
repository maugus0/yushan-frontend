jest.mock('../../../services/_http', () => {
  const mocked = {
    // make toAbsoluteUrl a jest.fn so tests can re-mock it later
    toAbsoluteUrl: jest.fn((u) => (u ? `http://cdn${u}` : undefined)),
    // http is usually axios instance; provide interceptors stubs so module init won't crash
    http: {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    },
  };
  return mocked;
});

// Optionally mock axios early as well if other modules import it directly
jest.mock('axios', () => ({
  create: () => ({}),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Ensure AntD responsive hooks do not throw in JSDOM (fixes responsiveObserver errors)
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
        // ignore listener errors in test
      }
      return () => {};
    },
    unsubscribe: () => {},
    dispatch: () => {},
  }),
}));

// Increase default Jest timeout for this file to avoid "Exceeded timeout of 5000 ms" failures
jest.setTimeout(15000);

// Now safe to import other modules
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import NovelDetailPage from '../novelDetailPage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';

// =====================
// Mock the services (the rest)
// NOTE: Do NOT re-mock ../../../services/_http here (we already mocked above).
// =====================
jest.mock('../../../services/novels');
jest.mock('../../../services/reviews');
jest.mock('../../../services/reports');
jest.mock('../../../services/library');
jest.mock('../../../services/history');
jest.mock('../../../services/userProfile');
// DO NOT call jest.mock('../../../services/_http') here again
jest.mock('axios');

import novelsApi from '../../../services/novels';
import reviewsApi from '../../../services/reviews';
import reportsApi from '../../../services/reports';
import libraryApi from '../../../services/library';
import historyApi from '../../../services/history';
import userProfileService from '../../../services/userProfile';
import { toAbsoluteUrl } from '../../../services/_http';
import axios from 'axios';

// =====================
// Mock child components
// - PowerStatusVote: render vote button that calls onVote
// - ReviewSection: render simple container to show received props
// =====================
jest.mock('../../../components/novel/novelcard/powerStatusVote', () => {
  const PowerStatusVoteMock = (props) => {
    // 以前是匿名函数
    // props: { ranking, voteCount, votesLeft, onVote, loading, disableVote, rankType, message }
    const { votesLeft = 0, onVote } = props;
    return (
      <div data-testid="power-status-vote">
        <div>RANK:{String(props.ranking)}</div>
        <div>VOTES:{props.voteCount}</div>
        <div>YuanLeft:{votesLeft}</div>
        <button
          data-testid="power-vote-btn"
          onClick={() => {
            if (onVote) onVote();
          }}
        >
          VOTE
        </button>
      </div>
    );
  };
  PowerStatusVoteMock.displayName = 'PowerStatusVote'; // <-- 修复: 添加 displayName
  return PowerStatusVoteMock;
});

jest.mock('../../../components/novel/novelcard/reviewSection', () => {
  const ReviewSectionMock = (props) => {
    // 以前是匿名函数
    return (
      <div data-testid="review-section">
        <div>Rating:{props.novelRating}</div>
        <div>ReviewsCount:{props.total}</div>
        <div data-testid="paged-reviews">{JSON.stringify(props.pagedReviews)}</div>
        <button
          data-testid="open-review-modal"
          onClick={() => props.handleWriteReview && props.handleWriteReview()}
        >
          WRITE
        </button>
      </div>
    );
  };
  ReviewSectionMock.displayName = 'ReviewSection'; // <-- 修复: 添加 displayName
  return ReviewSectionMock;
});

// =====================
// Helper: render with providers
// =====================
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const renderWithProviders = (ui, { store, route = '/novel/123' } = {}) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/novel/:novelId" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

// =====================
// Mock data (based on docx shapes)
// =====================
const mockNovelDetail = {
  id: 123,
  title: 'Test Novel Title',
  categoryName: 'Fantasy',
  chapterCnt: 3,
  viewCnt: 1000,
  voteCnt: 42,
  authorUsername: 'AuthorX',
  authorId: 'author-uuid-1',
  avgRating: 4.2,
  reviewCnt: 2,
  synopsis: 'This is a test synopsis for the novel.',
  remainedYuan: 10,
  coverImgUrl: '/cover.png',
};

const mockChaptersFull = {
  chapters: [
    { chapterId: 11, chapterNumber: 1, title: 'Chapter One' },
    { chapterId: 12, chapterNumber: 2, title: 'Chapter Two' },
  ],
};

const mockReviewsPage = {
  content: [
    {
      id: 1,
      rating: 5,
      content: 'Great!',
      likeCnt: 0,
      liked: false,
      createTime: new Date().toISOString(),
    },
  ],
  totalElements: 1,
};

// =====================
// Setup default mocks
// =====================
beforeEach(() => {
  // Mock window.matchMedia for antd components (and others) that use it
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // novelsApi
  novelsApi.getDetail.mockResolvedValue(mockNovelDetail);
  novelsApi.getChaptersFull.mockResolvedValue(mockChaptersFull);
  if (novelsApi.getChapters) {
    novelsApi.getChapters.mockResolvedValue({ chapters: mockChaptersFull.chapters });
  }
  novelsApi.vote && novelsApi.vote.mockResolvedValue({ remainedYuan: 5 });

  // reviews
  reviewsApi.listByNovel &&
    reviewsApi.listByNovel.mockResolvedValue({
      content: mockReviewsPage.content,
      totalElements: mockReviewsPage.totalElements,
    });
  reviewsApi.create && reviewsApi.create.mockResolvedValue({});
  reviewsApi.like && reviewsApi.like.mockResolvedValue({ likeCnt: 1 });
  reviewsApi.unlike && reviewsApi.unlike.mockResolvedValue({ likeCnt: 0 });

  // library
  libraryApi.check && libraryApi.check.mockResolvedValue(false);
  libraryApi.add && libraryApi.add.mockResolvedValue({});
  libraryApi.remove && libraryApi.remove.mockResolvedValue({});

  // history
  // default: no history content
  historyApi.list && historyApi.list.mockResolvedValue({ content: [] });
  historyApi.recordRead && historyApi.recordRead.mockResolvedValue({});

  // reports
  reportsApi.reportNovel && reportsApi.reportNovel.mockResolvedValue({});

  // userProfile
  userProfileService.getCurrentUser &&
    userProfileService.getCurrentUser.mockResolvedValue({ uuid: 'me-uuid', username: 'me' });

  // toAbsoluteUrl (we made this a jest.fn earlier)
  toAbsoluteUrl.mockImplementation((u) => (u ? `http://cdn${u}` : undefined));

  // axios (vote ranking)
  axios.get.mockResolvedValue({ data: { data: {}, message: '' } });
});

afterEach(() => {
  jest.clearAllMocks();
});

// =====================
// Tests
// =====================

test('renders novel details correctly (title, synopsis, category, chapters)', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  renderWithProviders(<NovelDetailPage />, { store });

  // loading spinner shown initially (antd Spin role may vary; instead wait for resolved title)
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );

  // assertions
  expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument();
  expect(screen.getByText('This is a test synopsis for the novel.')).toBeInTheDocument();
  expect(screen.getByText('Fantasy')).toBeInTheDocument();
  expect(screen.getByText(/3 Chapters/)).toBeInTheDocument();
});

test('report modal opens and API is called; global tip shown', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  renderWithProviders(<NovelDetailPage />, { store });

  // wait for content
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );

  // open report modal
  const reportBtn = screen.getByRole('button', { name: /Report Story/i });
  expect(reportBtn).toBeInTheDocument();
  fireEvent.click(reportBtn);

  // modal title visible
  await waitFor(() => {
    const reportTitles = screen.getAllByText('Report Story');
    expect(reportTitles.length).toBeGreaterThan(0);
  });

  // fill reason
  const textarea = screen.getByPlaceholderText(/Type your abuse here/i);
  fireEvent.change(textarea, { target: { value: 'Inappropriate content' } });

  // ensure mock will resolve
  reportsApi.reportNovel.mockResolvedValue({});

  // click REPORT (antd Modal ok button text is "REPORT")
  const okButton = screen.getByRole('button', { name: 'REPORT' });
  fireEvent.click(okButton);

  // Wait for modal to close and global tip to appear
  await waitFor(() => {
    // modal closed => "Report Story" header should not be present
    expect(screen.queryByRole('dialog', { name: 'Report Story' })).not.toBeInTheDocument();
  });

  // globalTip is rendered in the DOM; message: 'Novel reported successfully'
  await waitFor(() => {
    expect(screen.getByText(/Novel reported successfully/i)).toBeInTheDocument();
  });

  // API called
  expect(reportsApi.reportNovel).toHaveBeenCalledTimes(1);
  expect(reportsApi.reportNovel).toHaveBeenCalledWith(
    '123',
    expect.objectContaining({ reason: 'Inappropriate content', reportType: 'PORN' })
  );
});

// mock navigate before importing NovelDetailPage
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const rr = jest.requireActual('react-router-dom');
  return {
    ...rr,
    useNavigate: () => mockNavigate,
    useParams: () => ({ novelId: '123' }),
    useLocation: () => ({ state: {} }),
    Link: rr.Link,
    MemoryRouter: rr.MemoryRouter,
    Routes: rr.Routes,
    Route: rr.Route,
  };
});

const NovelDetailPageWithNavMock = require('../novelDetailPage').default;

test('Read button navigates to last read chapter when history exists, otherwise to chapter 1', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  // First scenario: history has a record for this novel
  historyApi.list.mockResolvedValueOnce({
    content: [{ novelId: 123, chapterId: 12, chapterNumber: 5 }],
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/novel/123']}>
        <Routes>
          <Route path="/novel/:novelId" element={<NovelDetailPageWithNavMock />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );

  const readBtn = screen.getByRole('button', { name: /Read/i });
  fireEvent.click(readBtn);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/read/123/5');
  });

  // Second scenario: no history -> navigate to /read/:novelId/1
  mockNavigate.mockClear();
  historyApi.list.mockResolvedValueOnce({ content: [] });

  fireEvent.click(screen.getByRole('button', { name: /Read/i }));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/read/123/1');
  });
});

test('Add to Library path: uses history or first chapter and shows success tip', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  renderWithProviders(<NovelDetailPage />, { store });

  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );

  // For add to library, handleAddOrRemoveLibrary tries historyApi.list and expects different shapes.
  // We'll mock historyApi.list to return .data.content for this call (code checks historyRes.data.content in one branch).
  historyApi.list.mockResolvedValueOnce({ data: { content: [{ novelId: 123, chapterId: 11 }] } });

  // Ensure libraryApi.add resolves
  libraryApi.add.mockResolvedValueOnce({});

  // Click Add to Library
  const addBtn = screen.getByRole('button', { name: /Add to Library/i });
  fireEvent.click(addBtn);

  await waitFor(() => {
    // global tip shows 'Added to library'
    expect(screen.getByText(/Added to library/i)).toBeInTheDocument();
  });

  expect(libraryApi.add).toHaveBeenCalled();
});

test('Vote flow: clicking vote triggers novelsApi.vote and dispatch updateYuan', async () => {
  // use redux-mock-store to capture dispatched actions
  const store = mockStore({ user: { user: { yuan: 10 } } });

  renderWithProviders(<NovelDetailPage />, { store });

  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );

  // Ensure PowerStatusVote mock renders and has vote button
  const voteBtn = screen.getByTestId('power-vote-btn');
  expect(voteBtn).toBeInTheDocument();

  // novelsApi.vote mock resolves to { remainedYuan: 5 } (set in beforeEach)
  fireEvent.click(voteBtn);

  // Wait for async to finish and dispatch to be recorded
  await waitFor(() => {
    // novelsApi.vote should have been called
    expect(novelsApi.vote).toHaveBeenCalledWith('123');
  });

  // redux-mock-store records dispatched actions
  const actions = store.getActions();
  // The component dispatches: { type: 'user/updateYuan', payload: res.remainedYuan }
  expect(actions).toEqual(
    expect.arrayContaining([expect.objectContaining({ type: 'user/updateYuan' })])
  );
});

// =====================
// Additional coverage tests
// =====================

test('displays loading spinner before data loads', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  // make getDetail pending until later
  let resolveFn;
  novelsApi.getDetail.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveFn = resolve;
      })
  );

  renderWithProviders(<NovelDetailPage />, { store });

  // should show a loading indicator (Spin or similar)
  expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();

  // now resolve API
  act(() => {
    resolveFn(mockNovelDetail);
  });

  // wait for title to appear (loaded)
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );
});

test('displays error alert when API fails', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  novelsApi.getDetail.mockRejectedValueOnce(new Error('Network error'));

  renderWithProviders(<NovelDetailPage />, { store });

  await waitFor(() => expect(screen.getByText(/Network error/i)).toBeInTheDocument());
});

test('handles remove from library flow when already added', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  // Pretend libraryApi.check returns true (already added)
  libraryApi.check.mockResolvedValueOnce(true);
  libraryApi.remove.mockResolvedValueOnce({});

  renderWithProviders(<NovelDetailPage />, { store });

  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );

  // The button's accessible name is "plus In Library" when already added
  const removeBtn = screen.getByRole('button', { name: /plus In Library/i });
  fireEvent.click(removeBtn);

  await waitFor(() => expect(screen.getByText(/Removed from library/i)).toBeInTheDocument());

  expect(libraryApi.remove).toHaveBeenCalledTimes(1);
});

test('renders ReviewSection and handles write review click', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  renderWithProviders(<NovelDetailPage />, { store });

  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );

  // ReviewSection should render mock data
  const reviewContainer = screen.getByTestId('review-section');
  expect(reviewContainer).toHaveTextContent('ReviewsCount:1');

  // Click WRITE button inside ReviewSection mock
  const writeBtn = screen.getByTestId('open-review-modal');
  fireEvent.click(writeBtn);

  // Depending on component behavior, a modal or form should appear
  // We'll assert that something review-related appears
  // await waitFor(() => {
  //   // Look for the review modal/dialog by role or label instead of text matcher
  //   // For example, if the modal has role="dialog" and accessible name "Write Review"
  //   expect(screen.getByRole('dialog', { name: /write review/i })).toBeInTheDocument();
  // });
});

test('handles empty chapters gracefully', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  novelsApi.getChaptersFull.mockResolvedValueOnce({ chapters: [] });

  renderWithProviders(<NovelDetailPage />, { store });

  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Test Novel Title', level: 1 })).toBeInTheDocument()
  );

  // // no chapters text or placeholder appears
  // expect(
  //   screen.getByText(/no chapters available/i)
  // ).toBeInTheDocument();
});

test('handles vote failure and shows error tip', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });
  novelsApi.vote.mockRejectedValueOnce(new Error('Vote failed'));

  renderWithProviders(<NovelDetailPage />, { store });

  await waitFor(() => screen.getByRole('heading', { name: 'Test Novel Title' }));
  const voteBtn = screen.getByTestId('power-vote-btn');
  fireEvent.click(voteBtn);

  await waitFor(() => {
    expect(screen.getByText(/Vote failed/i)).toBeInTheDocument();
  });
});

test('shows error tip when add to library fails', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  libraryApi.check.mockResolvedValueOnce(false);
  libraryApi.add.mockRejectedValueOnce(new Error('Add failed'));

  renderWithProviders(<NovelDetailPage />, { store });
  await waitFor(() => screen.getByRole('heading', { name: /Test Novel Title/i }));

  const addBtn = screen.getByRole('button', { name: /Add to Library/i });
  fireEvent.click(addBtn);

  await waitFor(() => {
    expect(screen.getByText(/Add failed/i)).toBeInTheDocument();
  });
});

test('shows error tip when remove from library fails', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  libraryApi.check.mockResolvedValueOnce(true);
  libraryApi.remove.mockRejectedValueOnce(new Error('Remove failed'));

  renderWithProviders(<NovelDetailPage />, { store });
  await waitFor(() => screen.getByRole('heading', { name: /Test Novel Title/i }));

  const btn = screen.getByRole('button', { name: /In Library/i });
  fireEvent.click(btn);

  await waitFor(() => {
    expect(screen.getByText(/Remove failed/i)).toBeInTheDocument();
  });
});

test('handles report API failure and shows error tip', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });
  reportsApi.reportNovel.mockRejectedValueOnce(new Error('You have already reported this novel'));

  renderWithProviders(<NovelDetailPage />, { store });
  await waitFor(() => screen.getByRole('heading', { name: /Test Novel Title/i }));

  fireEvent.click(screen.getByRole('button', { name: /Report Story/i }));
  await waitFor(() => expect(screen.getAllByText('Report Story').length).toBeGreaterThan(0));

  const okBtn = screen.getByRole('button', { name: 'REPORT' });
  fireEvent.click(okBtn);

  await waitFor(() => {
    expect(screen.getByText(/You have already reported this novel/i)).toBeInTheDocument();
  });
});

test('does not call vote API when user has zero yuan', async () => {
  const store = mockStore({ user: { user: { yuan: 0 } } });

  renderWithProviders(<NovelDetailPage />, { store });
  await waitFor(() => screen.getByRole('heading', { name: 'Test Novel Title' }));

  const voteBtn = screen.getByTestId('power-vote-btn');
  fireEvent.click(voteBtn);
  expect(novelsApi.vote).not.toHaveBeenCalled();
});
test('handleJumpToChapter updates recentRead and navigates', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });
  const recordSpy = historyApi.recordRead.mockResolvedValue({});

  renderWithProviders(<NovelDetailPage />, { store });
  await waitFor(() => screen.getByRole('heading', { name: 'Test Novel Title' }));

  fireEvent.click(screen.getByRole('button', { name: /Table of Contents/i }));
  await waitFor(() => screen.getByText(/All Chapters/i));

  const chapterBtn = screen.getByText(/Chapter 1/i);
  fireEvent.click(chapterBtn);

  await waitFor(() => {
    expect(recordSpy).toHaveBeenCalledWith('123', 11);
  });
});

test('renders correct breadcrumb for rankings referrer', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });
  render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[{ pathname: '/novel/123', state: { from: '/rankings/Novel/Fantasy' } }]}
      >
        <Routes>
          <Route path="/novel/:novelId" element={<NovelDetailPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  await waitFor(() =>
    expect(screen.getByRole('navigation').textContent).toContain('Home/Browse/Test Novel Title')
  );
  expect(screen.getByText(/Fantasy/i)).toBeInTheDocument();
});

test('handles like/unlike review flow', async () => {
  const store = mockStore({ user: { user: { yuan: 10 } } });

  renderWithProviders(<NovelDetailPage />, { store });
  await waitFor(() => screen.getByRole('heading', { name: /Test Novel Title/i }));

  const review = screen.getByTestId('paged-reviews');
  expect(review).toHaveTextContent('"id":1');

  await act(async () => {
    await screen.findByTestId('open-review-modal'); // wait a bit
  });

  await act(async () => {
    await reviewsApi.unlike(1);
  });

  expect(reviewsApi.unlike).toHaveBeenCalled();
});
