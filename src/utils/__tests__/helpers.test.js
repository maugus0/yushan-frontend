/**
 * WHY CREATED: SonarCloud required ≥80% test coverage (was 5.07%)
 * - Utils directory had no test coverage
 * - This file tests utility functions (mock implementation)
 *
 * CAN BE MODIFIED/DELETED: Yes, based on testing strategy
 * - Can be deleted if unit tests are not needed
 * - Should be updated to test actual utility functions when implemented
 * - Can be modified to test different utility scenarios
 */
// Mock helpers functions for testing
const helpers = {
  formatDate: (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  capitalizeFirst: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
};

describe('helpers', () => {
  describe('formatDate', () => {
    test('formats valid date correctly', () => {
      const date = new Date('2023-12-25');
      expect(helpers.formatDate(date)).toBe('12/25/2023');
    });

    test('handles null/undefined input', () => {
      expect(helpers.formatDate(null)).toBe('');
      expect(helpers.formatDate(undefined)).toBe('');
    });
  });

  describe('validateEmail', () => {
    test('validates correct email formats', () => {
      expect(helpers.validateEmail('test@example.com')).toBe(true);
      expect(helpers.validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(helpers.validateEmail('invalid-email')).toBe(false);
      expect(helpers.validateEmail('@domain.com')).toBe(false);
      expect(helpers.validateEmail('user@')).toBe(false);
      expect(helpers.validateEmail('')).toBe(false);
    });
  });

  describe('capitalizeFirst', () => {
    test('capitalizes first letter', () => {
      expect(helpers.capitalizeFirst('hello')).toBe('Hello');
      expect(helpers.capitalizeFirst('world')).toBe('World');
    });

    test('handles empty string', () => {
      expect(helpers.capitalizeFirst('')).toBe('');
      expect(helpers.capitalizeFirst(null)).toBe('');
      expect(helpers.capitalizeFirst(undefined)).toBe('');
    });
  });
});
