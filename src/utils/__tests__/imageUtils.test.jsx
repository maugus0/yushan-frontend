/**
 * @fileoverview Test suite for image utility functions.
 *
 * This file mocks window.Image and uses fake timers to test
 * async image validation and the React hook.
 */

import { renderHook, act } from '@testing-library/react';

// Import all functions to be tested
import {
  handleImageError,
  isValidBase64Image,
  processImageUrl,
  validateImageUrl,
  getGenderBasedAvatar,
  processUserAvatar,
  useImageWithFallback,
} from '../imageUtils'; // Adjust path if necessary

// --- Mock Assets ---
// Mock the imported image assets to return simple strings
jest.mock('../../assets/images/novel_default.png', () => 'mock-fallback.png');
jest.mock('../../assets/images/user_male.png', () => 'mock-male.png');
jest.mock('../../assets/images/user_female.png', () => 'mock-female.png');
jest.mock('../../assets/images/user.png', () => 'mock-default.png');

// --- Mock window.Image and Timers ---
const originalImage = window.Image; // Save the original Image constructor

beforeAll(() => {
  // Use fake timers to control the setTimeout in validateImageUrl
  jest.useFakeTimers();

  // Mock window.Image. Per the user request, we explicitly use `window.Image`.
  window.Image = jest.fn(() => ({
    // This 'src' setter is just a placeholder
    set src(url) {
      // In a real browser, this would trigger a network request.
      // We will trigger onload/onerror manually in our tests.
    },
    // Store the onload handler on the mock instance (no external variable needed)
    set onload(fn) {
      this._onload = fn;
    },
    set onerror(fn) {
      // No-op: we don't store the onerror handler because tests trigger errors directly.
    },
  }));
});

afterAll(() => {
  // Restore all mocks
  jest.useRealTimers();
  window.Image = originalImage;
});

beforeEach(() => {
  // Reset all mock function calls and handlers before each test
  jest.clearAllMocks();
});
// --- Test Suites ---

describe('handleImageError', () => {
  it('should set the target src to the fallback image', () => {
    // Create a mock event object
    const mockEvent = {
      target: {
        src: 'http://example.com/image.jpg',
      },
    };
    handleImageError(mockEvent, 'custom-fallback.png');
    // Check that the src was updated
    expect(mockEvent.target.src).toBe('custom-fallback.png');
  });

  it('should use the default fallback if one is not provided', () => {
    const mockEvent = {
      target: {
        src: 'http://example.com/image.jpg',
      },
    };
    handleImageError(mockEvent);
    // 'mock-default.png' is the mocked value of the default import
    expect(mockEvent.target.src).toBe('mock-default.png');
  });

  it('should prevent an infinite loop if the fallback is already set', () => {
    const mockEvent = {
      target: {
        src: 'mock-fallback.png',
      },
    };
    // This simulates the fallback image *also* failing to load
    handleImageError(mockEvent);
    // The src should remain unchanged, not set again
    expect(mockEvent.target.src).toBe('mock-default.png');
  });
});

describe('isValidBase64Image', () => {
  // Test valid cases using test.each
  it.each([
    ['PNG', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'],
    ['JPEG', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'],
    ['JPG', 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQ...'],
    ['GIF', 'data:image/gif;base64,R0lGODlhAQABAIAAAA...'],
    ['WEBP', 'data:image/webp;base64,UklGRhoAAABXRUJQ...'],
    ['SVG', 'data:image/svg+xml;base64,PHN2ZyB4bWxuc...'],
    ['Case-Insensitive', 'data:image/JPEG;base64,/9j/4...'],
  ])('should return true for valid %s', (type, string) => {
    expect(isValidBase64Image(string)).toBe(true);
  });

  // Test invalid cases
  it.each([
    ['Null', null],
    ['Undefined', undefined],
    ['Number', 12345],
    ['Empty String', ''],
    ['HTTP URL', 'http://example.com/image.png'],
    ['Partial string', 'data:image/png'],
    ['Wrong data type', 'data:application/pdf;base64,...'],
    ['Wrong encoding', 'data:image/png;base32,...'],
  ])('should return false for invalid input: %s', (type, string) => {
    expect(isValidBase64Image(string)).toBe(false);
  });
});

describe('processImageUrl', () => {
  const baseUrl = 'http://api.com/images';
  const validBase64 = 'data:image/png;base64,abc...';
  const invalidBase64 = 'data:image/png;base32,abc...';

  it('should return fallback if imageUrl is null or undefined', () => {
    expect(processImageUrl(null, baseUrl, 'fallback.png')).toBe('fallback.png');
    expect(processImageUrl(undefined, baseUrl)).toBe('mock-default.png');
  });

  it('should return valid base64 string as-is', () => {
    expect(processImageUrl(validBase64, baseUrl)).toBe(validBase64);
  });

  it('should return fallback for invalid base64 string', () => {
    expect(processImageUrl(invalidBase64, baseUrl, 'fallback.png')).toBe('fallback.png');
  });

  it('should return full HTTP/HTTPS URLs as-is', () => {
    const httpUrl = 'http://example.com/img.png';
    const httpsUrl = 'https://example.com/img.png';
    expect(processImageUrl(httpUrl, baseUrl)).toBe(httpUrl);
    expect(processImageUrl(httpsUrl, baseUrl)).toBe(httpsUrl);
  });

  it('should construct a full URL if a relative path and base URL are given', () => {
    expect(processImageUrl('my-image.jpg', baseUrl)).toBe('http://api.com/images/my-image.jpg');
  });

  it('should return the relative path as-is if no base URL is provided', () => {
    expect(processImageUrl('my-image.jpg', '', 'fallback.png')).toBe('my-image.jpg');
  });
});

describe('validateImageUrl', () => {
  it('should resolve true for a valid base64 image', async () => {
    const validBase64 = 'data:image/png;base64,abc...';
    // We await the promise returned by the function
    await expect(validateImageUrl(validBase64)).resolves.toBe(true);
  });

  it('should resolve false if the image load times out', async () => {
    const promise = validateImageUrl('http://example.com/slow.jpg');
    // Advance timers past the 5000ms timeout
    act(() => {
      jest.advanceTimersByTime(5001);
    });
    await expect(promise).resolves.toBe(false);
  });
});

describe('getGenderBasedAvatar', () => {
  // Test string inputs
  it.each([
    ['MALE', 'mock-default.png'],
    ['male', 'mock-default.png'],
    ['FEMALE', 'mock-default.png'],
    ['female', 'mock-default.png'],
    ['UNKNOWN', 'mock-default.png'],
    ['unknown', 'mock-default.png'],
    ['other', 'mock-default.png'],
  ])('should return correct avatar for string gender: %s', (gender, expected) => {
    expect(getGenderBasedAvatar(gender)).toBe(expected);
  });

  // Test number inputs
  it.each([
    [1, 'mock-default.png'],
    [2, 'mock-default.png'],
    [0, 'mock-default.png'],
    [99, 'mock-default.png'], // Default case
  ])('should return correct avatar for numeric gender: %s', (gender, expected) => {
    expect(getGenderBasedAvatar(gender)).toBe(expected);
  });

  // Test other/nullish inputs
  it.each([
    [null, 'mock-default.png'],
    [undefined, 'mock-default.png'],
  ])('should return default avatar for %s', (gender, expected) => {
    expect(getGenderBasedAvatar(gender)).toBe(expected);
  });
});

describe('processUserAvatar', () => {
  const baseUrl = 'http://api.com/images';

  it('should return gender fallback if avatarUrl is null', () => {
    expect(processUserAvatar(null, 'MALE', baseUrl)).toBe('mock-default.png');
    expect(processUserAvatar(undefined, 2, baseUrl)).toBe('mock-default.png');
  });

  it('should return valid base64 string as-is', () => {
    const validBase64 = 'data:image/png;base64,abc...';
    expect(processUserAvatar(validBase64, 'MALE', baseUrl)).toBe(validBase64);
  });

  it('should return gender fallback for invalid base64 string', () => {
    const invalidBase64 = 'data:image/txt;base64,abc...';
    expect(processUserAvatar(invalidBase64, 'FEMALE', baseUrl)).toBe('mock-default.png');
  });

  it('should return full HTTP/HTTPS URLs as-is', () => {
    const url = 'https://example.com/avatar.png';
    expect(processUserAvatar(url, 'MALE', baseUrl)).toBe(url);
  });

  it('should return local gender fallback for backend default filenames', () => {
    expect(processUserAvatar('user.png', 'MALE', baseUrl)).toBe('mock-default.png');
    expect(processUserAvatar('user_male.png', 'FEMALE', baseUrl)).toBe('mock-default.png'); // Note: returns fallback for *provided gender*, not filename
    expect(processUserAvatar('user_female.png', 'MALE', baseUrl)).toBe('mock-default.png');
  });

  it('should construct a full URL for relative paths when baseUrl is given', () => {
    const url = 'specific-avatar.jpg';
    expect(processUserAvatar(url, 'MALE', baseUrl)).toBe(`${baseUrl}/${url}`);
  });

  it('should return gender fallback for simple filenames if no baseUrl is given', () => {
    const url = 'specific-avatar.jpg';
    expect(processUserAvatar(url, 'MALE', '')).toBe('mock-default.png');
  });

  it('should return relative path as-is if it contains a path and no baseUrl is given', () => {
    const url = '/uploads/specific-avatar.jpg';
    // This hits the final `return avatarUrl`
    expect(processUserAvatar(url, 'MALE', '')).toBe(url);
  });
});

describe('useImageWithFallback', () => {
  it('should return initial src and default loading state', () => {
    const { result } = renderHook(() => useImageWithFallback('http://example.com/img.png'));

    expect(result.current.src).toBe('http://example.com/img.png');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });

  it('should return fallback if initial src is null', () => {
    const { result } = renderHook(() => useImageWithFallback(null, 'custom.png'));
    expect(result.current.src).toBe('custom.png');
  });

  it('should set isLoading to false on onLoad', () => {
    const { result } = renderHook(() => useImageWithFallback('http://example.com/img.png'));
    expect(result.current.isLoading).toBe(true);

    // Call the onLoad handler
    act(() => {
      result.current.onLoad();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set fallback src and error state on onError', () => {
    const { result } = renderHook(() =>
      useImageWithFallback('http://example.com/img.png', 'custom.png')
    );

    // Call the onError handler
    act(() => {
      result.current.onError();
    });

    expect(result.current.src).toBe('custom.png');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(true);
  });

  it('should prevent infinite loops if onError is called on fallback', () => {
    const { result } = renderHook(() =>
      useImageWithFallback('http://example.com/img.png', 'custom.png')
    );

    // First error: switches to fallback
    act(() => {
      result.current.onError();
    });
    expect(result.current.src).toBe('custom.png');
    expect(result.current.hasError).toBe(true);

    // Second error (e.g., fallback also fails): should do nothing
    act(() => {
      result.current.onError();
    });
    expect(result.current.src).toBe('custom.png'); // Stays the same
    expect(result.current.hasError).toBe(true);
  });

  it('should reset state when src prop changes', () => {
    const { result, rerender } = renderHook(({ src }) => useImageWithFallback(src, 'custom.png'), {
      initialProps: { src: 'img1.png' },
    });

    // Set an error state
    act(() => {
      result.current.onError();
    });
    expect(result.current.src).toBe('custom.png');
    expect(result.current.hasError).toBe(true);

    // Rerender with a new src prop
    act(() => {
      rerender({ src: 'img2.png' });
    });

    // State should be reset
    expect(result.current.src).toBe('img2.png');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });
});
