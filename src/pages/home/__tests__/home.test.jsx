if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(), 
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import * as novelService from '../../../services/api/novels';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../../../services/api/novels', () => ({
  getWeeklyFeaturedNovels: jest.fn(),
  getOngoingNovels: jest.fn(),
  getCompletedNovels: jest.fn(),
  getNewestNovels: jest.fn(),
  GRADIENT_COLORS: 'mock-gradient',
}));

jest.mock('../../../components/novel/herosection/herosection', () => {
  const MockHeroSection = ({ onItemClick }) => (
    <div data-testid="mock-hero-section">
      <button onClick={onItemClick}>Mock Hero Item</button>
    </div>
  );
  MockHeroSection.displayName = 'MockHeroSection';
  return MockHeroSection;
});

jest.mock('../../../components/novel/featurenovels/featurenovels', () => {
  const MockFeatureNovels = ({ title, novels, onNovelClick }) => (
    <div data-testid={`mock-feature-novels-${title.split(' ')[0].toLowerCase()}`}>
      <h2>{title}</h2>
      {novels.map(novel => (
        <div key={novel.id} onClick={() => onNovelClick(novel)} data-testid={`novel-click-${novel.id}`}>
          {novel.title}
        </div>
      ))}
    </div>
  );
  MockFeatureNovels.displayName = 'MockFeatureNovels';
  return MockFeatureNovels;
});

jest.mock('../../../components/novel/categoriesgrid/categoriesgrid', () => {
  const MockCategoriesGrid = () => <div data-testid="mock-categories-grid">Mock Categories Grid</div>;
  MockCategoriesGrid.displayName = 'MockCategoriesGrid';
  return MockCategoriesGrid;
});

jest.mock('../../../components/novel/topnovels/topnovels', () => {
  const MockTopNovels = () => <div data-testid="mock-top-novels">Mock Top Novels</div>;
  MockTopNovels.displayName = 'MockTopNovels';
  return MockTopNovels;
});

jest.mock('antd', () => {
  const React = jest.requireActual('react');
  const antd = jest.requireActual('antd');

  const MockCarousel = ({ children }) => <div data-testid="mock-carousel">{children}</div>;
  MockCarousel.displayName = 'MockCarousel';

  return {
    ...antd,
    Carousel: MockCarousel,
  };
});

jest.mock('@ant-design/icons', () => ({
  BookOutlined: () => <span data-testid="icon-book" />,
  EditOutlined: () => <span data-testid="icon-edit" />,
  TrophyOutlined: () => <span data-testid="icon-trophy" />,
}));

jest.mock('../../../assets/images/novel_default.png', () => 'fallback.png');
jest.mock('../../../assets/images/icon1.png', () => 'icon1.png');
jest.mock('../../../assets/images/icon2.jpg', () => 'icon2.jpg');
jest.mock('../../../assets/images/icon3.jpg', () => 'icon3.jpg');

jest.mock('../../../utils/imageUtils', () => ({
  handleImageError: jest.fn(),
}));

const mockNewest = [
  { id: 'new-1', title: 'Newest Novel 1', cover: 'new.png', synopsis: 'New synopsis' },
  { id: 'new-2', title: 'Newest Novel 2', cover: 'new2.png', description: 'New description' },
];
const mockWeekly = [{ id: 'week-1', title: 'Weekly Novel 1' }];
const mockOngoing = [{ id: 'on-1', title: 'Ongoing Novel 1' }];
const mockCompleted = [{ id: 'comp-1', title: 'Completed Novel 1' }];

const Homepage = require('../home').default;

// Test suite
describe('Homepage Component', () => {
  const mockedGetNewestNovels = novelService.getNewestNovels;
  const mockedGetWeeklyFeaturedNovels = novelService.getWeeklyFeaturedNovels;
  const mockedGetOngoingNovels = novelService.getOngoingNovels;
  const mockedGetCompletedNovels = novelService.getCompletedNovels;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    mockedGetNewestNovels.mockResolvedValue({ content: mockNewest });
    mockedGetWeeklyFeaturedNovels.mockResolvedValue({ content: mockWeekly });
    mockedGetOngoingNovels.mockResolvedValue({ content: mockOngoing });
    mockedGetCompletedNovels.mockResolvedValue({ content: mockCompleted });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );
  };

  //test1
  test('renders all static sections and titles', () => {
    renderComponent();

    // Hero section
    expect(screen.getByRole('heading', { name: 'Newest Books' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-hero-section')).toBeInTheDocument();

    // 3 features section
    expect(screen.getByRole('heading', { name: 'Read Novels' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Write Novels' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Earn Yuan/XP and Level Up' })).toBeInTheDocument();

    // CTA section
    expect(screen.getByRole('heading', { name: 'Ready to Begin Your Journey?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Reading Now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Become an Author' })).toBeInTheDocument();

    // Child component sections
    expect(screen.getByTestId('mock-categories-grid')).toBeInTheDocument();
    expect(screen.getByTestId('mock-top-novels')).toBeInTheDocument();
  });

  //test2
  test('fetches and displays all novel lists on mount', async () => {
    renderComponent();

    // Wait for all async data to be loaded and rendered
    await waitFor(() => {
      // Check data in Newest Books carousel
      expect(screen.getByRole('heading', { name: 'Newest Novel 1' })).toBeInTheDocument();
      expect(screen.getByText('New synopsis')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Newest Novel 2' })).toBeInTheDocument();
      expect(screen.getByText('New description')).toBeInTheDocument();

      // Check data passed to mocked FeatureNovels components
      expect(screen.getByText('Weekly Novel 1')).toBeInTheDocument();
      expect(screen.getByText('Ongoing Novel 1')).toBeInTheDocument();
      expect(screen.getByText('Completed Novel 1')).toBeInTheDocument();
    });

    // Verify all APIs were called
    expect(novelService.getNewestNovels).toHaveBeenCalledTimes(1);
    expect(novelService.getWeeklyFeaturedNovels).toHaveBeenCalledTimes(1);
    expect(novelService.getOngoingNovels).toHaveBeenCalledTimes(1);
    expect(novelService.getCompletedNovels).toHaveBeenCalledTimes(1);
  });

  //test3
  test('handles API errors gracefully by setting empty arrays', async () => {
    // Override default mocks to simulate failure
    mockedGetNewestNovels.mockRejectedValue(new Error('API Error'));
    mockedGetWeeklyFeaturedNovels.mockRejectedValue(new Error('API Error'));

    // Suppress console.error logs in test output
    jest.spyOn(console, 'error').mockImplementation(() => { });

    renderComponent();

    // Wait for the component to settle
    await waitFor(() => {
      // The sections that failed should not show data
      expect(screen.queryByRole('heading', { name: 'Newest Novel 1' })).not.toBeInTheDocument();
      expect(screen.queryByText('Weekly Novel 1')).not.toBeInTheDocument();

      // The sections that succeeded (default mock) should still show data
      expect(screen.getByText('Ongoing Novel 1')).toBeInTheDocument();
      expect(screen.getByText('Completed Novel 1')).toBeInTheDocument();
    });

    // Restore console.error
    console.error.mockRestore();
  });

  //test4
  test('navigates to novel details when clicking a "Newest Book" slide', async () => {
    renderComponent();

    // Wait for the slide to render
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Newest Novel 1' })).toBeInTheDocument();
    });

    // Find the clickable parent slide
    const slide = screen.getByRole('heading', { name: 'Newest Novel 1' }).closest('.home-hero-slide');
    expect(slide).toBeInTheDocument(); // Ensure we found the slide

    fireEvent.click(slide);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/novel/new-1');
  });

  //test5
  test('navigates to novel details when clicking a "Weekly Featured" novel', async () => {
    renderComponent();

    // Wait for the mock child to render the novel
    await waitFor(() => {
      expect(screen.getByText('Weekly Novel 1')).toBeInTheDocument();
    });

    // Click the novel in the mocked FeatureNovels component
    fireEvent.click(screen.getByTestId('novel-click-week-1'));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/novel/week-1');
  });

  //test6
  test('navigates to /login when clicking hero section item', async () => {
    renderComponent();

    // Wait for the mock child to render
    await waitFor(() => {
      expect(screen.getByTestId('mock-hero-section')).toBeInTheDocument();
    });

    // Click the simulated item in the mock HeroSection
    fireEvent.click(screen.getByRole('button', { name: 'Mock Hero Item' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  //test7
  test('navigates to /browse from "Read Novels" feature card', () => {
    renderComponent();

    // Find the card by its title, then find the button within that card
    const readCard = screen.getByRole('heading', { name: 'Read Novels' }).closest('.home-feature-card');
    const readButton = within(readCard).getByRole('button', { name: 'Get Started' });

    fireEvent.click(readButton);
    expect(mockNavigate).toHaveBeenCalledWith('/browse');
  });

  //test8
  test('navigates to /writerdashboard from "Write Novels" feature card', () => {
    renderComponent();

    const writeCard = screen.getByRole('heading', { name: 'Write Novels' }).closest('.home-feature-card');
    const writeButton = within(writeCard).getByRole('button', { name: 'Get Started' });

    fireEvent.click(writeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/writerdashboard');
  });

  //test9
  test('navigates to /register from "Earn Yuan/XP" feature card', () => {
    renderComponent();

    const earnCard = screen.getByRole('heading', { name: 'Earn Yuan/XP and Level Up' }).closest('.home-feature-card');
    const earnButton = within(earnCard).getByRole('button', { name: 'Get Started' });

    fireEvent.click(earnButton);
    expect(mockNavigate).toHaveBeenCalledWith('/register', { replace: false });
  });

  //test10
  test('navigates to /browse from CTA "Start Reading Now" button', () => {
    renderComponent();

    const ctaReadButton = screen.getByRole('button', { name: 'Start Reading Now' });
    fireEvent.click(ctaReadButton);

    expect(mockNavigate).toHaveBeenCalledWith('/browse');
  });

  //test11
  test('navigates to /writerdashboard from CTA "Become an Author" button', () => {
    renderComponent();

    const ctaWriteButton = screen.getByRole('button', { name: 'Become an Author' });
    fireEvent.click(ctaWriteButton);

    expect(mockNavigate).toHaveBeenCalledWith('/writerdashboard');
  });

});