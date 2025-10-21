import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import WriterWorkspace from '../writerworkspace';

// --- MOCK SETUP ---

// Mock window.location.search for URLSearchParams
Object.defineProperty(window, 'location', {
  value: {
    search: '',
  },
  writable: true,
});

// Mock Services
jest.mock('../../../services/novel', () => ({
  getNovel: jest.fn(),
  hideNovelById: jest.fn(),
  unHideNovelById: jest.fn(),
  deleteNovelById: jest.fn(),
  changeNovelDetailById: jest.fn(),
}));

jest.mock('../../../services/user', () => ({
  getMe: jest.fn(),
}));

// Get references to mocked functions
const NovelService = require('../../../services/novel');
const UserService = require('../../../services/user');

// Mock react-router-dom hooks
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock Ant Design Components
var mockAntdMessage = { success: jest.fn(), error: jest.fn() };

jest.mock('antd', () => {
  const React = jest.requireActual('react');
  const antd = jest.requireActual('antd');

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

  const MockDropdown = ({ children, overlay }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleClick = () => {
      setIsOpen(!isOpen);
    };

    return (
      <div>
        <div onClick={handleClick} data-testid="dropdown-trigger">
          {children}
        </div>
        {isOpen && overlay && <div data-testid="dropdown-menu">{overlay}</div>}
      </div>
    );
  };
  MockDropdown.displayName = 'MockDropdown';

  const MockMenu = ({ items, onClick }) => {
    return (
      <div data-testid="menu">
        {items.map((item, index) => (
          <div
            key={item.key || index}
            onClick={() => onClick && onClick({ key: item.key })}
            data-testid={`menu-item-${item.key}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  };
  MockMenu.displayName = 'MockMenu';

  return {
    ...antd,
    Modal: MockModal,
    Spin: MockSpin,
    Dropdown: MockDropdown,
    Menu: MockMenu,
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
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

let lastIOInstance = null;

class MockIntersectionObserver {
  constructor(callback, options) {
    this._callback = callback;
    this._options = options;
    lastIOInstance = this;
  }

  observe(target) {
    mockObserve(target);
  }

  unobserve(target) {
    mockUnobserve(target);
  }

  disconnect() {
    mockDisconnect();
  }

  trigger(entries) {
    if (this._callback) {
      this._callback(entries, this);
    }
  }
}

window.IntersectionObserver = MockIntersectionObserver;

const triggerIntersection = (isIntersecting, entries = [{ isIntersecting }]) => {
  if (lastIOInstance && typeof lastIOInstance.trigger === 'function') {
    lastIOInstance.trigger(entries);
  } else {
    throw new Error('No IntersectionObserver instance available to trigger.');
  }
};

// --- TEST DATA ---

const PAGE_SIZE = 10;

const mockUser = {
  uuid: 'user-123',
  username: 'testwriter',
};

const mockStories = Array.from({ length: PAGE_SIZE }, (_, i) => ({
  id: `story-${i + 1}`,
  title: `Test Story ${i + 1}`,
  chapterCnt: i + 1,
  wordCnt: (i + 1) * 1000,
  status:
    i % 4 === 0 ? 'DRAFT' : i % 4 === 1 ? 'HIDDEN' : i % 4 === 2 ? 'UNDER_REVIEW' : 'PUBLISHED',
  isCompleted: i % 3 === 0,
  coverImgUrl: i % 2 === 0 ? 'data:image/jpeg;base64,test' : null,
}));

const mockStoriesPage2 = Array.from({ length: 5 }, (_, i) => ({
  id: `story-${i + 11}`,
  title: `Test Story ${i + 11}`,
  chapterCnt: i + 11,
  wordCnt: (i + 11) * 1000,
  status: 'PUBLISHED',
  isCompleted: false,
  coverImgUrl: null,
}));

// --- HELPER FUNCTIONS ---

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <WriterWorkspace />
    </MemoryRouter>
  );
};

const setupSuccessMocks = (stories = mockStories) => {
  UserService.getMe.mockResolvedValue(mockUser);
  NovelService.getNovel.mockResolvedValue(stories);
};

// --- TEST SUITE ---

describe('WriterWorkspace Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    UserService.getMe.mockClear();
    NovelService.getNovel.mockClear();
    NovelService.hideNovelById.mockClear();
    NovelService.unHideNovelById.mockClear();
    NovelService.deleteNovelById.mockClear();
    NovelService.changeNovelDetailById.mockClear();
    mockAntdMessage.success.mockClear();
    mockAntdMessage.error.mockClear();
    mockedNavigate.mockClear();
    setupSuccessMocks();
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
  });

  // --- BASIC RENDERING TESTS ---

  test('should render workspace with navbar and header', async () => {
    renderComponent();

    expect(screen.getByTestId('writer-navbar')).toBeInTheDocument();
    expect(screen.getByText('Stories')).toBeInTheDocument();
    expect(screen.getByText('+ CREATE STORIES')).toBeInTheDocument();
  });

  test('should show loading spinner on initial load', () => {
    UserService.getMe.mockReturnValue(new Promise(() => {})); // Never resolves
    NovelService.getNovel.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('should display stories after successful load', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
      expect(screen.getByText('Test Story 2')).toBeInTheDocument();
    });

    expect(UserService.getMe).toHaveBeenCalled();
    expect(NovelService.getNovel).toHaveBeenCalledWith({
      authorId: mockUser.uuid,
      size: PAGE_SIZE,
      page: 0,
    });
  });

  test('should show "No data" message when no stories', async () => {
    setupSuccessMocks([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No data! Create your first book~')).toBeInTheDocument();
    });
  });

  // --- INFINITE SCROLL TESTS ---

  test('should load more stories via IntersectionObserver', async () => {
    // First call returns 10 stories
    NovelService.getNovel.mockResolvedValueOnce(mockStories);
    // Second call returns 5 more stories
    NovelService.getNovel.mockResolvedValueOnce(mockStoriesPage2);
    UserService.getMe.mockResolvedValue(mockUser);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 10')).toBeInTheDocument();
    });

    triggerIntersection(true);

    await waitFor(() => {
      expect(NovelService.getNovel).toHaveBeenCalledWith({
        authorId: mockUser.uuid,
        size: PAGE_SIZE,
        page: 1,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Test Story 11')).toBeInTheDocument();
    });
  });

  test('should stop loading more when hasMore is false', async () => {
    // Return less than PAGE_SIZE to set hasMore to false
    const limitedStories = mockStories.slice(0, 5);
    setupSuccessMocks(limitedStories);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 5')).toBeInTheDocument();
    });

    triggerIntersection(true);

    // Should not make another API call
    expect(NovelService.getNovel).toHaveBeenCalledTimes(1);
  });

  test('should not trigger intersection observer when loading', async () => {
    NovelService.getNovel.mockReturnValue(new Promise(() => {})); // Never resolves
    UserService.getMe.mockResolvedValue(mockUser);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    triggerIntersection(true);

    // Should not make additional API calls while loading
    expect(NovelService.getNovel).toHaveBeenCalledTimes(1);
  });

  // --- NAVIGATION TESTS ---

  test('should navigate to create story page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ CREATE STORIES'));

    expect(mockedNavigate).toHaveBeenCalledWith('/writercreate');
  });

  test('should navigate to story profile when explore is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const exploreButtons = screen.getAllByText('EXPLORE');
    fireEvent.click(exploreButtons[0]);

    expect(mockedNavigate).toHaveBeenCalledWith('/writerstoryprofile?id=story-1');
  });

  // --- MENU OPERATION TESTS ---

  test('should show correct menu for PUBLISHED story', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED', isCompleted: false };
    setupSuccessMocks([publishedStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-setting')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-hide')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-delete')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-completed')).toBeInTheDocument();
    });
  });

  test('should show correct menu for DRAFT story', async () => {
    const draftStory = { ...mockStories[0], status: 'DRAFT' };
    setupSuccessMocks([draftStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-setting')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-delete')).toBeInTheDocument();
      expect(screen.queryByTestId('menu-item-hide')).not.toBeInTheDocument();
    });
  });

  test('should show correct menu for HIDDEN story', async () => {
    const hiddenStory = { ...mockStories[0], status: 'HIDDEN', isCompleted: true };
    setupSuccessMocks([hiddenStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-setting')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-show')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-delete')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-ongoing')).toBeInTheDocument();
    });
  });

  test('should not show dropdown for UNDER_REVIEW story', async () => {
    const underReviewStory = { ...mockStories[0], status: 'UNDER_REVIEW' };
    setupSuccessMocks([underReviewStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.queryAllByTestId('dropdown-trigger');
    expect(dropdownTriggers).toHaveLength(0);
  });

  // --- MENU ACTION TESTS ---

  test('should navigate to setting page when SETTING is clicked', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED' };
    setupSuccessMocks([publishedStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-setting')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-setting'));

    expect(mockedNavigate).toHaveBeenCalledWith('/writercreate?id=story-1');
  });

  test('should hide story when HIDE is clicked', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED' };
    setupSuccessMocks([publishedStory]);
    NovelService.hideNovelById.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-hide')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-hide'));

    await waitFor(() => {
      expect(NovelService.hideNovelById).toHaveBeenCalledWith('story-1');
    });
  });

  test('should show story when SHOW is clicked', async () => {
    const hiddenStory = { ...mockStories[0], status: 'HIDDEN' };
    setupSuccessMocks([hiddenStory]);
    NovelService.unHideNovelById.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-show')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-show'));

    await waitFor(() => {
      expect(NovelService.unHideNovelById).toHaveBeenCalledWith('story-1');
    });
  });

  test('should mark story as completed when COMPLETED is clicked', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED', isCompleted: false };
    setupSuccessMocks([publishedStory]);
    NovelService.changeNovelDetailById.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-completed')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-completed'));

    await waitFor(() => {
      expect(NovelService.changeNovelDetailById).toHaveBeenCalledWith('story-1', {
        isCompleted: true,
      });
    });
  });

  test('should mark story as ongoing when ONGOING is clicked', async () => {
    const completedStory = { ...mockStories[0], status: 'PUBLISHED', isCompleted: true };
    setupSuccessMocks([completedStory]);
    NovelService.changeNovelDetailById.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-ongoing')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-ongoing'));

    await waitFor(() => {
      expect(NovelService.changeNovelDetailById).toHaveBeenCalledWith('story-1', {
        isCompleted: false,
      });
    });
  });

  // --- DELETE MODAL TESTS ---

  test('should show delete confirmation modal when DELETE is clicked', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED' };
    setupSuccessMocks([publishedStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-delete'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByText('Confirm to delete it?')).toBeInTheDocument();
    });
  });

  test('should delete story when confirmed', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED' };
    setupSuccessMocks([publishedStory]);
    NovelService.deleteNovelById.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-delete'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(NovelService.deleteNovelById).toHaveBeenCalledWith('story-1');
    });
  });

  test('should cancel delete operation', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED' };
    setupSuccessMocks([publishedStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-delete'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    expect(NovelService.deleteNovelById).not.toHaveBeenCalled();
  });

  // --- UNSUCCESSFUL MODAL TESTS ---

  test('should show unsuccessful modal when DRAFT status is clicked', async () => {
    const draftStory = { ...mockStories[0], status: 'DRAFT' };
    setupSuccessMocks([draftStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('UNSUCCESSFUL')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('UNSUCCESSFUL'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(
        screen.getByText('Unsuccessful created, please modify and recreate!')
      ).toBeInTheDocument();
    });
  });

  test('should show unsuccessful modal when HIDDEN status is clicked', async () => {
    const hiddenStory = { ...mockStories[0], status: 'HIDDEN' };
    setupSuccessMocks([hiddenStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HIDDEN')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('HIDDEN'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
  });

  test('should navigate to recreate when Recreate is clicked', async () => {
    const draftStory = { ...mockStories[0], status: 'DRAFT' };
    setupSuccessMocks([draftStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('UNSUCCESSFUL')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('UNSUCCESSFUL'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const recreateButton = screen.getByRole('button', { name: /Recreate/i });
    fireEvent.click(recreateButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/writercreate?id=story-1');
  });

  test('should show delete modal when Delete is clicked in unsuccessful modal', async () => {
    const draftStory = { ...mockStories[0], status: 'DRAFT' };
    setupSuccessMocks([draftStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('UNSUCCESSFUL')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('UNSUCCESSFUL'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm to delete it?')).toBeInTheDocument();
    });
  });

  // --- ERROR HANDLING TESTS ---

  test('should show error modal when initial load fails', async () => {
    const errorMsg = 'Failed to load stories.';
    UserService.getMe.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });

  test('should show error modal when menu operation fails', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED' };
    setupSuccessMocks([publishedStory]);
    const errorMsg = 'Operation failed.';
    NovelService.hideNovelById.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-hide')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-hide'));

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });

  test('should show error modal when delete fails', async () => {
    const publishedStory = { ...mockStories[0], status: 'PUBLISHED' };
    setupSuccessMocks([publishedStory]);
    const errorMsg = 'Failed to delete story.';
    NovelService.deleteNovelById.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
    fireEvent.click(dropdownTriggers[0]);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('menu-item-delete'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });

  // --- IMAGE HANDLING TESTS ---

  test('should display valid base64 image', async () => {
    const storyWithBase64 = { ...mockStories[0], coverImgUrl: 'data:image/jpeg;base64,test' };
    setupSuccessMocks([storyWithBase64]);
    renderComponent();

    await waitFor(() => {
      const coverImg = screen.getByAltText('Test Story 1');
      expect(coverImg).toHaveAttribute('src', 'data:image/jpeg;base64,test');
    });
  });

  test('should display default image for invalid URL', async () => {
    const storyWithInvalidUrl = {
      ...mockStories[0],
      coverImgUrl: 'http://invalid-url.com/image.jpg',
    };
    setupSuccessMocks([storyWithInvalidUrl]);
    renderComponent();

    await waitFor(() => {
      const coverImg = screen.getByAltText('Test Story 1');
      expect(coverImg.src).toContain('test-file-stub');
    });
  });

  test('should display default image when no cover URL', async () => {
    const storyWithoutCover = { ...mockStories[0], coverImgUrl: null };
    setupSuccessMocks([storyWithoutCover]);
    renderComponent();

    await waitFor(() => {
      const coverImg = screen.getByAltText('Test Story 1');
      expect(coverImg.src).toContain('test-file-stub');
    });
  });

  // --- STATUS TAG TESTS ---

  test('should display UNDER_REVIEW status tag', async () => {
    const underReviewStory = { ...mockStories[0], status: 'UNDER_REVIEW' };
    setupSuccessMocks([underReviewStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('UNDER REVIEW')).toBeInTheDocument();
    });
  });

  test('should display COMPLETED status tag', async () => {
    const completedStory = { ...mockStories[0], status: 'PUBLISHED', isCompleted: true };
    setupSuccessMocks([completedStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
  });

  // --- CLEANUP TESTS ---

  test('should disconnect IntersectionObserver on unmount', async () => {
    const { unmount } = renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  // --- EDGE CASES ---

  test('should handle empty menu items gracefully', async () => {
    const story = { ...mockStories[0], status: 'UNKNOWN_STATUS' };
    setupSuccessMocks([story]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument();
    });

    // Should not crash when story has unknown status
    expect(screen.getByText('Test Story 1')).toBeInTheDocument();
  });

  test('should handle recreate without story ID', async () => {
    const draftStory = { ...mockStories[0], status: 'DRAFT' };
    setupSuccessMocks([draftStory]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('UNSUCCESSFUL')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('UNSUCCESSFUL'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const recreateButton = screen.getByRole('button', { name: /Recreate/i });
    fireEvent.click(recreateButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/writercreate?id=story-1');
  });
});
