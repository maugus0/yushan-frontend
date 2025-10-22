import axios from 'axios';
import { setupAxiosInterceptors } from '../axios-interceptor';

// Mock auth service used by the interceptor
jest.mock('../../services/auth', () => ({
  getToken: jest.fn(),
  refreshToken: jest.fn(),
  clearTokens: jest.fn(),
}));
const authService = require('../../services/auth');

// Mock antd message
jest.mock('antd', () => ({ message: { error: jest.fn() } }));
const { message } = require('antd');

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

test('request interceptor adds Authorization header when token exists', () => {
  const instance = axios.create();
  authService.getToken.mockReturnValue('old-token');

  setupAxiosInterceptors(instance);

  // request interceptor is the first registered handler
  const reqFulfilled = instance.interceptors.request.handlers[0].fulfilled;
  const cfg = { headers: {} };
  const out = reqFulfilled(cfg);

  expect(out.headers.Authorization).toBe('Bearer old-token');
});

test('response interceptor returns response unchanged for success', () => {
  const instance = axios.create();
  setupAxiosInterceptors(instance);

  const resFulfilled = instance.interceptors.response.handlers[0].fulfilled;
  const resp = { config: { url: '/ok' }, status: 200 };
  expect(resFulfilled(resp)).toBe(resp);
});

test('on 401, refreshToken is called and original request retried with new token', async () => {
  const instance = axios.create();

  authService.getToken.mockReturnValue(null);
  authService.refreshToken.mockResolvedValue('new-token');

  // prevent actual network by giving the axios instance a dummy adapter that resolves
  instance.defaults.adapter = jest.fn().mockResolvedValue({
    status: 200,
    data: { ok: true },
    config: {},
  });

  setupAxiosInterceptors(instance);

  const resRejected = instance.interceptors.response.handlers[0].rejected;

  const originalRequest = { _retry: false, url: '/protected', headers: {} };
  const error = { response: { status: 401 }, config: originalRequest };

  await resRejected(error);

  expect(authService.refreshToken).toHaveBeenCalled();
  expect(instance.defaults.adapter).toHaveBeenCalledTimes(1);
  const adapterCalledWith = instance.defaults.adapter.mock.calls[0][0];
  expect(adapterCalledWith.headers.Authorization).toBe('Bearer new-token');
});

test('on refresh failure clears tokens, shows message and redirects to login', async () => {
  jest.useFakeTimers();
  const instance = axios.create();

  authService.refreshToken.mockRejectedValue(new Error('refresh-failed'));
  authService.clearTokens.mockImplementation(() => {});

  // capture and restore original location
  const originalLocation = typeof window !== 'undefined' ? window.location : undefined;

  // Provide a writable, configurable location for the test environment
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { href: '' },
    });
  }

  setupAxiosInterceptors(instance);

  const resRejected = instance.interceptors.response.handlers[0].rejected;
  const originalRequest = { _retry: false, url: '/protected', headers: {} };
  const error = { response: { status: 401 }, config: originalRequest };

  await expect(resRejected(error)).rejects.toBeDefined();

  // advance the setTimeout in the interceptor (500ms)
  jest.advanceTimersByTime(500);

  expect(authService.clearTokens).toHaveBeenCalled();
  expect(message.error).toHaveBeenCalledWith('Your session has expired. Please log in again.');
  expect(window.location.href).toContain('/login?expired=true');

  // restore original location
  if (typeof window !== 'undefined' && originalLocation !== undefined) {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  }
  jest.useRealTimers();
});
