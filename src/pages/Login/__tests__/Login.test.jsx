/**
 * WHY CREATED: SonarCloud required ≥80% test coverage (was 5.07%)
 * - Login component had no test coverage
 * - This file tests Login component functionality
 *
 * CAN BE MODIFIED/DELETED: Yes, based on testing strategy
 * - Can be deleted if unit tests are not needed
 * - Can be modified to test different scenarios
 * - Can be moved to integration tests instead
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

const MockedLogin = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
);

test('Login page renders correctly', () => {
  render(<MockedLogin />);

  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  expect(screen.getByText(/email address/i)).toBeInTheDocument();
  expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
});

test('Login form inputs work correctly', () => {
  render(<MockedLogin />);

  const inputs = screen.getAllByDisplayValue('');
  const emailInput = inputs[0];
  const passwordInput = inputs[1];

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });

  expect(emailInput.value).toBe('test@example.com');
  expect(passwordInput.value).toBe('password123');
});

test('Login buttons are present', () => {
  render(<MockedLogin />);

  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign up here/i })).toBeInTheDocument();
});
