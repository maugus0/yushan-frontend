import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// mock module factory creates its own jest.fn() so no hoisting problem
jest.mock('../../../../services/categories', () => ({
  __esModule: true,
  default: {
    getCategories: jest.fn(),
  },
}));

import GenreSidebar from '../genresidebar';

afterEach(() => {
  jest.clearAllMocks();
});

const findHeaderNovelsButton = () => {
  const candidates = screen.getAllByRole('button', { name: /Novels/i });
  return candidates.find((b) => b.classList.contains('side-nav-item')) || candidates[0];
};

describe('GenreSidebar', () => {
  test('renders Novels toggle and calls onClickAll when All Novels clicked', async () => {
    const categories = require('../../../../services/categories').default;
    categories.getCategories.mockResolvedValueOnce([]);

    const onClickAll = jest.fn();
    render(
      <GenreSidebar
        activeGenre={null}
        activeCategoryId={null}
        onClickAll={onClickAll}
        onClickGenre={jest.fn()}
      />
    );

    await waitFor(() => expect(categories.getCategories).toHaveBeenCalled());

    // pick the header "Novels" (there may be other buttons containing "Novels")
    const novelsBtn = findHeaderNovelsButton();
    expect(novelsBtn).toBeInTheDocument();
    expect(novelsBtn).toHaveAttribute('aria-expanded', 'true');

    const allBtn = screen.getByText(/All Novels/i);
    fireEvent.click(allBtn);
    expect(onClickAll).toHaveBeenCalledWith('novel');
  });

  test('renders fetched categories and calls onClickGenre with correct params', async () => {
    const categories = require('../../../../services/categories').default;
    categories.getCategories.mockResolvedValueOnce([
      { id: 1, name: 'Fantasy', isActive: true },
      { id: 2, name: 'Horror', isActive: true },
    ]);

    const onClickGenre = jest.fn();
    render(
      <GenreSidebar
        activeGenre={null}
        activeCategoryId={null}
        onClickAll={jest.fn()}
        onClickGenre={onClickGenre}
      />
    );

    await waitFor(() => expect(categories.getCategories).toHaveBeenCalled());
    // ensure categories rendered
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Horror')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Horror'));
    expect(onClickGenre).toHaveBeenCalledWith('novel', null, 'Horror', 2);
  });

  test('toggles collapse state when Novels header clicked', async () => {
    const categories = require('../../../../services/categories').default;
    categories.getCategories.mockResolvedValueOnce([]);

    render(
      <GenreSidebar
        activeGenre={null}
        activeCategoryId={null}
        onClickAll={jest.fn()}
        onClickGenre={jest.fn()}
      />
    );

    await waitFor(() => expect(categories.getCategories).toHaveBeenCalled());

    const novelsBtn = findHeaderNovelsButton();
    expect(novelsBtn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(novelsBtn);
    // wait for state flip
    await waitFor(() => expect(novelsBtn).toHaveAttribute('aria-expanded', 'false'));
    fireEvent.click(novelsBtn);
    await waitFor(() => expect(novelsBtn).toHaveAttribute('aria-expanded', 'true'));
  });

  test('handles fetch failure gracefully (no crash, empty list)', async () => {
    const categories = require('../../../../services/categories').default;
    categories.getCategories.mockRejectedValueOnce(new Error('API down'));

    render(
      <GenreSidebar
        activeGenre={null}
        activeCategoryId={null}
        onClickAll={jest.fn()}
        onClickGenre={jest.fn()}
      />
    );

    await waitFor(() => expect(categories.getCategories).toHaveBeenCalled());
    // wait for UI settle and still show All Novels
    await waitFor(() => expect(screen.getByText(/All Novels/i)).toBeInTheDocument());
  });
});
