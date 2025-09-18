/**
 * WHY CREATED: SonarCloud required ≥80% test coverage (was 5.07%)
 * - Routes configuration had no test coverage
 * - This file tests route structure and configuration
 *
 * CAN BE MODIFIED/DELETED: Yes, based on testing strategy
 * - Can be deleted if unit tests are not needed
 * - Can be modified to test different route scenarios
 * - Can be moved to integration tests instead
 */
import { createMemoryRouter } from 'react-router-dom';
import { routes } from '../appRoutes';

test('routes configuration is valid', () => {
  expect(routes).toBeDefined();
  expect(Array.isArray(routes)).toBe(true);
  expect(routes.length).toBeGreaterThan(0);
});

test('routes have correct structure', () => {
  routes.forEach((route) => {
    expect(route).toHaveProperty('path');
    expect(route).toHaveProperty('element');
    expect(typeof route.path).toBe('string');
    expect(route.element).toBeDefined();
  });
});

test('routes contain expected paths', () => {
  const paths = routes.map((route) => route.path);

  expect(paths).toContain('/');
  expect(paths).toContain('/login');
  expect(paths).toContain('/register');
});

test('router can be created without errors', () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  expect(router).toBeDefined();
});
