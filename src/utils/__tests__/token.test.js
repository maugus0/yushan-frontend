/* global global */
/* eslint-env jest */
import { getToken } from '../token';

describe('utils/token.getToken', () => {
  const KEY = 'auth.token';
  let realLocalStorage;

  beforeEach(() => {
    realLocalStorage = globalThis.localStorage;
    // ensure a clean storage
    localStorage.clear();
  });

  afterEach(() => {
    // restore original localStorage if we replaced it
    globalThis.localStorage = realLocalStorage;
    jest.restoreAllMocks();
  });

  test('returns stored token when present', () => {
    localStorage.setItem(KEY, 'abc123');
    expect(getToken()).toBe('abc123');
  });

  test('returns null when token key is not set', () => {
    localStorage.removeItem(KEY);
    expect(getToken()).toBeNull();
  });

  test('returns null when localStorage is not available', () => {
    // simulate environment without localStorage
    // @ts-ignore
    delete global.localStorage;
    expect(getToken()).toBeNull();
  });

  test('returns null when localStorage.getItem throws', () => {
    // replace localStorage with a throwing implementation
    // @ts-ignore
    global.localStorage = {
      getItem: () => {
        throw new Error('boom');
      },
    };
    expect(getToken()).toBeNull();
  });

  test('invokes localStorage.getItem with the expected key', () => {
    const spy = jest.spyOn(Object.getPrototypeOf(localStorage), 'getItem');
    localStorage.setItem(KEY, 'tok123');
    expect(getToken()).toBe('tok123');
    expect(spy).toHaveBeenCalledWith(KEY);
    spy.mockRestore();
  });
});
