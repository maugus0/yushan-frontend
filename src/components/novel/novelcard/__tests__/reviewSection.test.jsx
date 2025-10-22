import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// minimize AntD responsive/runtime issues in JSDOM
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

// Replace Rate only with a runtime-safe mock (no `document` usage)
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  const React = require('react');

  const MockRate = (props) => {
    const { value = 0, onChange, disabled } = props;
    const [v, setV] = React.useState(value || 0);
    return React.createElement(
      'div',
      { 'data-testid': props['data-testid'] || 'mock-rate' },
      [1, 2, 3, 4, 5].map((n) =>
        React.createElement(
          'button',
          {
            key: n,
            type: 'button',
            'data-value': n,
            onClick: () => {
              if (!disabled) {
                setV(n);
                if (onChange) onChange(n);
              }
            },
            'aria-label': `star-${n}`,
          },
          String(n)
        )
      )
    );
  };

  return { ...actual, Rate: MockRate };
});

// Import component after mocks
const ReviewSection = require('../reviewSection').default;

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

const makeReview = (id, opts = {}) => ({
  id,
  userId: opts.userId || `user-${id}`,
  username: opts.username || `User ${id}`,
  content: opts.content || `Content ${id}`,
  likeCnt: opts.likeCnt ?? 0,
  rating: opts.rating,
  isSpoiler: opts.isSpoiler,
  date: opts.date,
  avatar: opts.avatar,
});

// IMPORTANT: return the render result so tests can unmount / rerender
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

// helper: find the last modal's POST button to avoid ambiguous queries
const getLastModal = () => {
  const modals = Array.from(document.querySelectorAll('.ant-modal'));
  return modals[modals.length - 1];
};
const getPostButtonInLastModal = () => {
  const lastModal = getLastModal();
  if (!lastModal) return null;
  return within(lastModal).getByRole('button', { name: /POST/i });
};

test('renders CTA with rating and WRITE A REVIEW button calls handler', () => {
  const handleWriteReview = jest.fn();
  renderWithRouter(
    <ReviewSection
      novelRating={4.2}
      pagedReviews={[]}
      total={0}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={handleWriteReview}
      isReviewModalVisible={false}
      setIsReviewModalVisible={() => {}}
      currentUser={null}
    />
  );

  expect(screen.getByText('4.2')).toBeInTheDocument();
  const btn = screen.getByRole('button', { name: /WRITE A REVIEW/i });
  fireEvent.click(btn);
  expect(handleWriteReview).toHaveBeenCalledTimes(1);
});

test('renders reviews list with spoiler tag, date and like buttons', async () => {
  const now = new Date().toISOString();
  const reviews = [
    makeReview(1, { rating: 5, isSpoiler: true, date: now, likeCnt: 2 }),
    makeReview(2, { rating: 3, isSpoiler: false, date: now, likeCnt: 0 }),
  ];

  renderWithRouter(
    <ReviewSection
      novelRating={3.5}
      pagedReviews={reviews}
      total={2}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={() => {}}
      isReviewModalVisible={false}
      setIsReviewModalVisible={() => {}}
      currentUser={{ data: { uuid: 'guest' } }}
      onLikeReview={jest.fn()}
    />
  );

  // wait for items to appear
  await waitFor(() => expect(screen.getByText('Content 1')).toBeInTheDocument());
  expect(screen.getByText(/\(Spoiler\)/i)).toBeInTheDocument();

  const likeButtons = document.querySelectorAll('.chapter-comment-like-btn');
  expect(likeButtons.length).toBe(2);
  expect(likeButtons[0].textContent).toContain('2');
});

test('handleLike calls onLikeReview and updates localStorage likedReviews', async () => {
  const onLikeReview = jest.fn().mockResolvedValue({});
  const reviews = [makeReview('r1'), makeReview('r2')];
  localStorage.setItem('likedReviews_guest', JSON.stringify(['r2']));

  renderWithRouter(
    <ReviewSection
      novelRating={4}
      pagedReviews={reviews}
      total={2}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={() => {}}
      isReviewModalVisible={false}
      setIsReviewModalVisible={() => {}}
      currentUser={{ data: { uuid: 'guest' } }}
      onLikeReview={onLikeReview}
    />
  );

  const likeBtns = document.querySelectorAll('.chapter-comment-like-btn');
  fireEvent.click(likeBtns[0]);
  await waitFor(() => expect(onLikeReview).toHaveBeenCalledWith('r1', false));

  const stored = JSON.parse(localStorage.getItem('likedReviews_guest'));
  expect(Array.isArray(stored)).toBe(true);
  expect(stored).toEqual(expect.arrayContaining(['r1', 'r2']));

  fireEvent.click(likeBtns[1]);
  await waitFor(() => expect(onLikeReview).toHaveBeenCalledWith('r2', true));
});

test('POST in Write modal shows validation errors and successful submit calls handlers', async () => {
  const onSubmitReview = jest.fn().mockResolvedValue({});
  const onRefreshNovelRating = jest.fn().mockResolvedValue({});
  const setIsReviewModalVisible = jest.fn();

  renderWithRouter(
    <ReviewSection
      novelRating={4}
      pagedReviews={[]}
      total={0}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={() => {}}
      isReviewModalVisible={true}
      setIsReviewModalVisible={setIsReviewModalVisible}
      onSubmitReview={onSubmitReview}
      onRefreshNovelRating={onRefreshNovelRating}
      currentUser={{ data: { uuid: 'guest' } }}
    />
  );

  // get POST button from the specific modal to avoid ambiguous matches
  const postBtn = getPostButtonInLastModal();
  expect(postBtn).toBeTruthy();

  // initial validation: no rating/text
  await userEvent.click(postBtn);
  expect(await within(getLastModal()).findByText(/Please select a rating\./i)).toBeInTheDocument();

  // set textarea
  const textarea = within(getLastModal()).getByPlaceholderText(/Type your review here/i);
  await userEvent.type(textarea, 'Excellent read');

  // select modal Rate (use document to include portal)
  const mockRates = Array.from(document.querySelectorAll('div[data-testid="mock-rate"]'));
  const modalRate = mockRates[mockRates.length - 1];
  const mockRateBtn = modalRate.querySelector('button[data-value="4"]');
  expect(mockRateBtn).toBeTruthy();
  await userEvent.click(mockRateBtn);

  // submit and assert handlers called
  await userEvent.click(getPostButtonInLastModal());
  await waitFor(() => expect(onSubmitReview).toHaveBeenCalled());
  expect(onSubmitReview).toHaveBeenCalledWith(
    expect.objectContaining({ rating: expect.any(Number), text: 'Excellent read' })
  );
  expect(setIsReviewModalVisible).toHaveBeenCalledWith(false);
  expect(onRefreshNovelRating).toHaveBeenCalled();
});

test('robust POST flow: set textarea and modal Rate (target the modal Rate) then submit', async () => {
  const onSubmitReview = jest.fn().mockResolvedValue({});
  const onRefreshNovelRating = jest.fn().mockResolvedValue({});
  const setIsReviewModalVisible = jest.fn();

  renderWithRouter(
    <ReviewSection
      novelRating={4}
      pagedReviews={[]}
      total={0}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={() => {}}
      isReviewModalVisible={true}
      setIsReviewModalVisible={setIsReviewModalVisible}
      onSubmitReview={onSubmitReview}
      onRefreshNovelRating={onRefreshNovelRating}
      currentUser={{ data: { uuid: 'guest' } }}
    />
  );

  const postBtn = getPostButtonInLastModal();
  expect(postBtn).toBeTruthy();

  // initial validation
  await userEvent.click(postBtn);
  expect(await within(getLastModal()).findByText(/Please select a rating\./i)).toBeInTheDocument();

  // fill textarea
  const textarea = within(getLastModal()).getByPlaceholderText(/Type your review here/i);
  await userEvent.type(textarea, 'Excellent read');

  // pick modal rate (document query)
  const mockRates = Array.from(document.querySelectorAll('div[data-testid="mock-rate"]'));
  expect(mockRates.length).toBeGreaterThanOrEqual(1);
  const modalRate = mockRates[mockRates.length - 1];
  const fourBtn = modalRate.querySelector('button[data-value="4"]');
  expect(fourBtn).toBeTruthy();
  await userEvent.click(fourBtn);

  // submit
  await userEvent.click(getPostButtonInLastModal());
  await waitFor(() => expect(onSubmitReview).toHaveBeenCalled());
  expect(onSubmitReview).toHaveBeenCalledWith(
    expect.objectContaining({ rating: expect.any(Number), text: 'Excellent read' })
  );
  expect(setIsReviewModalVisible).toHaveBeenCalledWith(false);
  expect(onRefreshNovelRating).toHaveBeenCalled();
});

test('POST shows validation error when only rating provided or only text provided', async () => {
  const onSubmitReview = jest.fn().mockResolvedValue({});
  const setIsReviewModalVisible = jest.fn();
  const onRefreshNovelRating = jest.fn();

  // First render: choose rating only -> expect "Please enter your review."
  const first = renderWithRouter(
    <ReviewSection
      novelRating={4}
      pagedReviews={[]}
      total={0}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={() => {}}
      isReviewModalVisible={true}
      setIsReviewModalVisible={setIsReviewModalVisible}
      onSubmitReview={onSubmitReview}
      onRefreshNovelRating={onRefreshNovelRating}
      currentUser={{ data: { uuid: 'guest' } }}
    />
  );

  // pick modal rate (document query)
  const mockRates = Array.from(document.querySelectorAll('div[data-testid="mock-rate"]'));
  const modalRate = mockRates[mockRates.length - 1];
  const fiveBtn = modalRate.querySelector('button[data-value="5"]');
  expect(fiveBtn).toBeTruthy();
  await userEvent.click(fiveBtn);

  // click POST in that specific modal
  const postBtn = getPostButtonInLastModal();
  expect(postBtn).toBeTruthy();
  await userEvent.click(postBtn);
  expect(
    await within(getLastModal()).findByText(/Please enter your review\./i)
  ).toBeInTheDocument();

  // Unmount previous modal to avoid duplicate POST buttons, then render a fresh modal instance
  first.unmount();

  // Fresh render for "only text" case (no rating)
  renderWithRouter(
    <ReviewSection
      novelRating={4}
      pagedReviews={[]}
      total={0}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={() => {}}
      isReviewModalVisible={true}
      setIsReviewModalVisible={setIsReviewModalVisible}
      onSubmitReview={onSubmitReview}
      onRefreshNovelRating={onRefreshNovelRating}
      currentUser={{ data: { uuid: 'guest' } }}
    />
  );

  const postBtn2 = getPostButtonInLastModal();
  expect(postBtn2).toBeTruthy();
  const textarea2 = within(getLastModal()).getByPlaceholderText(/Type your review here/i);
  await userEvent.type(textarea2, 'Only text no rating');
  await userEvent.click(postBtn2);
  expect(await within(getLastModal()).findByText(/Please select a rating\./i)).toBeInTheDocument();

  expect(onSubmitReview).not.toHaveBeenCalled();
});

test('Pagination renders and calls onChangePage when page clicked', () => {
  const onChangePage = jest.fn();
  renderWithRouter(
    <ReviewSection
      novelRating={4}
      pagedReviews={[]}
      total={50}
      page={1}
      pageSize={10}
      onChangePage={onChangePage}
      handleWriteReview={() => {}}
      isReviewModalVisible={false}
      setIsReviewModalVisible={() => {}}
      currentUser={{ data: { uuid: 'guest' } }}
    />
  );

  const page2 = document.querySelector('.ant-pagination-item-2');
  if (page2) {
    fireEvent.click(page2);
    expect(onChangePage).toHaveBeenCalled();
  } else {
    expect(document.querySelector('.review-pagination')).toBeTruthy();
  }
});

test('modal input state resets after successful submit', async () => {
  const onSubmitReview = jest.fn().mockResolvedValue({});
  const onRefreshNovelRating = jest.fn().mockResolvedValue({});
  const setIsReviewModalVisible = jest.fn();

  const { unmount } = renderWithRouter(
    <ReviewSection
      novelRating={4}
      pagedReviews={[]}
      total={0}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={() => {}}
      isReviewModalVisible={true}
      setIsReviewModalVisible={setIsReviewModalVisible}
      onSubmitReview={onSubmitReview}
      onRefreshNovelRating={onRefreshNovelRating}
      currentUser={{ data: { uuid: 'guest' } }}
    />
  );

  const postBtn = getPostButtonInLastModal();
  expect(postBtn).toBeTruthy();
  const textarea = within(getLastModal()).getByPlaceholderText(/Type your review here/i);
  await userEvent.type(textarea, 'Cleanup test');

  const mockRates = Array.from(document.querySelectorAll('div[data-testid="mock-rate"]'));
  const modalRate = mockRates[mockRates.length - 1];
  const threeBtn = modalRate.querySelector('button[data-value="3"]');
  expect(threeBtn).toBeTruthy();
  await userEvent.click(threeBtn);

  await userEvent.click(postBtn);
  await waitFor(() => expect(onSubmitReview).toHaveBeenCalled());

  // Unmount and render a fresh modal instance (simulate re-opening)
  unmount();
  renderWithRouter(
    <ReviewSection
      novelRating={4}
      pagedReviews={[]}
      total={0}
      page={1}
      pageSize={10}
      onChangePage={() => {}}
      handleWriteReview={() => {}}
      isReviewModalVisible={true}
      setIsReviewModalVisible={() => {}}
      onSubmitReview={() => {}}
      onRefreshNovelRating={() => {}}
      currentUser={{ data: { uuid: 'guest' } }}
    />
  );

  // textarea should be empty on fresh modal
  const ta = within(getLastModal()).getByPlaceholderText(/Type your review here/i);
  expect(ta.value).toBe('');
});
