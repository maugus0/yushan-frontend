/* eslint-env jest */
// Only test request.js (mock dependencies). Top-level mocks must be declared before requiring the module.

jest.mock('../token', () => ({
  getToken: jest.fn(() => 'mocked-token-xyz'),
}));

jest.mock('axios', () => {
  const reqHandlers = [];
  const respHandlers = [];
  const instance = {
    defaults: {},
    interceptors: {
      request: {
        handlers: reqHandlers,
        use: (fulfilled, rejected) => {
          reqHandlers.push({ fulfilled, rejected });
          return reqHandlers.length - 1;
        },
      },
      response: {
        handlers: respHandlers,
        use: (fulfilled, rejected) => {
          respHandlers.push({ fulfilled, rejected });
          return respHandlers.length - 1;
        },
      },
    },
    create(_opts) {
      // return the same instance (request.js expects an axios instance)
      return instance;
    },
  };
  return instance;
});

jest.mock('axios-rate-limit', () => (axiosInstance) => axiosInstance);

// import after mocks
const apiClient = require('../request').default;
const { getToken } = require('../token');

describe('utils/request.js', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('exports an axios-like instance with interceptors', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
    expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
    expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
  });

  test('request interceptor injects Authorization header when token exists', async () => {
    const reqHandler = apiClient.interceptors.request.handlers[0];
    expect(reqHandler).toBeDefined();
    const { fulfilled } = reqHandler;
    const cfg = { headers: {} };
    const out = fulfilled(cfg);
    const resolved = await Promise.resolve(out);
    expect(resolved.headers).toBeDefined();
    const token = getToken();
    if (token) {
      expect(resolved.headers.Authorization).toBe(`Bearer ${token}`);
    } else {
      expect(resolved.headers.Authorization).toBeUndefined();
    }
  });

  test('request interceptor backup rate-limit rejects after exceeding maxRequestsPerMinute', async () => {
    const reqHandler = apiClient.interceptors.request.handlers[0];
    const { fulfilled } = reqHandler;
    // Freeze time so all requests are within the 1-minute window
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    let rejectedAt = -1;

    // Make up to 61 quick calls; the implementation should reject when recentRequests.length >= 60
    for (let i = 0; i < 61; i++) {
      try {
        const out = fulfilled({ headers: {} });
        // handle both sync return and Promise
        await Promise.resolve(out);
      } catch (err) {
        rejectedAt = i;
        break;
      }
    }

    // Expect a rejection occurred at or before the 61st call
    expect(rejectedAt).toBeGreaterThanOrEqual(0);
    expect(rejectedAt).toBeLessThanOrEqual(60);

    nowSpy.mockRestore();
  });

  test('response interceptor logs (if applicable) and rethrows errors', async () => {
    const respHandler = apiClient.interceptors.response.handlers[0];
    const { rejected } = respHandler;
    expect(typeof rejected).toBe('function');

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const timeoutErr = { code: 'ECONNABORTED', message: 'timeout' };
    await expect(Promise.resolve().then(() => rejected(timeoutErr))).rejects.toBe(timeoutErr);

    const rateErr = { message: 'Rate limit exceeded' };
    await expect(Promise.resolve().then(() => rejected(rateErr))).rejects.toBe(rateErr);

    // console.error may be called by the interceptor for these errors
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
