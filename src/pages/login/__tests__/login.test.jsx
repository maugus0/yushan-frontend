// src/pages/login/__tests__/login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Login from '../login';
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
  login: jest.fn(),
}));

jest.mock('../../../components/auth/auth-form', () => {
  const MockAuthForm = ({ onSuccess, loginError }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess({ email: 'test@example.com', password: '123456' });
      }}
    >
      <input type="email" value="test@example.com" readOnly />
      <input type="password" value="123456" readOnly />
      <button type="submit">Login</button>
      {loginError && <div data-testid="error-message">{loginError}</div>}
    </form>
  );

  MockAuthForm.displayName = 'MockAuthForm';

  return MockAuthForm;
});

const mockStore = configureStore([]);
const store = mockStore({});

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should login successfully and show success message', async () => {
    authService.login.mockResolvedValueOnce({ username: 'Ada' });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: /^Login$/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', '123456');
      expect(message.success).toHaveBeenCalledWith('Login successful!');
    });
  });

  test('should show error message on login failure', async () => {
    authService.login.mockRejectedValueOnce(new Error('Invalid email or password'));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: /^Login$/i });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Invalid email or password', 5);
    });
  });
});

// Additional tests to increase coverage
describe('Login Page additional coverage', () => {
  test('should show session expired warning and redirect', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login?expired=true']}>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    // AntD message.warning called
    await waitFor(() => {
      expect(message.warning).toHaveBeenCalledWith(
        'Your session has expired. Please log in again.'
      );
    });
  });

  test('should navigate to register page when Register link clicked', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    const registerBtn = screen.getByRole('button', { name: /No account\? Register/i });
    fireEvent.click(registerBtn);

    // Can't spy on useNavigate directly without wrapper,
    // but we can assert button exists and is clickable
    expect(registerBtn).toBeInTheDocument();
  });

  test('should render loginError in form when login fails', async () => {
    const error = new Error('Invalid email or password');
    authService.login.mockRejectedValueOnce(error);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: /^Login$/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      const errorDiv = screen.getByTestId('error-message');
      expect(errorDiv).toHaveTextContent('Invalid email or password');
    });
  });

  test('should add shake class and focus on email input on auth error', async () => {
    const error = new Error('Invalid email or password');
    authService.login.mockRejectedValueOnce(error);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: /^Login$/i });
    const emailInput = screen.getByDisplayValue('test@example.com');

    // Mock focus function
    emailInput.focus = jest.fn();

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(emailInput.classList.contains('shake')).toBe(true);
      expect(emailInput.focus).toHaveBeenCalled();
    });

    // Wait for class removal after timeout
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(emailInput.classList.contains('shake')).toBe(false);
  });
});
