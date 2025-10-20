import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BrowsePage from '../browse';
import axios from 'axios';

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
