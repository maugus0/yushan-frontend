import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import WriterAuth from '../writerauth';
import userService from '../../../services/user';
import { message, Modal } from 'antd'; // Import Modal

// Mock antd components and services
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  // Keep Modal.info, Modal.success etc. but mock the Modal component itself
  const MockModal = ({ children, open, onCancel, footer }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-modal">
        {children}
        <button onClick={onCancel}>Cancel</button>
        {footer && footer.map((btn, i) => <span key={i}>{btn}</span>)}
      </div>
    );
  };
  MockModal.info = antd.Modal.info;
  MockModal.success = antd.Modal.success;
  MockModal.error = antd.Modal.error;
  MockModal.warning = antd.Modal.warning;
  MockModal.confirm = antd.Modal.confirm;

  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
    Modal: MockModal, // Use the mock Modal component
  };
});

jest.mock('../../../services/user');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.useFakeTimers();

describe('WriterAuth Component', () => {
  const mockUserEmail = 'test@example.com';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    userService.getMe.mockResolvedValue({ email: mockUserEmail });
    userService.upgradeToAuthorEmail.mockResolvedValue({});
    userService.upgradeToAuthor.mockResolvedValue({});
    jest.clearAllTimers();
  });

  test('renders component and fetches user email', async () => {
    render(
      <BrowserRouter>
        <WriterAuth />
      </BrowserRouter>
    );
    const emailInput = screen.getByPlaceholderText('Enter your email');
    expect(emailInput).toBeInTheDocument();
    await waitFor(() => {
      expect(emailInput).toHaveValue(mockUserEmail);
      expect(emailInput).toBeDisabled();
    });
    expect(userService.getMe).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText('Enter OTP code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send OTP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register to be a Yushan author' })).toBeInTheDocument();
  });


  test('handles sending OTP successfully', async () => {
    render(
      <BrowserRouter>
        <WriterAuth />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(mockUserEmail);
    });

    const sendOtpButton = screen.getByRole('button', { name: 'Send OTP' });
    fireEvent.click(sendOtpButton);

    expect(sendOtpButton).toHaveTextContent('Sending...');
    expect(sendOtpButton).toBeDisabled();

    await waitFor(() => {
      expect(userService.upgradeToAuthorEmail).toHaveBeenCalledWith(mockUserEmail);
    });
    expect(message.success).toHaveBeenCalledWith('OTP sent to your email.');

    await waitFor(() => {
        expect(sendOtpButton).toHaveTextContent(/Resend OTP \(05:00\)/i);
        expect(sendOtpButton).toBeDisabled();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(sendOtpButton).toHaveTextContent(/Resend OTP \(04:59\)/i);
    });

     act(() => {
        jest.advanceTimersByTime(299 * 1000);
     });

    await waitFor(() => {
        expect(sendOtpButton).toHaveTextContent('Send OTP');
        expect(sendOtpButton).not.toBeDisabled();
    })
  });

  test('handles sending OTP failure', async () => {
    const errorMessage = 'Network Error';
    userService.upgradeToAuthorEmail.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <BrowserRouter>
        <WriterAuth />
      </BrowserRouter>
    );
     await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(mockUserEmail);
    });

    const sendOtpButton = screen.getByRole('button', { name: 'Send OTP' });
    fireEvent.click(sendOtpButton);

    expect(sendOtpButton).toHaveTextContent('Sending...');
    expect(sendOtpButton).toBeDisabled();

    await waitFor(() => {
      expect(userService.upgradeToAuthorEmail).toHaveBeenCalledWith(mockUserEmail);
    });

    await waitFor(() => {
        const modal = screen.getByTestId('mock-modal');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveTextContent(errorMessage);
    });

     const confirmButton = screen.getByRole('button', { name: 'Confirm' });
     fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    await waitFor(() => {
        expect(sendOtpButton).toHaveTextContent('Send OTP');
        expect(sendOtpButton).not.toBeDisabled();
    });
  });

 test('disables register button initially and enables after OTP input', async () => {
    render(
      <BrowserRouter>
        <WriterAuth />
      </BrowserRouter>
    );
     await waitFor(() => {
       expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(mockUserEmail);
     });
    const registerButton = screen.getByRole('button', { name: 'Register to be a Yushan author' });
    const otpInput = screen.getByPlaceholderText('Enter OTP code');
    expect(registerButton).toBeDisabled();
    fireEvent.change(otpInput, { target: { value: '123456' } });
    expect(registerButton).not.toBeDisabled();
     fireEvent.change(otpInput, { target: { value: '' } });
     expect(registerButton).toBeDisabled();
  });

  test('handles registration successfully', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);
    render(
      <BrowserRouter>
        <WriterAuth />
      </BrowserRouter>
    );
     await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(mockUserEmail);
      });
    const otpInput = screen.getByPlaceholderText('Enter OTP code');
    const registerButton = screen.getByRole('button', { name: 'Register to be a Yushan author' });
    const testOtp = '123456';
    fireEvent.change(otpInput, { target: { value: testOtp } });
    fireEvent.click(registerButton);
    await waitFor(() => {
      expect(userService.upgradeToAuthor).toHaveBeenCalledWith(testOtp);
    });
    expect(navigateMock).toHaveBeenCalledWith('/writerdashboard');
  });

  test('handles registration failure', async () => {
    const errorMessage = 'Invalid OTP';
    userService.upgradeToAuthor.mockRejectedValueOnce(new Error(errorMessage));
    render(
      <BrowserRouter>
        <WriterAuth />
      </BrowserRouter>
    );
    await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(mockUserEmail);
    });
    const otpInput = screen.getByPlaceholderText('Enter OTP code');
    const registerButton = screen.getByRole('button', { name: 'Register to be a Yushan author' });
    const testOtp = 'wrongotp';
    fireEvent.change(otpInput, { target: { value: testOtp } });
    fireEvent.click(registerButton);
    await waitFor(() => {
      expect(userService.upgradeToAuthor).toHaveBeenCalledWith(testOtp);
    });
    await waitFor(() => {
        const modal = screen.getByTestId('mock-modal');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveTextContent(errorMessage);
    });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(confirmButton);
     await waitFor(() => {
         expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
     });
  });

  test('register button remains disabled if clicked without OTP', async () => {
    render(
      <BrowserRouter>
        <WriterAuth />
      </BrowserRouter>
    );
     await waitFor(() => {
       expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(mockUserEmail);
     });
     const registerButton = screen.getByRole('button', { name: 'Register to be a Yushan author' });
     expect(registerButton).toBeDisabled();
     fireEvent.click(registerButton);
     expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
     expect(userService.upgradeToAuthor).not.toHaveBeenCalled();
  });

   test('clears countdown timer on unmount', async () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const { unmount } = render(
      <BrowserRouter>
        <WriterAuth />
      </BrowserRouter>
    );
     await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(mockUserEmail);
      });

    const sendOtpButton = screen.getByRole('button', { name: 'Send OTP' });
    fireEvent.click(sendOtpButton);

    await waitFor(() => {
        expect(userService.upgradeToAuthorEmail).toHaveBeenCalled();
        expect(sendOtpButton).toHaveTextContent(/Resend OTP \(05:00\)/i);
    });

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
   });

});