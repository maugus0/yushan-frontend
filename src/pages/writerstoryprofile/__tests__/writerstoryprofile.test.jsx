import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import WriterStoryProfile from '../writerstoryprofile';
import dayjs from 'dayjs';

// --- MOCK SETUP ---

// FIX 1: Ensure window.location.search is explicitly defined for URLSearchParams instantiation.
Object.defineProperty(window, 'location', {
  value: {
    search: '?id=story-123', // Default search string for instantiation
  },
  writable: true,
});

// Mocking Services (The paths are adjusted based on the original component structure)
jest.mock('../../../services/novel', () => ({
  getNovelById: jest.fn(),
}));
jest.mock('../../../services/chapter', () => ({
  getChapterByNovelId: jest.fn(),
  deleteChapterByChapterId: jest.fn(),
}));

// Get references to the mocked functions for test configuration
const NovelService = require('../../../services/novel');
const ChapterService = require('../../../services/chapter');

// Mock react-router-dom hooks
const mockedNavigate = jest.fn();
const mockLocation = { key: 'test-key-1' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => mockLocation,
}));

// Mock Ant Design Components using the format provided in the example
var mockAntdMessage = { success: jest.fn(), error: jest.fn() };

jest.mock('antd', () => {
  // ... (Your Antd Mock implementation remains here)
  const React = jest.requireActual('react');
  const antd = jest.requireActual('antd');
  // ... (MockModal and MockSpin definitions)

  const MockModal = ({ children, open, onCancel, onOk, footer, title, ...props }) => {
    if (!open) return null;
    const renderFooter = () => {
      if (footer && Array.isArray(footer)) {
        return footer.map((button, i) => <React.Fragment key={i}>{button}</React.Fragment>);
      }
      return (
        <div>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onOk} data-testid="modal-confirm-button">
            OK
          </button>
        </div>
      );
    };
    return (
      <div data-testid="mock-modal" aria-label={title || 'modal'} {...props}>
        {title && <div data-testid="modal-title">{title}</div>}
        <div>{children}</div>
        <div>{renderFooter()}</div>
      </div>
    );
  };
  MockModal.displayName = 'MockModal';
  const MockSpin = ({ children, spinning, tip, 'data-testid': dataTestId, ...props }) => {
    const isSpinning = spinning !== false;
    return isSpinning ? (
      <div data-testid={dataTestId || 'spinner'} {...props}>
        {tip || 'Loading...'}
      </div>
    ) : (
      <>{children}</>
    );
  };
  MockSpin.displayName = 'MockSpin';

  return {
    ...antd,
    Modal: MockModal,
    Spin: MockSpin,
    Button: antd.Button,
    message: mockAntdMessage,
  };
});

// Mock WriterNavbar
jest.mock('../../../components/writer/writernavbar/writernavbar', () => {
  const MockWriterNavbar = () => <div data-testid="writer-navbar">Navbar</div>;
  MockWriterNavbar.displayName = 'MockWriterNavbar';
  return MockWriterNavbar;
});

// Mock Intersection Observer
// Replace your previous IntersectionObserver mock with this class-based mock:

const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

// store the most recent instance so tests can access the callback
let lastIOInstance = null;

class MockIntersectionObserver {
  constructor(callback, options) {
    this._callback = callback;
    this._options = options;
    // keep reference for tests to trigger later
    lastIOInstance = this;
  }

  observe(target) {
    // emulate real behavior: call observe and record via mock
    mockObserve(target);
  }

  unobserve(target) {
    mockUnobserve(target);
  }

  disconnect() {
    mockDisconnect();
  }

  // optionally expose a way to directly trigger the callback
  // e.g. lastIOInstance.trigger([{ isIntersecting: true }])
  trigger(entries) {
    if (this._callback) {
      this._callback(entries, this);
    }
  }
}

// install to window
window.IntersectionObserver = MockIntersectionObserver;

// Helper to trigger the observer callback from tests
const triggerIntersection = (isIntersecting, entries = [{ isIntersecting }]) => {
  if (lastIOInstance && typeof lastIOInstance.trigger === 'function') {
    lastIOInstance.trigger(entries);
  } else {
    throw new Error('No IntersectionObserver instance available to trigger.');
  }
};

// 5. Mock window.location.search and URLSearchParams (The FIX)
const mockGet = jest.fn();
// FIX: Using function constructor to reliably mock URLSearchParams
var MockURLSearchParams = function () {
  return {
    get: mockGet,
  };
};
window.URLSearchParams = MockURLSearchParams;

const mockStory = {
  // ... (mockStory definition)
  uuid: 'story-123',
  title: 'Test Story Title',
  authorUsername: 'testwriter',
  categoryName: 'Fantasy',
  chapterCnt: 2,
  wordCnt: 12000,
  reviewCnt: 5,
  coverImgUrl: null,
};

const PAGE_SIZE = 10;
const mockChaptersPage0 = Array.from({ length: PAGE_SIZE }, (_, i) => ({
  uuid: `chap-${i + 1}`,
  title: `Chapter ${i + 1}`,
  publishTime: dayjs()
    .subtract(i + 1, 'day')
    .toISOString(),
}));

// --- Helper Functions ---

// The renderComponent helper should ensure mockGet is correctly set up for the current test.
const renderComponent = (storyId = 'story-123') => {
  // Set the expected return value for the mocked .get('id') call
  mockGet.mockReturnValue(storyId);

  return render(
    <MemoryRouter>
      <WriterStoryProfile />
    </MemoryRouter>
  );
};

const setupSuccessMocks = (chapters = mockChaptersPage0.slice(0, 2), story = mockStory) => {
  NovelService.getNovelById.mockResolvedValue(story);
  ChapterService.getChapterByNovelId.mockResolvedValue({
    data: { chapters: chapters },
  });
};

// --- TEST SUITE ---

describe('WriterStoryProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mock implementations before each test
    NovelService.getNovelById.mockClear();
    ChapterService.getChapterByNovelId.mockClear();
    ChapterService.deleteChapterByChapterId.mockClear();
    mockAntdMessage.success.mockClear();
    mockAntdMessage.error.mockClear();
    setupSuccessMocks();
    // Ensure Intersection Observer mocks are clean for each test run
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
  });

  // test1
  test('should show Spin on loading and display story details after success', async () => {
    const chapters = mockChaptersPage0.slice(0, 2);
    setupSuccessMocks(chapters);
    renderComponent();

    await waitFor(() => {
      // Check if story title is rendered
      expect(screen.getByText(mockStory.title)).toBeInTheDocument();
      // Check if loading spin is gone
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // Verify API calls
    expect(NovelService.getNovelById).toHaveBeenCalledWith('story-123');
    expect(ChapterService.getChapterByNovelId).toHaveBeenCalledWith('story-123', 0, PAGE_SIZE);
  });

  // test2
  test('should handle missing storyId and skip API calls', () => {
    renderComponent(null);
    // Verify API calls were not made
    expect(NovelService.getNovelById).not.toHaveBeenCalled();
    expect(ChapterService.getChapterByNovelId).not.toHaveBeenCalled();
  });

  // test3
  test('should show error modal if initial data fetch fails', async () => {
    const errorMsg = 'Failed to load initial data.';
    NovelService.getNovelById.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(okButton);
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  // test4
  test('should show error modal if delete chapter fails', async () => {
    const errorMsg = 'Failed to delete chapter.';
    setupSuccessMocks(mockChaptersPage0.slice(0, 1));
    ChapterService.deleteChapterByChapterId.mockRejectedValueOnce(new Error(errorMsg));

    renderComponent();
    await waitFor(() => expect(screen.getAllByText('DELETE').length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByText('DELETE')[0]);

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(okButton);
  });

  test('navigates to workspace on back button click', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Test Story Title'));
    fireEvent.click(screen.getByTestId('back-button'));
    expect(mockedNavigate).toHaveBeenCalledWith('/writerworkspace');
  });

  // test6
  test('navigates to create chapters page', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Test Story Title'));

    fireEvent.click(screen.getByRole('button', { name: /CREATE CHAPTERS/i }));

    expect(mockedNavigate).toHaveBeenCalledWith('/writercreatechapters?id=story-123');
  });

  // test7
  test('navigates to edit page when Edit is clicked', async () => {
    setupSuccessMocks(mockChaptersPage0.slice(0, 1));
    renderComponent();
    await waitFor(() => expect(screen.getAllByText('EDIT').length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByText('EDIT')[0]);

    expect(mockedNavigate).toHaveBeenCalledWith(
      `/writercreatechapters/?novelid=${mockStory.uuid}&chapterid=${mockChaptersPage0[0].uuid}`
    );
  });

  // test8
  test('shows delete confirmation modal when Delete is clicked', async () => {
    setupSuccessMocks(mockChaptersPage0.slice(0, 1));
    renderComponent();
    await waitFor(() => expect(screen.getAllByText('DELETE').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('DELETE')[0]);

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByText('Confirm to delete this chapter?')).toBeInTheDocument();
  });

  // test9
  test('successfully deletes chapter and updates count', async () => {
    const storyWithOneChapter = { ...mockStory, chapterCnt: 1 };
    NovelService.getNovelById.mockResolvedValue(storyWithOneChapter);
    ChapterService.getChapterByNovelId.mockResolvedValue({
      data: { chapters: mockChaptersPage0.slice(0, 1) },
    });
    ChapterService.deleteChapterByChapterId.mockResolvedValue({});
    renderComponent();

    await waitFor(() => expect(screen.getAllByText('DELETE').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('DELETE')[0]);

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(screen.getByTestId('chapter-count')).toHaveTextContent('0');
    });
  });

  // test10
  test('cancels delete confirmation modal', async () => {
    setupSuccessMocks(mockChaptersPage0.slice(0, 1));
    renderComponent();
    await waitFor(() => expect(screen.getAllByText('DELETE').length).toBeGreaterThan(0));

    // Click the DELETE button in the chapter row (not the modal button)
    const chapterDeleteButtons = screen.getAllByText('DELETE');
    fireEvent.click(chapterDeleteButtons[0]);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(ChapterService.deleteChapterByChapterId).not.toHaveBeenCalled();
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  // test12
  test('handles error on loading more chapters', async () => {
    // First call returns 10 chapters
    ChapterService.getChapterByNovelId.mockResolvedValueOnce({
      data: { chapters: mockChaptersPage0 },
    });
    // Second call fails
    const errorMsg = 'Failed to load more chapters.';
    ChapterService.getChapterByNovelId.mockRejectedValueOnce(new Error(errorMsg));
    NovelService.getNovelById.mockResolvedValue(mockStory);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Chapter 10')).toBeInTheDocument();
    });

    triggerIntersection(true);

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(okButton);
  });

  // test13
  test('renders "No chapters" when chaptersData is empty after load', async () => {
    NovelService.getNovelById.mockResolvedValue(mockStory);
    ChapterService.getChapterByNovelId.mockResolvedValue({
      data: { chapters: [] },
    });
    renderComponent();

    // Wait for loading to complete first
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('No chapters.')).toBeInTheDocument();
    });
  });

  // test14
  test('handles valid base64 image URL', async () => {
    const base64Url = 'data:image/jpeg;base64,VGhpcyBpcyBhIHZhbGlkIGJhc2U2NCBpZ25vcmU=';
    setupSuccessMocks(mockChaptersPage0.slice(0, 1), { ...mockStory, coverImgUrl: base64Url });

    renderComponent();

    await waitFor(() => {
      const coverImg = screen.getByAltText('cover');
      expect(coverImg).toHaveAttribute('src', base64Url);
    });
  });

  // test15
  test('handles invalid image URL (falls back to default)', async () => {
    const invalidUrl = 'http://not-base64.com/img.png';
    setupSuccessMocks(mockChaptersPage0.slice(0, 1), { ...mockStory, coverImgUrl: invalidUrl });

    renderComponent();

    await waitFor(() => {
      const coverImg = screen.getByAltText('cover');
      expect(coverImg.src).not.toContain(invalidUrl);
      // Jest mocks require() calls, so we expect the test-file-stub
      expect(coverImg.src).toContain('test-file-stub');
    });
  });

  // test16
  test('checks chapter date formatting', async () => {
    // Use a local time to avoid timezone issues
    const chapterTime = dayjs('2025-01-01 10:00:00');
    const formattedTime = chapterTime.format('YYYY-MM-DD HH:mm:ss');
    setupSuccessMocks([{ uuid: 'chap-1', title: 'Test', publishTime: chapterTime.toISOString() }]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(formattedTime)).toBeInTheDocument();
    });
  });

  // test17
  test('loadingMore state stops intersection observer logic', async () => {
    // First call returns 10 chapters
    ChapterService.getChapterByNovelId.mockResolvedValueOnce({
      data: { chapters: mockChaptersPage0 },
    });
    // Second call hangs (never resolves)
    ChapterService.getChapterByNovelId.mockReturnValue(new Promise(() => {}));
    NovelService.getNovelById.mockResolvedValue(mockStory);

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Chapter 10')).toBeInTheDocument();
    });

    // First intersection trigger should call the API
    triggerIntersection(true);

    await waitFor(() => {
      expect(ChapterService.getChapterByNovelId).toHaveBeenCalledTimes(2);
    });

    // Second intersection trigger should NOT call the API again due to loadingMore state
    triggerIntersection(true);

    expect(ChapterService.getChapterByNovelId).toHaveBeenCalledTimes(2);
  });

  // test18
  test('unmount disconnects IntersectionObserver', async () => {
    setupSuccessMocks(mockChaptersPage0);

    const { unmount } = renderComponent();

    await waitFor(() => {
      expect(mockObserve).toHaveBeenCalled();
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
