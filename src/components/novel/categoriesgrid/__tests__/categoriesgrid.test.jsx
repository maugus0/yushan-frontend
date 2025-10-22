import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';

const mockNavigate = jest.fn();

// Mock AntD responsive hooks used by Row/Col to avoid runtime error in JSDOM
jest.mock('antd/lib/grid/hooks/useBreakpoint', () => () => ({
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  xxl: true,
}));

// also provide a minimal responsiveObserver used internally by some antd versions
jest.mock('antd/lib/_util/responsiveObserver', () => ({
  __esModule: true,
  default: () => ({
    subscribe: (listener) => {
      try {
        listener({ xs: true, sm: true, md: true, lg: true, xl: true, xxl: true });
      } catch (e) {
        void e; // satisfy eslint no-empty rule
      }
      return () => {};
    },
    unsubscribe: () => {},
    dispatch: () => {},
  }),
}));

// mock react-router useNavigate before importing component
jest.mock('react-router-dom', () => {
  const real = jest.requireActual('react-router-dom');
  return {
    ...real,
    useNavigate: () => mockNavigate,
  };
});

// mock axios
jest.mock('axios');

import CategoriesGrid from '../categoriesgrid';

afterEach(() => {
  jest.clearAllMocks();
});

test('shows loading spinner initially while fetching', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: { categories: [] } } });
  const { container } = render(<CategoriesGrid />);
  // initial render should show a spinner container
  expect(container.querySelector('.ant-spin')).toBeTruthy();
  // wait for fetch to complete
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
});

test('displays error alert when fetch fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('Network'));
  render(<CategoriesGrid />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  // AntD Alert shows "Error" header text
  expect(screen.getByText(/Error/i)).toBeInTheDocument();
  expect(screen.getByText(/Failed to load categories/i)).toBeInTheDocument();
});

test('shows info alert when no categories returned', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: { categories: [] } } });
  render(<CategoriesGrid />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  expect(screen.getByText(/No categories found/i)).toBeInTheDocument();
});

test('renders category cards and navigates on click', async () => {
  const categories = [
    { id: 11, name: 'Fantasy', description: 'Magic books' },
    { id: 22, name: 'Horror', description: 'Scary books' },
  ];
  axios.get.mockResolvedValueOnce({ data: { data: { categories } } });

  render(<CategoriesGrid />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  // both category names and descriptions should be visible
  expect(screen.getByText('Fantasy')).toBeInTheDocument();
  expect(screen.getByText('Magic books')).toBeInTheDocument();
  expect(screen.getByText('Horror')).toBeInTheDocument();

  // clicking a card should call navigate with query param
  fireEvent.click(screen.getByText('Fantasy'));
  expect(mockNavigate).toHaveBeenCalledWith('/browse?category=11');
});
