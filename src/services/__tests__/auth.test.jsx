// src/services/__tests__/auth.test.js
import authService from '../auth';
import axios from 'axios';
import store from '../../store';

// mock dependencies
jest.mock('axios');
jest.mock('../../store', () => ({
  dispatch: jest.fn(),
}));
jest.mock('../../store/slices/user', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  setAuthenticated: jest.fn(),
}));

describe('authService', () => {
  const TOKEN_KEY = 'jwt_token';
  const REFRESH_TOKEN_KEY = 'refresh_token';
  const TOKEN_EXPIRY_KEY = 'token_expiry';

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('setToken should store token and dispatch setAuthenticated', () => {
    authService.setToken('abc123');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc123');
    expect(store.dispatch).toHaveBeenCalled();
  });

  test('clearToken should remove token and dispatch logout', () => {
    localStorage.setItem(TOKEN_KEY, 'abc123');
    authService.clearToken();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(store.dispatch).toHaveBeenCalled();
  });

  test('isAuthenticated should return true if token exists', () => {
    localStorage.setItem(TOKEN_KEY, 'abc123');
    expect(authService.isAuthenticated()).toBe(true);
  });

  test('isAuthenticated should return false if no token', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  test('login should store tokens and dispatch login', async () => {
    const fakeResponse = {
      data: {
        data: {
          accessToken: 'access123',
          refreshToken: 'refresh123',
          expiresIn: 10000,
          username: 'Ada',
        },
      },
    };
    axios.post.mockResolvedValueOnce(fakeResponse);

    const data = await authService.login('test@example.com', 'password');
    expect(data.username).toBe('Ada');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('access123');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh123');
    expect(store.dispatch).toHaveBeenCalled();
  });

  test('login should throw user-friendly error on 401', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Invalid credentials' } },
    });

    await expect(authService.login('bad', 'bad')).rejects.toThrow(
      'Invalid credentials'
    );
  });
});
