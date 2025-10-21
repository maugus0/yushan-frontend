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
