import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WriterInteraction from '../writerinteraction';
import novelService from '../../../services/novel';
import userService from '../../../services/user';
import reviewService from '../../../services/review';
import commentService from '../../../services/comments';

// --- Mocks ---
jest.mock('../../../services/novel');
jest.mock('../../../services/user');
jest.mock('../../../services/review');
jest.mock('../../../services/comments');

jest.mock('../../../components/writer/writernavbar/writernavbar', () => {
  const MockWriterNavbar = () => <div data-testid="writer-navbar">Navbar</div>;
  MockWriterNavbar.displayName = 'MockWriterNavbar';
  return MockWriterNavbar;
});

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
let mockIntersectionCallback;

class MockIntersectionObserver {
  constructor(callback) {
    mockIntersectionCallback = callback;

    this.observe = mockObserve;
    this.disconnect = mockDisconnect;
    this.unobserve = jest.fn();
  }
  
}

window.IntersectionObserver = MockIntersectionObserver;

const triggerIntersection = () => {
  if (mockIntersectionCallback) {
    mockIntersectionCallback([{ isIntersecting: true }]);
  }
};

jest.mock('antd', () => {
  const React = jest.requireActual('react');
  const antd = jest.requireActual('antd');

  // Mock Modal
  const MockModal = ({ children, open, onCancel, footer }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-modal">
        <div>{children}</div>
        <div>
          {footer && footer.map((button, i) => <React.Fragment key={i}>{button}</React.Fragment>)}
        </div>
      </div>
    );
  };
  MockModal.displayName = 'MockModal';

  // Mock Spin
  const MockSpin = ({ size, spinning }) => {
    // spinning defaults to true, so we check for explicit false
    const isSpinning = spinning !== false;
    if (!isSpinning) return null;
    // Differentiate between the full-page load and the list-bottom load
    return <div data-testid={size === 'large' ? 'initial-spinner' : 'list-spinner'}>Loading...</div>;
  };
  MockSpin.displayName = 'MockSpin';

  // Mock Button
  const MockButton = ({ children, onClick, ...props }) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
  MockButton.displayName = 'MockButton';

  // Mock Select
  const MockSelect = ({ value, onChange, options, placeholder, className }) => (
    <select
      data-testid="novel-select"
      className={className}
      value={value || ''}
      // The component's `onChange` (setSelectedNovelId) expects the value directly, not an event
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
  MockSelect.displayName = 'MockSelect';

  // Mock Tabs
  const MockTabs = ({ activeKey, onChange, items }) => (
    <div>
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          data-testid={`tab-${item.key}`}
          // Use aria-selected for accessibility and testing
          aria-selected={item.key === activeKey}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
  MockTabs.displayName = 'MockTabs';

  return {
    ...antd,
    Modal: MockModal,
    Spin: MockSpin,
    Select: MockSelect,
    Button: MockButton,
    Tabs: MockTabs,
  };
});


// --- Test Suite ---
describe('WriterInteraction Component', () => {
  // Define mock data
  const mockAuthor = { uuid: 'author-uuid-123' };
  const mockNovels = [
    { id: 1, title: 'Novel One' },
    { id: 2, title: 'Novel Two' },
  ];

  const PAGE_SIZE = 15; // From component constant

  // Mock data for reviews
  const mockReviewsPage1 = {
    content: Array.from({ length: PAGE_SIZE }, (v, i) => ({
      id: `r-1-${i}`,
      content: `Review content ${i + 1}`,
      username: `Reviewer ${i + 1}`,
    })),
  };
  const mockReviewsPage2 = {
    content: [{ id: 'r-2-1', content: 'Final Review', username: 'Reviewer 16' }],
  };

  // Mock data for comments
  const mockCommentsPage1 = {
    comments: Array.from({ length: PAGE_SIZE }, (v, i) => ({
      id: `c-1-${i}`,
      content: `Comment content ${i + 1}`,
      username: `Commenter ${i + 1}`,
      chapterTitle: `Chapter ${i + 1}`,
    })),
  };
  const mockCommentsPage2 = {
    comments: [{ id: 'c-2-1', content: 'Final Comment', username: 'Commenter 16', chapterTitle: 'Chapter 16' }],
  };

  // Destructure service mocks for easy access
  const { getMe } = userService;
  const { getNovel } = novelService;
  const { getReviewsByNovelId } = reviewService;
  const { getCommentsByNovelId } = commentService;

  // Helper function to render the component
  const renderComponent = () => {
    return render(<WriterInteraction />);
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockIntersectionCallback = undefined; // Clear the stored callback

    // Set up default successful API responses
    getMe.mockResolvedValue(mockAuthor);
    getNovel.mockResolvedValue(mockNovels);
    getReviewsByNovelId.mockResolvedValue(mockReviewsPage1);
    getCommentsByNovelId.mockResolvedValue(mockCommentsPage1);
  });

  // Test 1: renders initial loading spinner and navbar
  test('renders initial loading spinner and navbar', () => {
    // Prevent services from resolving to keep loading state
    getMe.mockImplementation(() => new Promise(() => {}));
    renderComponent();

    expect(screen.getByTestId('initial-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('writer-navbar')).toBeInTheDocument();
  });

  // Test 2: loads novels, selects first novel, and fetches its reviews by default
  test('loads novels, selects first novel, and fetches its reviews by default', async () => {
    renderComponent();

    // Wait for initial data fetching to complete
    await waitFor(() => {
      expect(getMe).toHaveBeenCalledTimes(1);
      expect(getNovel).toHaveBeenCalledWith({ authorId: mockAuthor.uuid });
    });

    // Check that the first novel is selected
    expect(screen.getByTestId('novel-select')).toHaveValue('1');

    // Wait for reviews of the first novel to be fetched (default tab)
    await waitFor(() => {
      expect(getReviewsByNovelId).toHaveBeenCalledWith({
        page: 0,
        size: PAGE_SIZE,
        novelId: mockNovels[0].id,
      });
    });

    // Check that review data is displayed
    expect(screen.getByText('Review content 1')).toBeInTheDocument();
    expect(screen.getByText('Reviewer 1')).toBeInTheDocument();
    // Check that comment data is not displayed
    expect(screen.queryByText('Comment content 1')).not.toBeInTheDocument();
  });

  // Test 3: handles no novels found
  test('handles no novels found', async () => {
    getNovel.mockResolvedValue([]);
    renderComponent();

    // Wait for the initial loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('initial-spinner')).not.toBeInTheDocument();
    });

    // Check that the select is empty and "No data" message is shown
    expect(screen.getByTestId('novel-select')).toHaveValue('');
    expect(screen.getByText('No data available.')).toBeInTheDocument();
    // Ensure no follow-up API calls were made
    expect(getReviewsByNovelId).not.toHaveBeenCalled();
    expect(getCommentsByNovelId).not.toHaveBeenCalled();
  });

  // Test 4: handles novel with no reviews
  test('handles novel with no reviews', async () => {
    getReviewsByNovelId.mockResolvedValue({ content: [] });
    renderComponent();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('initial-spinner')).not.toBeInTheDocument();
    });

    // Should show "No data" message
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  // Test 5: shows error modal if userService.getMe fails
  test('shows error modal if userService.getMe fails', async () => {
    const errorMsg = 'Failed to authenticate user.';
    getMe.mockRejectedValue(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
    expect(screen.getByText(errorMsg)).toBeInTheDocument();

    // Test closing the modal
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  // Test 6: shows error modal if novelService.getNovel fails
  test('shows error modal if novelService.getNovel fails', async () => {
    const errorMsg = 'Failed to load novels.';
    getNovel.mockRejectedValue(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  // Test 7: shows error modal if reviewService.getReviewsByNovelId fails
  test('shows error modal if reviewService.getReviewsByNovelId fails', async () => {
    const errorMsg = 'Failed to fetch reviews.';
    getReviewsByNovelId.mockRejectedValue(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });


  // Test 8: shows error modal if commentService.getCommentsByNovelId fails
  test('shows error modal if commentService.getCommentsByNovelId fails', async () => {
    const errorMsg = 'Failed to fetch comments.';
    getCommentsByNovelId.mockRejectedValue(new Error(errorMsg));

    renderComponent();

    // Wait for initial reviews to load
    await waitFor(() => {
      expect(screen.getByText('Review content 1')).toBeInTheDocument();
    });

    // Switch to comments tab
    fireEvent.click(screen.getByTestId('tab-comments'));

    // Wait for error modal
    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  // Test 9: infinite scroll for reviews stops when no more data
  test('infinite scroll for reviews stops when no more data', async () => {
    getReviewsByNovelId
      .mockResolvedValueOnce(mockReviewsPage1)
      .mockResolvedValueOnce(mockReviewsPage2); // Page 2 has < 15 items

    renderComponent();

    // Load page 1
    await waitFor(() => {
      expect(screen.getByText('Review content 15')).toBeInTheDocument();
    });

    // Load page 2
    triggerIntersection();
    await waitFor(() => {
      expect(screen.getByText('Final Review')).toBeInTheDocument();
    });

    // Reset call counts
    jest.clearAllMocks();

    // Trigger intersection again
    triggerIntersection();

    // Wait briefly to ensure no new calls are made
    await (async () => new Promise(res => setTimeout(res, 50)))();

    // No new API calls should be made
    expect(getReviewsByNovelId).not.toHaveBeenCalled();
    expect(screen.queryByTestId('list-spinner')).not.toBeInTheDocument();
  });
});