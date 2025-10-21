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

    await expect(authService.login('bad', 'bad')).rejects.toThrow('Invalid credentials');
  });
});

describe('authService - extended coverage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('setTokens should store tokens and expiry', () => {
    const spy = jest.spyOn(Date, 'now').mockReturnValue(1000);
    authService.setTokens('a', 'r', 5000);
    expect(localStorage.getItem('jwt_token')).toBe('a');
    expect(localStorage.getItem('refresh_token')).toBe('r');
    expect(localStorage.getItem('token_expiry')).toBe('6000');
    spy.mockRestore();
  });

  test('clearTokens should remove all tokens and headers', () => {
    localStorage.setItem('jwt_token', 'a');
    localStorage.setItem('refresh_token', 'b');
    localStorage.setItem('token_expiry', 'c');
    axios.defaults.headers.common['Authorization'] = 'Bearer a';
    authService.clearTokens();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
  });

  test('getTokenExpiry returns number or null', () => {
    expect(authService.getTokenExpiry()).toBeNull();
    localStorage.setItem('token_expiry', '1234');
    expect(authService.getTokenExpiry()).toBe(1234);
  });

  test('isTokenExpired should return correct boolean', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);
    localStorage.setItem('token_expiry', '500');
    expect(authService.isTokenExpired()).toBe(true);
    localStorage.setItem('token_expiry', '2000');
    expect(authService.isTokenExpired()).toBe(false);
    nowSpy.mockRestore();
  });

  test('register - success', async () => {
    const mockRes = {
      data: {
        data: {
          accessToken: 't1',
          refreshToken: 'r1',
          username: 'bob',
        },
      },
    };
    axios.post.mockResolvedValueOnce(mockRes);

    const data = await authService.register({
      username: 'bob',
      email: 'bob@x.com',
      password: '123',
      gender: 'male',
      birthday: '2020-01-01',
      otp: '111',
    });
    expect(data.username).toBe('bob');
    expect(localStorage.getItem('jwt_token')).toBe('t1');
  });

  test('register - missing gender should throw', async () => {
    await expect(
      authService.register({ username: 'x', email: 'a', password: 'p' })
    ).rejects.toThrow('Gender is required');
  });

  const registerErrorCases = [
    [400, 'Invalid registration data. Please check all fields'],
    [409, 'Email already registered'],
    [422, 'Invalid verification code or code expired'],
    [500, 'Server error. Please try again later'],
  ];

  test.each(registerErrorCases)('register - handles %i errors', async (status, expected) => {
    axios.post.mockRejectedValueOnce({ response: { status, data: {} } });
    await expect(
      authService.register({
        username: 'x',
        email: 'a',
        password: 'p',
        gender: 'male',
        birthday: '2020-01-01',
      })
    ).rejects.toThrow(expected);
  });

  test('register - email already exists message', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Email already exists' } },
    });
    await expect(
      authService.register({
        username: 'x',
        email: 'a',
        password: 'p',
        gender: 'male',
        birthday: '2020-01-01',
      })
    ).rejects.toThrow('Email already exists. Please use a different email or login.');
  });

  test('register - network and generic error', async () => {
    axios.post.mockRejectedValueOnce({ request: {} });
    await expect(
      authService.register({
        username: 'x',
        email: 'a',
        password: 'p',
        gender: 'male',
        birthday: '2020-01-01',
      })
    ).rejects.toThrow('Network error. Please check your internet connection');

    axios.post.mockRejectedValueOnce(new Error('Oops'));
    await expect(
      authService.register({
        username: 'x',
        email: 'a',
        password: 'p',
        gender: 'male',
        birthday: '2020-01-01',
      })
    ).rejects.toThrow('Oops');
  });

  test('sendVerificationEmail - success', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    const res = await authService.sendVerificationEmail('a@b.com');
    expect(res.success).toBe(true);
  });

  const emailCases = [
    [400, 'Invalid email address'],
    [409, 'Email already registered'],
    [429, 'Too many requests. Please wait before trying again'],
    [500, 'Server error. Please try again later'],
  ];

  test.each(emailCases)('sendVerificationEmail - handles %i errors', async (status, expected) => {
    axios.post.mockRejectedValueOnce({ response: { status, data: {} } });
    await expect(authService.sendVerificationEmail('a@b.com')).rejects.toThrow(expected);
  });

  test('sendVerificationEmail - network and generic error', async () => {
    axios.post.mockRejectedValueOnce({ request: {} });
    await expect(authService.sendVerificationEmail('a@b.com')).rejects.toThrow(
      'Network error. Please check your internet connection'
    );

    axios.post.mockRejectedValueOnce(new Error('Oops'));
    await expect(authService.sendVerificationEmail('a@b.com')).rejects.toThrow('Oops');
  });

  test('refreshToken - success', async () => {
    localStorage.setItem('refresh_token', 'r1');
    axios.post.mockResolvedValueOnce({
      data: { data: { accessToken: 'newA', refreshToken: 'newR', expiresIn: 100 } },
    });
    const token = await authService.refreshToken();
    expect(token).toBe('newA');
    expect(localStorage.getItem('jwt_token')).toBe('newA');
  });

  test('refreshToken - no refresh token should throw', async () => {
    await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
  });

  test('refreshToken - error clears tokens', async () => {
    localStorage.setItem('refresh_token', 'r1');
    axios.post.mockRejectedValueOnce(new Error('fail'));
    await expect(authService.refreshToken()).rejects.toThrow('fail');
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  test('handleUnauthorized should call clearToken', () => {
    const spy = jest.spyOn(authService, 'clearToken').mockImplementation(() => {});
    authService.handleUnauthorized();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('getToken and getRefreshToken should return stored values', () => {
    localStorage.setItem('jwt_token', 'abc');
    localStorage.setItem('refresh_token', 'xyz');
    expect(authService.getToken()).toBe('abc');
    expect(authService.getRefreshToken()).toBe('xyz');
  });
});
