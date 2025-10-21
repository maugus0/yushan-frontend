import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Library from '../library';
import libraryService from '../../../services/library';
import historyService from '../../../services/history';

// --- MOCK SETUP ---

// FIX 1: Mock image imports
jest.mock('../../assets/images/novel_default.png', () => 'novel_default.png');

// Mock Services
jest.mock('../../../services/library');
jest.mock('../../../services/history');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock @ant-design/icons
jest.mock('@ant-design/icons', () => ({
  EditOutlined: () => <span data-testid="icon-edit">Edit</span>,
  CheckCircleFilled: () => <span data-testid="icon-check">Check</span>,
  RightOutlined: () => <span data-testid="icon-right">Right</span>,
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
const mockObserverInstance = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
};

// Create a global callback storage
let globalCallback = null;

mockIntersectionObserver.mockImplementation((callback) => {
  globalCallback = callback;
  return mockObserverInstance;
});

window.IntersectionObserver = mockIntersectionObserver;

// Helper function to trigger intersection
const triggerIntersection = () => {
  if (globalCallback) {
    globalCallback([{ isIntersecting: true }]);
  }
};

// Mock antd (Enhanced Mock)
jest.mock('antd', () => {
  const React = jest.requireActual('react');
  const antd = jest.requireActual('antd');

  // Button
  const MockButton = ({ children, onClick, icon, disabled, type, size, danger, ...props }) => (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      data-danger={danger}
      data-size={size}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
  MockButton.displayName = 'MockButton';

  // Typography
  const MockTypography = ({ children, level, type, className, ...props }) => {
    const Tag = level ? `h${level}` : 'span';
    return React.createElement(Tag, { className, ...props }, children);
  };
  MockTypography.Title = ({ children, level, className, ...props }) => {
    const Tag = `h${level || 1}`;
    return React.createElement(Tag, { className, ...props }, children);
  };
  MockTypography.Title.displayName = 'MockTitle';
  MockTypography.Text = ({ children, type, className, ...props }) => (
    <span className={className} data-type={type} {...props}>
      {children}
    </span>
  ); MockTypography.Text.displayName = 'MockText';

  // Modal
  const MockModal = ({
    children,
    open,
    onCancel,
    footer,
    centered,
    closable,
    maskClosable,
    style,
    ...props
  }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-modal" style={style} {...props}>
        <div>{children}</div>
        {footer && <div>{footer}</div>}
      </div>
    );
  };
  MockModal.displayName = 'MockModal';

  // Spin
  const MockSpin = ({ children, spinning, size, tip, ...props }) => {
    const isSpinning = spinning !== false;
    return isSpinning ? (
      <div data-testid="spinner" data-size={size} {...props}>
        {tip || 'Loading...'}
      </div>
    ) : (
      <>{children}</>
    );
  };
  MockSpin.displayName = 'MockSpin';

  return {
    ...antd,
    Button: MockButton,
    Typography: MockTypography,
    Modal: MockModal,
    Spin: MockSpin,
  };
});

describe('Library Component', () => {
  // --- Mock Data ---
  const mockLibraryNovels = [
    {
      novelId: 'novel-1',
      novelTitle: 'Test Novel 1',
      novelCover: 'data:image/png;base64,test-cover-1',
      chapterNumber: 5,
      chapterCnt: 20,
    },
    {
      novelId: 'novel-2',
      novelTitle: 'Test Novel 2',
      novelCover: 'data:image/png;base64,test-cover-2',
      chapterNumber: 10,
      chapterCnt: 15,
    },
    {
      novelId: 'novel-3',
      novelTitle: 'Test Novel 3',
      novelCover: null,
      chapterNumber: 3,
      chapterCnt: 25,
    },
  ];

  const mockLibraryNovelsPageSize = [
    ...mockLibraryNovels,
    { novelId: 'novel-4', novelTitle: 'Test Novel 4', chapterNumber: 1, chapterCnt: 10 },
    { novelId: 'novel-5', novelTitle: 'Test Novel 5', chapterNumber: 1, chapterCnt: 10 },
  ]

  const mockHistoryList = [
    {
      historyId: 'history-1',
      id: 'history-1',
      novelId: 'novel-1',
      novelTitle: 'History Novel 1',
      novelCover: 'data:image/png;base64,history-cover-1',
      chapterNumber: 8,
      chapterCnt: 20,
      categoryName: 'Fantasy',
      novelAuthor: 'Author 1',
    },
    {
      historyId: 'history-2',
      id: 'history-2',
      novelId: 'novel-2',
      novelTitle: 'History Novel 2',
      novelCover: null,
      chapterNumber: 12,
      chapterCnt: 15,
      categoryName: 'Sci-Fi',
      novelAuthor: 'Author 2',
    },
  ];

  const mockHistoryListPageSize = [
    ...mockHistoryList,
    { historyId: 'history-3', id: 'history-3', novelId: 'novel-3', novelTitle: 'History Novel 3' },
    { historyId: 'history-4', id: 'history-4', novelId: 'novel-4', novelTitle: 'History Novel 4' },
    { historyId: 'history-5', id: 'history-5', novelId: 'novel-5', novelTitle: 'History Novel 5' },
  ]

  const mockLibraryResponse = {
    data: {
      content: mockLibraryNovelsPageSize,
    },
  };

  const mockHistoryResponse = {
    content: mockHistoryListPageSize,
  };

  // --- Helper Functions ---
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Library />
      </MemoryRouter>
    );
  };

  const setupSuccessfulMocks = () => {
    libraryService.getLibraryNovels.mockResolvedValue(mockLibraryResponse);
    historyService.getHistoryNovels.mockResolvedValue(mockHistoryResponse);
    libraryService.deleteNovelFromLibrary.mockResolvedValue({});
    historyService.deleteHistoryById.mockResolvedValue({});
    historyService.clearHistory.mockResolvedValue({});
  };

  beforeEach(() => {
    jest.resetAllMocks();

    mockIntersectionObserver.mockImplementation((callback) => {
      globalCallback = callback;
      return mockObserverInstance;
    });
    setupSuccessfulMocks();

    mockNavigate.mockClear();
    mockObserverInstance.observe.mockClear();
    mockObserverInstance.unobserve.mockClear();
    mockObserverInstance.disconnect.mockClear();
    globalCallback = null;
  });
  // --- BASIC RENDERING TESTS ---

  //test1
  test('renders library page with initial loading state', () => {
    libraryService.getLibraryNovels.mockImplementation(() => new Promise(() => { }));
    renderComponent();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Library');
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  //test2
  test('renders library tab as active by default', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Library');

    const libraryTab = screen.getByText('Library', { selector: 'div.library-tab' });
    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });

    expect(libraryTab).toBeInTheDocument();
    expect(historyTab).toBeInTheDocument();
    expect(libraryTab).toHaveClass('active');
    expect(historyTab).not.toHaveClass('active');
  });

  //test3
  test('renders library novels list after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    expect(screen.getByText('Test Novel 2')).toBeInTheDocument();
    expect(screen.getByText('Test Novel 3')).toBeInTheDocument();
    expect(screen.getByText('Progress 5/20')).toBeInTheDocument();
    expect(screen.getByText('Progress 10/15')).toBeInTheDocument();
    expect(screen.getByText('Progress 3/25')).toBeInTheDocument();
  });

  //test4
  test('renders edit button in library tab', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /EDIT/i })).toBeInTheDocument();
  });

  // --- TAB SWITCHING TESTS ---

  //test5
  test('switches to history tab and loads history data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();

    expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    expect(screen.getByText('History Novel 2')).toBeInTheDocument();
    expect(screen.getByText('[Fantasy]')).toBeInTheDocument();
    expect(screen.getByText('by Author 1')).toBeInTheDocument();

    expect(historyTab).toHaveClass('active');
    expect(screen.getByText('Library', { selector: 'div.library-tab' })).not.toHaveClass('active');
  });

  //test6
  test('switches back to library tab', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    expect(screen.queryByText('Test Novel 1')).not.toBeInTheDocument();

    const libraryTab = screen.getByText('Library', { selector: 'div.library-tab' });
    fireEvent.click(libraryTab);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    expect(screen.queryByText('History Novel 1')).not.toBeInTheDocument();
  });

  // --- LIBRARY OPERATIONS TESTS ---

  //test7
  test('enters edit mode when edit button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }));

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /EDIT/i })).not.toBeInTheDocument();
  });

  //test8
  test('selects and deselects novels in edit mode', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }));
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();

    fireEvent.click(screen.getByText('Test Novel 1'));

    expect(screen.getByRole('button', { name: 'Remove' })).not.toBeDisabled();

    fireEvent.click(screen.getByText('Test Novel 1'));

    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();
  });

  //test9
  test('removes selected novels from library', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }));
    fireEvent.click(screen.getByText('Test Novel 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(screen.queryByText('Test Novel 1')).not.toBeInTheDocument();
    });

    expect(libraryService.deleteNovelFromLibrary).toHaveBeenCalledWith('novel-1');
    expect(screen.getByText('Test Novel 2')).toBeInTheDocument();
  });

  //test10
  test('cancels edit mode', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }));

    fireEvent.click(screen.getByText('Test Novel 1'));

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('button', { name: /EDIT/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  //test11
  test('navigates to novel reader when novel is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Novel 1'));

    expect(mockNavigate).toHaveBeenCalledWith('/read/novel-1/5');
  });

  // --- HISTORY OPERATIONS TESTS ---

  //test12
  test('renders clear all history button in history tab', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /CLEAR ALL HISTORY/i })).toBeInTheDocument();
  });

  //test13
  test('clears all history when clear button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /CLEAR ALL HISTORY/i }));

    await waitFor(() => {
      expect(screen.getByText('No data.')).toBeInTheDocument();
    });

    expect(historyService.clearHistory).toHaveBeenCalled();
    expect(screen.queryByText('History Novel 1')).not.toBeInTheDocument();
  });

  //test14
  test('deletes individual history item', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('History Novel 1')).not.toBeInTheDocument();
    });

    expect(historyService.deleteHistoryById).toHaveBeenCalledWith('history-1');
    expect(screen.getByText('History Novel 2')).toBeInTheDocument(); // 确认其他项仍然存在
  });

  //test15
  test('navigates to novel reader when history item is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('History Novel 1'));

    expect(mockNavigate).toHaveBeenCalledWith('/read/novel-1/8');
  });

  // --- INFINITE SCROLL TESTS ---

  //test16
  test('loads more library novels when scrolling to bottom', async () => {
    const additionalNovels = [
      {
        novelId: 'novel-6',
        novelTitle: 'Test Novel 6 (Page 2)',
        novelCover: 'data:image/png;base64,test-cover-6',
        chapterNumber: 7,
        chapterCnt: 30,
      },
    ];

    libraryService.getLibraryNovels
      .mockResolvedValueOnce(mockLibraryResponse) // First load (page 0)
      .mockResolvedValueOnce({ 					// Second load (page 1)
        data: {
          content: additionalNovels,
        },
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    expect(libraryService.getLibraryNovels).toHaveBeenCalledTimes(1);

    triggerIntersection();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 6 (Page 2)')).toBeInTheDocument();
    });

    expect(libraryService.getLibraryNovels).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
  });

  //test17
  test('loads more history items when scrolling to bottom', async () => {
    const additionalHistory = [
      {
        historyId: 'history-6',
        id: 'history-6',
        novelId: 'novel-6',
        novelTitle: 'History Novel 6 (Page 2)',
        chapterNumber: 1,
        chapterCnt: 10,
      },
    ];

    historyService.getHistoryNovels
      .mockResolvedValueOnce(mockHistoryResponse) // First load (page 0)
      .mockResolvedValueOnce({ 					// Second load (page 1)
        content: additionalHistory,
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    expect(historyService.getHistoryNovels).toHaveBeenCalledTimes(1);

    triggerIntersection();

    await waitFor(() => {
      expect(screen.getByText('History Novel 6 (Page 2)')).toBeInTheDocument();
    });

    expect(historyService.getHistoryNovels).toHaveBeenCalledTimes(2);
    expect(screen.getByText('History Novel 1')).toBeInTheDocument();
  });

  //test18
  test('stops loading more when no more data available', async () => {
    const limitedNovels = [mockLibraryNovels[0]]; // Only 1 item
    libraryService.getLibraryNovels.mockResolvedValue({
      data: {
        content: limitedNovels,
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    expect(libraryService.getLibraryNovels).toHaveBeenCalledTimes(1);

    triggerIntersection();

    await new Promise((r) => setTimeout(r, 50));

    expect(libraryService.getLibraryNovels).toHaveBeenCalledTimes(1);
  });

  // --- ERROR HANDLING TESTS ---

  //test19
  test('shows error modal when library loading fails', async () => {
    const error = new Error('Failed to load library');
    libraryService.getLibraryNovels.mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load library')).toBeInTheDocument();
  });

  //test20
  test('shows error modal when history loading fails', async () => {
    const error = new Error('Failed to load history');
    historyService.getHistoryNovels.mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load history')).toBeInTheDocument();
  });

  //test21
  test('shows error modal when removing novels fails', async () => {
    const error = new Error('Failed to remove novels');
    libraryService.deleteNovelFromLibrary.mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }));
    fireEvent.click(screen.getByText('Test Novel 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to remove novels')).toBeInTheDocument();
  });

  //test22
  test('shows error modal when deleting history fails', async () => {
    const error = new Error('Failed to delete history');
    historyService.deleteHistoryById.mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to delete history')).toBeInTheDocument();
  });

  //test23
  test('shows error modal when clearing history fails', async () => {
    const error = new Error('Failed to clear history');
    historyService.clearHistory.mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('History Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /CLEAR ALL HISTORY/i }));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to clear history')).toBeInTheDocument();
  });

  //test24
  test('closes error modal when confirm button is clicked', async () => {
    libraryService.getLibraryNovels.mockRejectedValue(new Error('Test error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  // --- EDGE CASES AND BOUNDARY TESTS ---

  //test25
  test('renders no data message when library is empty', async () => {
    libraryService.getLibraryNovels.mockResolvedValue({
      data: {
        content: [],
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No data.')).toBeInTheDocument();
  });

  //test26
  test('renders no data message when history is empty', async () => {
    historyService.getHistoryNovels.mockResolvedValue({
      content: [],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No data.')).toBeInTheDocument();
  });

  //test27
  test('handles novels with invalid cover images', async () => {
    const novelsWithInvalidCover = [
      {
        novelId: 'novel-invalid',
        novelTitle: 'Invalid Cover Novel',
        novelCover: 'invalid-base64-string', // Invalid base64 URL
        chapterNumber: 1,
        chapterCnt: 10,
      },
    ];

    libraryService.getLibraryNovels.mockResolvedValue({
      data: {
        content: novelsWithInvalidCover,
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Invalid Cover Novel')).toBeInTheDocument();
    });

    const img = screen.getByAltText('Invalid Cover Novel');
    expect(img.src).toContain('novel_default.png');
  });

  //test28
  test('handles history items with missing fields', async () => {
    const incompleteHistory = [
      {
        historyId: 'history-incomplete',
        novelId: 'novel-incomplete',
        novelTitle: 'Incomplete History',
        chapterNumber: 5,
        chapterCnt: 20,
        // Missing categoryName and novelAuthor
      },
    ];

    historyService.getHistoryNovels.mockResolvedValue({
      content: incompleteHistory,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('History', { selector: 'div.library-tab' }));

    await waitFor(() => {
      expect(screen.getByText('Incomplete History')).toBeInTheDocument();
    });

    expect(screen.getByText('Progress: 5/20')).toBeInTheDocument();
    expect(screen.queryByText(/by/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\[/i)).not.toBeInTheDocument();
  });

  //test29
  test('handles multiple novel selection and removal', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }));

    fireEvent.click(screen.getByText('Test Novel 1'));
    fireEvent.click(screen.getByText('Test Novel 2'));

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(screen.queryByText('Test Novel 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Novel 2')).not.toBeInTheDocument();
    });

    expect(libraryService.deleteNovelFromLibrary).toHaveBeenCalledWith('novel-1');
    expect(libraryService.deleteNovelFromLibrary).toHaveBeenCalledWith('novel-2');
    expect(libraryService.deleteNovelFromLibrary).toHaveBeenCalledTimes(2);

    expect(screen.getByText('Test Novel 3')).toBeInTheDocument();
  });

  //test30
  test('handles generic error messages', async () => {
    libraryService.getLibraryNovels.mockRejectedValue(new Error());

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load library.')).toBeInTheDocument();
  });

  //test31
  test('prevents intersection observer from triggering when list loading', async () => {
    libraryService.getLibraryNovels.mockImplementation(
      () => new Promise(() => { })
    );
    renderComponent();

    expect(libraryService.getLibraryNovels).toHaveBeenCalledTimes(1);

    triggerIntersection();

    await new Promise((r) => setTimeout(r, 50));

    expect(libraryService.getLibraryNovels).toHaveBeenCalledTimes(1);
  });

  //test32
  test('handles history items with different ID field names', async () => {
    const historyWithDifferentId = [
      {
        id: 'different-id', // Only 'id', no 'historyId'
        novelId: 'novel-different',
        novelTitle: 'Different ID History',
        chapterNumber: 3,
        chapterCnt: 15,
      },
    ];

    historyService.getHistoryNovels.mockResolvedValue({
      content: historyWithDifferentId,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
    });

    const historyTab = screen.getByText('History', { selector: 'div.library-tab' });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('Different ID History')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(historyService.deleteHistoryById).toHaveBeenCalledWith('different-id');
    });
  });
});