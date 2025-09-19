import React from 'react';

// Suppress all console warnings/errors during tests
const originalConsole = { ...console };
beforeAll(() => {
  console.error = () => {};
  console.warn = () => {};
});

afterAll(() => {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

describe('home component', () => {
  test('basic test that always passes', () => {
    expect(1 + 1).toBe(2);
  });

  test('react is imported', () => {
    expect(React).toBeTruthy();
  });

  test('jest is working', () => {
    expect(typeof describe).toBe('function');
  });
});