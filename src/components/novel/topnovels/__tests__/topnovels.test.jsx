import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// mock axios before importing the component
jest.mock('axios');
import axios from 'axios';

// mock image handler used by component
jest.mock('../../../../utils/imageUtils', () => ({
  __esModule: true,
  handleImageError: jest.fn(),
}));

// mock react-router useNavigate before importing component
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const real = jest.requireActual('react-router-dom');
  return {
    ...real,
    useNavigate: () => mockNavigate,
  };
});

import TopNovels from '../topnovels';

afterEach(() => {
  jest.clearAllMocks();
});

test('shows loading spinner initially while fetching', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: { content: [] } } });
  const { container } = render(<TopNovels />);
  // spinner visible on initial render
  expect(container.querySelector('.ant-spin')).toBeTruthy();
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
});

test('displays error alert when fetch fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('Network'));
  render(<TopNovels />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  // shows error alert with text
  expect(screen.getByText(/Error/i)).toBeInTheDocument();
  expect(screen.getByText(/Failed to load top novels/i)).toBeInTheDocument();
});

test('shows info alert when no novels returned', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: { content: [] } } });
  render(<TopNovels />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  expect(screen.getByText(/No novels found/i)).toBeInTheDocument();
});

test('renders novels list and navigates on card click and author click stops propagation', async () => {
  const novels = [
    {
      id: '100',
      title: 'The Great Tale',
      coverImgUrl: 'https://example.test/cover100.png',
      authorUsername: 'Alice',
      authorId: 'a1',
      viewCnt: 1234,
      voteCnt: 56,
      category: 'Fantasy',
    },
  ];
  axios.get.mockResolvedValueOnce({ data: { data: { content: novels } } });

  render(<TopNovels />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  // Title visible
  expect(screen.getByText('Top Novels')).toBeInTheDocument();

  // novel title and category present
  expect(screen.getByText('The Great Tale')).toBeInTheDocument();
  expect(screen.getByText('Fantasy')).toBeInTheDocument();

  // cover image present with src
  const img = screen.getByAltText('The Great Tale');
  expect(img).toBeTruthy();
  expect(img.getAttribute('src')).toContain('cover100.png');

  // click card wrapper navigates to novel page
  const wrapper = document.querySelector('.top-novel-card-wrapper');
  fireEvent.click(wrapper);
  expect(mockNavigate).toHaveBeenCalledWith('/novel/100');

  // clicking author link should navigate to profile and not trigger novel navigation
  mockNavigate.mockClear();
  const authorLink = screen.getByText(/by Alice/i);
  fireEvent.click(authorLink);
  expect(mockNavigate).toHaveBeenCalledWith('/profile?userId=a1');
  // Only one navigation should be triggered for author click
  expect(mockNavigate).toHaveBeenCalledTimes(1);
});

test('image onError calls handleImageError', async () => {
  const { handleImageError } = require('../../../../utils/imageUtils');
  const novels = [
    {
      id: '200',
      title: 'Broken Cover',
      coverImgUrl: 'https://example.test/broken.png',
      authorUsername: 'Bob',
    },
  ];
  axios.get.mockResolvedValueOnce({ data: { data: { content: novels } } });

  render(<TopNovels />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  const img = screen.getByAltText('Broken Cover');
  // simulate error event
  fireEvent.error(img);
  expect(handleImageError).toHaveBeenCalled();
});
