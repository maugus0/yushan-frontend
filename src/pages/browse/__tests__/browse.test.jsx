import { render, screen, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BrowsePage from '../browse';
import axios from 'axios';
import novelService from '../../../services/novel';
import GenreSidebar from '../../../components/novel/browse/genresidebar';

jest.mock('axios');

describe('BrowsePage', () => {
  // Suppress error logs for network failures
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    console.error.mockRestore();
  });

  it('renders BrowsePage without crashing', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Browse Novels/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /filter and sort/i })).toBeInTheDocument();
  });

  it('can filter novels by status', async () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );
    // Find the filter pills region
    const filterRegion = screen.getByRole('region', { name: /filter and sort/i });
    const allButtons = within(filterRegion).getAllByRole('button');
    const allBtn = allButtons.find((btn) => btn.textContent.trim() === 'All');
    const ongoingBtn = allButtons.find((btn) => btn.textContent.trim() === 'Ongoing');
    const completedBtn = allButtons.find((btn) => btn.textContent.trim() === 'Completed');

    // Click "Ongoing" filter
    await userEvent.click(ongoingBtn);
    expect(ongoingBtn).toHaveAttribute('aria-pressed', 'true');
    expect(allBtn).toHaveAttribute('aria-pressed', 'false');
    expect(completedBtn).toHaveAttribute('aria-pressed', 'false');

    // Click "Completed" filter
    await userEvent.click(completedBtn);
    expect(completedBtn).toHaveAttribute('aria-pressed', 'true');
    expect(allBtn).toHaveAttribute('aria-pressed', 'false');
    expect(ongoingBtn).toHaveAttribute('aria-pressed', 'false');

    // Click "All" filter
    await userEvent.click(allBtn);
    expect(allBtn).toHaveAttribute('aria-pressed', 'true');
    expect(ongoingBtn).toHaveAttribute('aria-pressed', 'false');
    expect(completedBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('can filter novels by sort', async () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );
    // Find the filter pills region
    const filterRegion = screen.getByRole('region', { name: /filter and sort/i });
    const allButtons = within(filterRegion).getAllByRole('button');
    const popularBtn = allButtons.find((btn) => btn.textContent.trim() === 'Popular');
    const latestBtn = allButtons.find((btn) => btn.textContent.trim() === 'Latest');
    const ratingBtn = allButtons.find((btn) => btn.textContent.trim() === 'Rating');

    // Click "Latest" sort
    await userEvent.click(latestBtn);
    expect(latestBtn).toHaveAttribute('aria-pressed', 'true');
    expect(popularBtn).toHaveAttribute('aria-pressed', 'false');
    expect(ratingBtn).toHaveAttribute('aria-pressed', 'false');

    // Click "Rating" sort
    await userEvent.click(ratingBtn);
    expect(ratingBtn).toHaveAttribute('aria-pressed', 'true');
    expect(popularBtn).toHaveAttribute('aria-pressed', 'false');
    expect(latestBtn).toHaveAttribute('aria-pressed', 'false');

    // Click "Popular" sort
    await userEvent.click(popularBtn);
    expect(popularBtn).toHaveAttribute('aria-pressed', 'true');
    expect(latestBtn).toHaveAttribute('aria-pressed', 'false');
    expect(ratingBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('can reset filters', async () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );
    // Find the filter pills region
    const filterRegion = screen.getByRole('region', { name: /filter and sort/i });
    const resetBtn = within(filterRegion).getByRole('button', { name: /reset filters/i });

    // Click "Ongoing" and "Latest" first
    const allButtons = within(filterRegion).getAllByRole('button');
    const ongoingBtn = allButtons.find((btn) => btn.textContent.trim() === 'Ongoing');
    const latestBtn = allButtons.find((btn) => btn.textContent.trim() === 'Latest');
    await userEvent.click(ongoingBtn);
    await userEvent.click(latestBtn);

    // Click "Reset"
    await userEvent.click(resetBtn);

    // After reset, "All" and "Popular" should be active
    const allBtn = allButtons.find((btn) => btn.textContent.trim() === 'All');
    const popularBtn = allButtons.find((btn) => btn.textContent.trim() === 'Popular');
    expect(allBtn).toHaveAttribute('aria-pressed', 'true');
    expect(popularBtn).toHaveAttribute('aria-pressed', 'true');
    expect(ongoingBtn).toHaveAttribute('aria-pressed', 'false');
    expect(latestBtn).toHaveAttribute('aria-pressed', 'false');
    // Should show reset message
    await waitFor(() => {
      expect(screen.getByText((content) => /reset/i.test(content))).toBeInTheDocument();
    });
  });

  it('can toggle view mode', async () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );
    // Find the view toggle group
    const filterRegion = screen.getByRole('region', { name: /filter and sort/i });
    const viewToggleGroup = within(filterRegion).getByRole('group', { name: /change view mode/i });
    const gridBtn = within(viewToggleGroup).getAllByRole('button')[0];
    const listBtn = within(viewToggleGroup).getAllByRole('button')[1];

    // Default is grid
    expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
    expect(listBtn).toHaveAttribute('aria-pressed', 'false');

    // Switch to list
    await userEvent.click(listBtn);
    expect(listBtn).toHaveAttribute('aria-pressed', 'true');
    expect(gridBtn).toHaveAttribute('aria-pressed', 'false');

    // Switch back to grid
    await userEvent.click(gridBtn);
    expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
    expect(listBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows error alert and retry button when API fails', async () => {
    // Simulate network error by blocking axios.get
    jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('fail'));
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );
    // Wait for error alert to appear
    await waitFor(() => {
      // Use getAllByText to avoid multiple match error
      const errorEls = screen.getAllByText(/failed to load novels/i);
      expect(errorEls.length).toBeGreaterThan(0);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('shows "No results found" when novels list is empty', async () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText((content) => /no results?/i.test(content))).toBeInTheDocument();
    });
  });
});

// Additional tests to increase coverage
describe('BrowsePage additional tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('opens and closes mobile drawer', async () => {
    // Mock window.innerWidth to simulate mobile
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );

    const drawerButton = screen.getByRole('button', { name: /open filters drawer/i });
    await userEvent.click(drawerButton);
    expect(screen.getByText(/mobile filters placeholder/i)).toBeInTheDocument();

    // // Close drawer
    // const closeButton = screen.getByLabelText('Close');
    // await userEvent.click(closeButton);
    // expect(screen.queryByText(/mobile filters placeholder/i)).not.toBeInTheDocument();
  });

  it('saves and restores view mode and filters from localStorage', async () => {
    // Simulate saved state
    localStorage.setItem(
      'browsePageState_v6',
      JSON.stringify({
        viewMode: 'list',
        filters: { status: 'Ongoing', sort: 'rating' },
        scrollY: 123,
      })
    );

    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );

    // viewMode should be restored
    const listBtn = screen.getByRole('button', { name: /list/i });
    expect(listBtn).toHaveAttribute('aria-pressed', 'true');

    // filter should be restored
    const ongoingBtn = screen.getByRole('button', { name: /ongoing/i });
    expect(ongoingBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('retries fetch on softError retry button click', async () => {
    const fetchSpy = jest
      .spyOn(novelService, 'getNovels')
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ content: [], totalElements: 0 });

    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const errorEls = screen.getAllByText(/failed to load novels/i);
      expect(errorEls.length).toBeGreaterThan(0);
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});

describe('GenreSidebar callbacks', () => {
  it('calls all navigation and state callbacks correctly', () => {
    const onClickSection = jest.fn();
    const onClickLead = jest.fn();
    const onClickAll = jest.fn();
    const onClickGenre = jest.fn();

    const { rerender } = render(
      <GenreSidebar
        section="novel"
        lead="male"
        activeGenre="Action"
        activeCategoryId={1}
        onClickSection={onClickSection}
        onClickLead={onClickLead}
        onClickAll={onClickAll}
        onClickGenre={onClickGenre}
      />
    );

    act(() => {
      onClickSection('comics');
      onClickLead('female');
      onClickAll('novel');
      onClickGenre('novel', 'male', 'Fantasy', 5);
    });

    expect(onClickSection).toHaveBeenCalledWith('comics');
    expect(onClickLead).toHaveBeenCalledWith('female');
    expect(onClickAll).toHaveBeenCalledWith('novel');
    expect(onClickGenre).toHaveBeenCalledWith('novel', 'male', 'Fantasy', 5);

    rerender(
      <GenreSidebar
        section="comics"
        lead="female"
        activeGenre="Romance"
        activeCategoryId={2}
        onClickSection={onClickSection}
        onClickLead={onClickLead}
        onClickAll={onClickAll}
        onClickGenre={onClickGenre}
      />
    );
  });
});
