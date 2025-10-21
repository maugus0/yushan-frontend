/* global global */
// src/pages/reader/__tests__/reader.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import ReaderPage from '../reader';
import { ReadingSettingsProvider } from '../../../store/readingSettings';
import novelsApi from '../../../services/novels';
import commentsApi from '../../../services/comments';
import historyApi from '../../../services/history';
import { saveProgress, getProgress } from '../../../utils/reader';

// Mock all external dependencies
jest.mock('../../../services/novels');
jest.mock('../../../services/comments');
jest.mock('../../../services/history');
jest.mock('../../../utils/reader');

// Mock Ant Design components
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Button: ({ children, onClick, disabled, loading, icon, type, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-loading={loading}
      data-type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
  Input: {
    TextArea: ({ value, onChange, placeholder, rows, disabled, ...props }) => (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        {...props}
      />
    ),
  },
  Pagination: ({ current, pageSize, total, onChange, ...props }) => (
    <div data-testid="pagination" {...props}>
      <button onClick={() => onChange(current - 1)} disabled={current <= 1}>
        Previous
      </button>
      <span>
        Page {current} of {Math.ceil(total / pageSize)}
      </span>
      <button
        onClick={() => onChange(current + 1)}
        disabled={current >= Math.ceil(total / pageSize)}
      >
        Next
      </button>
    </div>
  ),
  Tooltip: ({ children, title }) => <div title={title}>{children}</div>,
  Popconfirm: ({ children, onConfirm, title, okText, cancelText }) => (
    <div>
      {children}
      <div data-testid="popconfirm">
        <div>{title}</div>
        <button onClick={onConfirm}>{okText}</button>
        <button>{cancelText}</button>
      </div>
    </div>
  ),
  Modal: ({ children, open, onCancel, title, footer, centered }) =>
    open ? (
      <div data-testid="modal" data-centered={centered}>
        <div>{title}</div>
        {children}
        {footer}
        <button onClick={onCancel}>Close</button>
      </div>
    ) : null,
  Checkbox: ({ checked, onChange, children }) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {children}
    </label>
  ),
}));

// Mock icons
jest.mock('@ant-design/icons', () => ({
  LikeOutlined: () => <span data-testid="like-outlined">LikeOutlined</span>,
  LikeFilled: () => <span data-testid="like-filled">LikeFilled</span>,
  EditOutlined: () => <span data-testid="edit-outlined">EditOutlined</span>,
  DeleteOutlined: () => <span data-testid="delete-outlined">DeleteOutlined</span>,
}));

// Mock Redux store
const mockStore = configureMockStore([]);
const mockUser = {
  uuid: 'test-user-123',
  username: 'testuser',
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window methods
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
});

Object.defineProperty(document, 'documentElement', {
  value: {
    scrollTop: 0,
    scrollHeight: 1000,
    style: {
      removeProperty: jest.fn(),
      setProperty: jest.fn(),
    },
  },
});

Object.defineProperty(window, 'innerHeight', {
  value: 800,
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Helper function to render component with providers
const renderWithProviders = (
  component,
  { store = mockStore({ user: { user: mockUser } }) } = {}
) => {
  return render(
    <Provider store={store}>
      <ReadingSettingsProvider>
        <MemoryRouter initialEntries={['/read/123/1']}>
          <Routes>
            <Route path="/read/:novelId/:chapterId" element={component} />
          </Routes>
        </MemoryRouter>
      </ReadingSettingsProvider>
    </Provider>
  );
};

describe('ReaderPage', () => {
  const mockChapter = {
    id: 'chapter-123',
    title: 'Test Chapter',
    content: '<p>This is test content</p>',
    previousChapterId: 'prev-123',
    nextChapterId: 'next-123',
    previousChapterUuid: 'prev-uuid-123',
    nextChapterUuid: 'next-uuid-123',
  };

  const mockComments = [
    {
      id: 'comment-1',
      content: 'Great chapter!',
      username: 'user1',
      userId: 'user-1',
      createTime: '2023-01-01T00:00:00Z',
      likeCnt: 5,
      liked: false,
      isSpoiler: false,
    },
    {
      id: 'comment-2',
      content: 'Spoiler comment',
      username: 'user2',
      userId: 'user-2',
      createTime: '2023-01-02T00:00:00Z',
      likeCnt: 2,
      liked: true,
      isSpoiler: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});

    // Mock successful API calls
    novelsApi.getChapterContent.mockResolvedValue(mockChapter);
    novelsApi.getChapterByUuid.mockResolvedValue({ chapterNumber: 2, id: 'chapter-456' });
    commentsApi.listByChapter.mockResolvedValue({
      comments: mockComments,
      totalCount: 2,
    });
    historyApi.recordRead.mockResolvedValue({});
    commentsApi.create.mockResolvedValue({});
    commentsApi.like.mockResolvedValue({ likeCnt: 6 });
    commentsApi.unlike.mockResolvedValue({ likeCnt: 4 });
    commentsApi.edit.mockResolvedValue({});
    commentsApi.delete.mockResolvedValue({});

    // Mock progress utilities
    getProgress.mockReturnValue(null);
    saveProgress.mockImplementation(() => {});
  });

  describe('Component Rendering', () => {
    test('renders loading state initially', () => {
      renderWithProviders(<ReaderPage />);
      expect(screen.getAllByText('Loading...')).toHaveLength(2);
    });

    test('renders chapter content after loading', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      expect(screen.getByText('This is test content')).toBeInTheDocument();
    });

    test('renders back button with correct link', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        const backLink = screen.getByText('← Back');
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/novel/123');
      });
    });

    test('renders settings panel button', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Aa')).toBeInTheDocument();
      });
    });

    test('renders progress bar', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        const progressBar = document.querySelector('.reader-progress-bar');
        expect(progressBar).toBeInTheDocument();
      });
    });

    test('renders navigation buttons', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('← Previous')).toBeInTheDocument();
        expect(screen.getByText('Next →')).toBeInTheDocument();
      });
    });

    test('renders comments sidebar', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Chapter Comments (2)')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Panel', () => {
    test('opens settings panel when Aa button is clicked', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      const settingsButton = screen.getByText('Aa');
      fireEvent.click(settingsButton);

      expect(screen.getByText('Font Size (18px)')).toBeInTheDocument();
      expect(screen.getByText('Font Family')).toBeInTheDocument();
    });

    test('closes settings panel when close button is clicked', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      // Open panel
      fireEvent.click(screen.getByText('Aa'));
      expect(screen.getByText('Font Size (18px)')).toBeInTheDocument();

      // Close panel
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByText('Font Size (18px)')).not.toBeInTheDocument();
    });

    test('updates font size when slider is changed', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      // Open panel
      fireEvent.click(screen.getByText('Aa'));

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '20' } });

      expect(screen.getByText('Font Size (20px)')).toBeInTheDocument();
    });

    test('updates font family when select is changed', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      // Open panel
      fireEvent.click(screen.getByText('Aa'));

      const select = screen.getByDisplayValue('Serif (Georgia)');
      fireEvent.change(select, { target: { value: 'sans' } });

      expect(select.value).toBe('sans');
    });
  });

  describe('Navigation', () => {
    test('navigates to previous chapter when previous button is clicked', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      const prevButton = screen.getByText('← Previous');
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(novelsApi.getChapterByUuid).toHaveBeenCalledWith('prev-uuid-123');
      });
    });

    test('navigates to next chapter when next button is clicked', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next →');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(novelsApi.getChapterByUuid).toHaveBeenCalledWith('next-uuid-123');
      });
    });

    test('disables previous button when no previous chapter', async () => {
      const chapterWithoutPrev = { ...mockChapter, previousChapterUuid: null };
      novelsApi.getChapterContent.mockResolvedValueOnce(chapterWithoutPrev);

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        const prevButton = screen.getByText('← Previous');
        expect(prevButton).toBeDisabled();
      });
    });

    test('disables next button when no next chapter', async () => {
      const chapterWithoutNext = { ...mockChapter, nextChapterUuid: null };
      novelsApi.getChapterContent.mockResolvedValueOnce(chapterWithoutNext);

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        const nextButton = screen.getByText('Next →');
        expect(nextButton).toBeDisabled();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('closes settings panel when Escape is pressed', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      // Open panel
      fireEvent.click(screen.getByText('Aa'));
      expect(screen.getByText('Font Size (18px)')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Font Size (18px)')).not.toBeInTheDocument();
    });
  });

  describe('Comments Functionality', () => {
    test('displays comments in sidebar', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Great chapter!')).toBeInTheDocument();
        expect(screen.getByText('Spoiler comment')).toBeInTheDocument();
        expect(screen.getByText('(Spoiler)')).toBeInTheDocument();
      });
    });

    test('submits new comment', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Write a comment');
      fireEvent.change(textarea, { target: { value: 'New comment' } });

      const submitButton = screen.getByText('Add Comment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(commentsApi.create).toHaveBeenCalledWith({
          chapterId: 'chapter-123',
          content: 'New comment',
        });
      });
    });

    test('shows error when comment submission fails', async () => {
      commentsApi.create.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Write a comment');
      fireEvent.change(textarea, { target: { value: 'New comment' } });

      const submitButton = screen.getByText('Add Comment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('likes a comment', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Great chapter!')).toBeInTheDocument();
      });

      const likeButton = screen.getByText('5');
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(commentsApi.like).toHaveBeenCalledWith('comment-1');
      });
    });

    test('shows edit and delete buttons for own comments', async () => {
      const ownComment = {
        ...mockComments[0],
        userId: 'test-user-123',
        isOwnComment: true,
      };
      commentsApi.listByChapter.mockResolvedValueOnce({
        comments: [ownComment],
        totalCount: 1,
      });

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByTestId('edit-outlined')).toBeInTheDocument();
        expect(screen.getByTestId('delete-outlined')).toBeInTheDocument();
      });
    });

    test('opens edit modal when edit button is clicked', async () => {
      const ownComment = {
        ...mockComments[0],
        userId: 'test-user-123',
        isOwnComment: true,
      };
      commentsApi.listByChapter.mockResolvedValueOnce({
        comments: [ownComment],
        totalCount: 1,
      });

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByTestId('edit-outlined')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-outlined'));

      expect(screen.getByText('Edit your comment')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Great chapter!')).toBeInTheDocument();
    });

    test('submits edited comment', async () => {
      const ownComment = {
        ...mockComments[0],
        userId: 'test-user-123',
        isOwnComment: true,
      };
      commentsApi.listByChapter.mockResolvedValueOnce({
        comments: [ownComment],
        totalCount: 1,
      });

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByTestId('edit-outlined')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-outlined'));

      const editTextarea = screen.getByDisplayValue('Great chapter!');
      fireEvent.change(editTextarea, { target: { value: 'Updated comment' } });

      const saveButton = screen.getByText('SAVE');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(commentsApi.edit).toHaveBeenCalledWith('comment-1', {
          content: 'Updated comment',
          isSpoiler: false,
        });
      });
    });

    test('deletes a comment', async () => {
      const ownComment = {
        ...mockComments[0],
        userId: 'test-user-123',
        isOwnComment: true,
      };
      commentsApi.listByChapter.mockResolvedValueOnce({
        comments: [ownComment],
        totalCount: 1,
      });

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByTestId('delete-outlined')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('delete-outlined'));

      const confirmButton = screen.getByText('Yes');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(commentsApi.delete).toHaveBeenCalledWith('comment-1');
      });
    });
  });

  describe('Progress Tracking', () => {
    test('restores progress from localStorage', async () => {
      const savedProgress = {
        novelId: '123',
        chapterId: 1,
        progress: 0.5,
        scrollOffset: 200,
      };
      getProgress.mockReturnValue(savedProgress);

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 200);
      });
    });

    test('saves progress on page unload', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      fireEvent(window, new Event('beforeunload'));
      expect(saveProgress).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles chapter loading error', async () => {
      novelsApi.getChapterContent.mockRejectedValueOnce(new Error('Chapter not found'));

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    test('handles comments loading error', async () => {
      commentsApi.listByChapter.mockRejectedValueOnce(new Error('Comments not found'));

      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      // Comments should still be displayed (empty state)
      expect(screen.getByText('Chapter Comments (0)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByLabelText('Chapter comments sidebar')).toBeInTheDocument();
    });

    test('settings panel has proper ARIA attributes', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      const settingsButton = screen.getByText('Aa');
      expect(settingsButton).toHaveAttribute('aria-haspopup', 'dialog');
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Responsive Behavior', () => {
    test('applies correct CSS variables for font settings', async () => {
      renderWithProviders(<ReaderPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument();
      });

      const readerPage = screen.getByText('Test Chapter').closest('.reader-page');
      expect(readerPage).toHaveStyle({
        '--_reader-font-size': '18px',
        '--_reader-font-family': 'Georgia, "Times New Roman", serif',
      });
    });
  });
});
