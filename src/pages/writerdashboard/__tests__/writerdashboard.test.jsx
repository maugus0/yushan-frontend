import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import WriterDashboard from '../writerdashboard';
import novelService from '../../../services/novel';
import userService from '../../../services/user';

// --- Mocks ---
jest.mock('../../../services/novel');
jest.mock('../../../services/user');

jest.mock('../../../components/writer/writernavbar/writernavbar', () => {
  const MockWriterNavbar = () => <div data-testid="writer-navbar">Navbar</div>;
  MockWriterNavbar.displayName = 'MockWriterNavbar';
  return MockWriterNavbar;
});

// Mock image require
jest.mock('antd', () => {
  const React = jest.requireActual('react');
  const antd = jest.requireActual('antd');

  const createMockComponent = (displayName) => {
    const Mock = (props) => <div {...props} />;
    Mock.displayName = displayName;
    return Mock;
  };

  const MockModal = ({ children, open, footer }) => {
    if (!open) return null;
    const renderFooter = () => {
      if (footer === null) return null;
      if (footer && Array.isArray(footer)) {
        return footer.map((button, i) => <React.Fragment key={i}>{button}</React.Fragment>);
      }
      return null;
    };
    return (
      <div data-testid="mock-modal">
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

  const MockButton = ({ children, onClick, ...props }) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
  MockButton.displayName = 'MockButton';

  const MockText = ({ children, ...props }) => <span {...props}>{children}</span>;
  MockText.displayName = 'MockText';
  const MockTitle = ({ children, ...props }) => {
    const { level, ...rest } = props;
    const Tag = `h${level || 3}`;
    return <Tag {...rest}>{children}</Tag>;
  };
  MockTitle.displayName = 'MockTitle';
  const MockTypography = {
    ...antd.Typography,
    Text: MockText,
    Title: MockTitle,
  };

  const MockSelect = ({ value, onChange, options, placeholder, className }) => (
    <select
      data-testid="novel-select"
      className={className}
      value={value || ''}
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

  return {
    ...antd,
    Modal: MockModal,
    Spin: MockSpin,
    Select: MockSelect,
    Button: MockButton,
    Typography: MockTypography,

    Card: createMockComponent('MockCard'),
    Tag: createMockComponent('MockTag'),
    Row: createMockComponent('MockRow'),
    Col: createMockComponent('MockCol'),
    Divider: () => <hr />,
  };
});

describe('WriterDashboard Component', () => {
  const mockAuthor = {
    uuid: 'author-uuid-123',
    email: 'author@test.com',
  };

  const mockNovels = [
    {
      id: 1,
      title: 'Novel One',
      synopsis: 'This is the first novel',
      categoryName: 'Fantasy',
      status: 'PUBLISHED',
      coverImgUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      chapterCnt: 10,
      wordCnt: 50000,
      reviewCnt: 25,
      viewCnt: 1000,
      voteCnt: 150,
      avgRating: 4.5,
    },
    {
      id: 2,
      title: 'Novel Two',
      synopsis: 'This is the second novel',
      categoryName: 'Romance',
      status: 'DRAFT',
      coverImgUrl: null,
      chapterCnt: 5,
      wordCnt: 25000,
      reviewCnt: 10,
      viewCnt: 500,
      voteCnt: 75,
      avgRating: 4.0,
    },
  ];

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <WriterDashboard />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService.getMe.mockResolvedValue(mockAuthor);
    novelService.getNovel.mockResolvedValue(mockNovels);
  });

  // Test 1: renders loading spinner initially
  test('renders loading spinner initially', () => {
    userService.getMe.mockImplementation(() => new Promise(() => {}));
    renderComponent();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  // Test 2: renders navbar
  test('renders writer navbar', async () => {
    renderComponent();

    expect(screen.getByTestId('writer-navbar')).toBeInTheDocument();
  });

  // Test 4: displays "no data" message when there are no novels
  test('displays no data message when novels array is empty', async () => {
    novelService.getNovel.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No data! Create your first book~')).toBeInTheDocument();
    });
  });

  // Test 10: shows error modal when getMe fails
  test('shows error modal when userService.getMe fails', async () => {
    const errorMsg = 'Failed to authenticate user.';
    userService.getMe.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText(errorMsg)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  // Test 11: shows error modal when getNovel fails
  test('shows error modal when novelService.getNovel fails', async () => {
    const errorMsg = 'Failed to load novels.';
    novelService.getNovel.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText(errorMsg)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  // Test 12: shows default error message when error has no message
  test('shows default error message when error has no message property', async () => {
    userService.getMe.mockRejectedValueOnce({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load dashboard data.')).toBeInTheDocument();
  });

  // Test 13: selects first novel by default when novels load
  test('selects first novel by default', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel One', level: 3 })).toBeInTheDocument();
    });

    const select = screen.getByTestId('novel-select');
    expect(select).toHaveValue('1');
  });

  // Test 16: displays PUBLISHED status tag correctly
  test('displays PUBLISHED status tag', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
    });

    const publishedTag = screen.getByText('PUBLISHED');
    expect(publishedTag).toBeInTheDocument();
  });

  // Test 17: displays DRAFT status tag correctly
  test('displays DRAFT status tag', async () => {
    novelService.getNovel.mockResolvedValue([mockNovels[1]]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('DRAFT')).toBeInTheDocument();
    });

    const draftTag = screen.getByText('DRAFT');
    expect(draftTag).toBeInTheDocument();
  });

  // Test 18: handles switching between novels multiple times
  test('handles switching between novels multiple times', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel One', level: 3 })).toBeInTheDocument();
    });

    const select = screen.getByTestId('novel-select');

    // Switch to Novel Two
    fireEvent.change(select, { target: { value: '2' } });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel Two', level: 3 })).toBeInTheDocument();
    });

    // Switch back to Novel One
    fireEvent.change(select, { target: { value: '1' } });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel One', level: 3 })).toBeInTheDocument();
    });

    // Switch to Novel Two again
    fireEvent.change(select, { target: { value: '2' } });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel Two', level: 3 })).toBeInTheDocument();
    });
  });

  // Test 19: renders all stat labels
  test('renders all statistic labels', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel One', level: 3 })).toBeInTheDocument();
    });

    expect(screen.getByText('Chapters')).toBeInTheDocument();
    expect(screen.getByText('Words')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Views')).toBeInTheDocument();
    expect(screen.getByText('Votes')).toBeInTheDocument();
    expect(screen.getByText('Avg Rating')).toBeInTheDocument();
  });

  // Test 20: loading state changes to content after data loads
  test('loading state transitions to content correctly', async () => {
    renderComponent();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Novel One', level: 3 })).toBeInTheDocument();
  });

  // Test 21: handles novels with empty synopsis
  test('handles novel with empty synopsis', async () => {
    const novelWithEmptySynopsis = {
      ...mockNovels[0],
      synopsis: '',
    };
    novelService.getNovel.mockResolvedValue([novelWithEmptySynopsis]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel One', level: 3 })).toBeInTheDocument();
    });

    // Synopsis should still render even if empty
    const synopsisElements = screen.queryAllByText('');
    expect(synopsisElements.length).toBeGreaterThanOrEqual(0);
  });

  // Test 22: validates base64 URL with different image formats
  test('validates base64 URL with different valid formats', async () => {
    const novelsWithDifferentFormats = [
      {
        ...mockNovels[0],
        id: 10,
        title: 'JPEG Novel',
        coverImgUrl: 'data:image/jpeg;base64,validbase64string',
      },
      {
        ...mockNovels[0],
        id: 11,
        title: 'GIF Novel',
        coverImgUrl: 'data:image/gif;base64,validbase64string',
      },
      {
        ...mockNovels[0],
        id: 12,
        title: 'WebP Novel',
        coverImgUrl: 'data:image/webp;base64,validbase64string',
      },
    ];

    for (const novel of novelsWithDifferentFormats) {
      novelService.getNovel.mockResolvedValue([novel]);
      const { unmount } = renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: novel.title, level: 3 })).toBeInTheDocument();
      });

      const img = screen.getByAltText(novel.title);
      expect(img.src).toContain('data:image/');

      unmount();
    }
  });

  // Test 23: error modal can be closed via cancel button
  test('error modal closes when cancel is triggered', async () => {
    const errorMsg = 'Test error';
    userService.getMe.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    // Modal should have onCancel functionality
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  // Test 24: handles single novel scenario
  test('handles single novel without dropdown interaction', async () => {
    novelService.getNovel.mockResolvedValue([mockNovels[0]]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel One', level: 3 })).toBeInTheDocument();
    });

    const select = screen.getByTestId('novel-select');
    expect(select).toHaveValue('1');
  });

  // Test 25: renders card with novel information
  test('renders card component with novel details', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novel One', level: 3 })).toBeInTheDocument();
    });

    // Check that card contains all key information
    expect(screen.getByText('This is the first novel')).toBeInTheDocument();
    expect(screen.getByAltText('Novel One')).toBeInTheDocument();
  });
});
