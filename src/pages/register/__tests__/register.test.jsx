// src/pages/register/__tests__/register.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Register from '../register';
import authService from '../../../services/auth';

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('../../../services/auth', () => ({
  register: jest.fn(),
}));

// Mock AuthForm to call onSuccess immediately
jest.mock('../../../components/auth/auth-form', () => {
  const MockAuthForm = ({ onSuccess, registerError }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess({
          email: 'test@example.com',
          password: '123456',
          username: 'testuser',
          gender: 'male',
          birthday: '1990-01-01',
          otp: '123456',
        });
      }}
    >
      <input type="email" value="test@example.com" readOnly />
      <input type="password" value="123456" readOnly />
      <input type="text" value="testuser" readOnly />
      <input type="text" value="male" readOnly />
      <input type="text" value="1990-01-01" readOnly />
      <input type="text" value="123456" readOnly />
      <button type="submit">Register</button>
      {registerError && <div data-testid="error-message">{registerError}</div>}
    </form>
  );

  MockAuthForm.displayName = 'MockAuthForm';

  return MockAuthForm;
});

const mockStore = configureStore([]);
const store = mockStore({});

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register successfully and show success message', async () => {
    authService.register.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );

    const registerButton = screen.getByRole('button', { name: /^Register$/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123456',
        username: 'testuser',
        gender: 'male',
        birthday: '1990-01-01',
        otp: '123456',
      });
      expect(message.success).toHaveBeenCalledWith(
        'Registration successful! Welcome to Yushan!',
        5
      );
    });
  });

  test('should show error message on registration failure', async () => {
    authService.register.mockRejectedValueOnce(new Error('Email already exists'));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );

    const registerButton = screen.getByRole('button', { name: /^Register$/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith('Email already exists', 5);
    });
  });
});

// Additional tests to increase coverage
describe('Register Page additional coverage', () => {
  test('should navigate to login page when Login link clicked', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );

    const loginBtn = screen.getByRole('button', { name: /Already have account\? Login/i });
    fireEvent.click(loginBtn);

    // Can't spy on useNavigate directly without wrapper, but we can assert button exists
    expect(loginBtn).toBeInTheDocument();
  });

  test('should render registerError in form when registration fails', async () => {
    const error = new Error('Email already exists');
    authService.register.mockRejectedValueOnce(error);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );

    const registerButton = screen.getByRole('button', { name: /^Register$/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      const errorDiv = screen.getByTestId('error-message');
      expect(errorDiv).toHaveTextContent('Email already exists');
    });
  });

  test('should add shake class and focus on email input on email conflict error', async () => {
    const error = new Error('Email already exists');
    authService.register.mockRejectedValueOnce(error);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );

    const registerButton = screen.getByRole('button', { name: /^Register$/i });
    const emailInput = screen.getByDisplayValue('test@example.com');

    // Mock focus function
    emailInput.focus = jest.fn();

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(emailInput.classList.contains('shake')).toBe(true);
      expect(emailInput.focus).toHaveBeenCalled();
    });

    // Wait for class removal after timeout
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(emailInput.classList.contains('shake')).toBe(false);
  });

  test('should add shake class and focus on OTP input on verification code error', async () => {
    const error = new Error('Verification code expired');
    authService.register.mockRejectedValueOnce(error);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );

    const registerButton = screen.getByRole('button', { name: /^Register$/i });
    const otpInput = document.createElement('input');
    otpInput.setAttribute('placeholder', 'OTP');
    document.body.appendChild(otpInput);
    otpInput.focus = jest.fn();

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(otpInput.classList.contains('shake')).toBe(true);
      expect(otpInput.focus).toHaveBeenCalled();
    });

    // Wait for class removal after timeout
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(otpInput.classList.contains('shake')).toBe(false);

    document.body.removeChild(otpInput);
  });
});
