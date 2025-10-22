import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '../../auth/auth-form';
import authService from '../../../services/auth';

jest.mock('../../../services/auth', () => ({
  sendVerificationEmail: jest.fn(),
}));

// Mock AntD responsive utilities to avoid runtime errors in JSDOM
jest.mock('antd/lib/grid/hooks/useBreakpoint', () => () => ({
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  xxl: true,
}));
jest.mock('antd/lib/_util/responsiveObserver', () => ({
  __esModule: true,
  default: () => ({
    subscribe: (listener) => {
      try {
        listener({ xs: true, sm: true, md: true, lg: true, xl: true, xxl: true });
      } catch (e) {
        void e;
      }
      return () => {};
    },
    unsubscribe: () => {},
    dispatch: () => {},
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  // ensure real timers by default; specific tests will use fake timers when needed
  jest.useRealTimers();
});

test('login mode renders email, password and calls onSuccess with values', async () => {
  const onSuccess = jest.fn().mockResolvedValue();
  render(<AuthForm mode="login" onSuccess={onSuccess} />);

  const email = screen.getByLabelText(/Email/i);
  const password = screen.getByLabelText(/Password/i);
  const submit = screen.getByRole('button', { name: /Login/i });

  await userEvent.type(email, 'alice@example.com');
  await userEvent.type(password, 'password123');
  await userEvent.click(submit);

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'alice@example.com',
        password: 'password123',
      })
    );
  });
});

test('register mode shows required fields and password strength validation', async () => {
  const onSuccess = jest.fn().mockResolvedValue();
  render(<AuthForm mode="register" onSuccess={onSuccess} />);

  // required fields present
  expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Birthday/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter OTP/i)).toBeInTheDocument();

  // Fill form but with weak password
  await userEvent.type(screen.getByLabelText(/Username/i), 'Bob');
  await userEvent.type(screen.getByLabelText(/^Password$/i), 'weakpass'); // no caps/digit
  await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'weakpass');
  // select gender
  const gender =
    screen.getByLabelText(/Gender/i).querySelector('input') || screen.getByText(/Select gender/i);
  // AntD Select is complex; we can focus on triggering password validation by submitting
  const submit = screen.getByRole('button', { name: /Create Account/i });
  await userEvent.click(submit);

  // Expect password pattern error message to appear
  expect(
    await screen.findByText(/Min 8 chars include uppercase, lowercase & number/i)
  ).toBeInTheDocument();

  // Now test confirm password mismatch error
  await userEvent.clear(screen.getByLabelText(/Confirm Password/i));
  await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'Different1');
  await userEvent.click(submit);
  expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();

  // onSuccess should not have been called
  expect(onSuccess).not.toHaveBeenCalled();
});

test('handleSendOtp - success starts countdown and disables button', async () => {
  // use fake timers to assert countdown text
  jest.useFakeTimers();
  authService.sendVerificationEmail.mockResolvedValue({ ok: true });

  const onSuccess = jest.fn();
  render(<AuthForm mode="register" onSuccess={onSuccess} />);

  // Provide a valid email and click Send OTP
  const emailInput = screen.getByLabelText(/^Email$/i);
  await userEvent.type(emailInput, 'otpuser@example.com');

  // Find the Send OTP button inside the OTP label area
  const otpLabel = screen.getByText(/^OTP$/i).closest('.ant-form-item');
  const sendBtn = within(otpLabel).getByRole('button', { name: /Send OTP/i });

  await userEvent.click(sendBtn);
  await waitFor(() =>
    expect(authService.sendVerificationEmail).toHaveBeenCalledWith('otpuser@example.com')
  );

  // After resolved, the button should show "Resend in 05:00" (initial)
  // Advance timers a bit and assert
  expect(within(otpLabel).getByRole('button')).toHaveTextContent(/Resend in 05:00|Resend in 5:00/i);

  // advance 2 seconds to ensure countdown updates
  jest.advanceTimersByTime(2000);
  await waitFor(() => {
    expect(within(otpLabel).getByRole('button')).toMatchSnapshot();
  });

  jest.useRealTimers();
});

test('handleSendOtp - failure displays otpError message', async () => {
  authService.sendVerificationEmail.mockRejectedValue(new Error('Too many requests'));
  render(<AuthForm mode="register" onSuccess={jest.fn()} />);

  const emailInput = screen.getByLabelText(/^Email$/i);
  await userEvent.type(emailInput, 'fail@example.com');

  const otpLabel = screen.getByText(/^OTP$/i).closest('.ant-form-item');
  const sendBtn = within(otpLabel).getByRole('button', { name: /Send OTP/i });

  await userEvent.click(sendBtn);

  // Expect error text shown in the special OTP error block
  const errorNode = await screen.findByText(/Too many requests/i);
  expect(errorNode).toBeInTheDocument();
});

test('changing email while OTP active resets countdown and clears OTP field', async () => {
  jest.useFakeTimers();
  authService.sendVerificationEmail.mockResolvedValue({ ok: true });

  render(<AuthForm mode="register" onSuccess={jest.fn()} />);

  const emailInput = screen.getByLabelText(/^Email$/i);
  await userEvent.type(emailInput, 'user1@example.com');

  const otpLabel = screen.getByText(/^OTP$/i).closest('.ant-form-item');
  const sendBtn = within(otpLabel).getByRole('button', { name: /Send OTP/i });
  await userEvent.click(sendBtn);

  await waitFor(() => expect(authService.sendVerificationEmail).toHaveBeenCalled());

  // ensure countdown active
  expect(within(otpLabel).getByRole('button')).toHaveTextContent(/Resend in/i);

  // change email -> should reset countdown to Send OTP
  await userEvent.clear(emailInput);
  await userEvent.type(emailInput, 'new@example.com');

  // immediate UI update
  expect(within(otpLabel).getByRole('button')).toHaveTextContent(/Send OTP/i);

  jest.useRealTimers();
});

// test('submit register with minimal valid values calls onSuccess', async () => {
//   const onSuccess = jest.fn().mockResolvedValue();
//   render(<AuthForm mode="register" onSuccess={onSuccess} />);

//   // Fill required fields. Some AntD controls are complex; we set values where straightforward.
//   await userEvent.type(screen.getByLabelText(/Username/i), 'TestUser');
//   await userEvent.type(screen.getByLabelText(/^Password$/i), 'Abcd1234');
//   await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'Abcd1234');

//   // Select gender via keyboard: focus select and type option then Enter
//   const genderSelect = screen.getByLabelText(/Gender/i).querySelector('input');
//   if (genderSelect) {
//     await userEvent.click(genderSelect);
//     await userEvent.type(genderSelect, 'male');
//     await userEvent.keyboard('{Enter}');
//   }

//   // Set birthday by typing into DatePicker input (AntD DatePicker uses input)
//   const birthdayInput = screen.getByPlaceholderText(/Select birthday/i);
//   // provide a valid date string in YYYY-MM-DD format
//   await userEvent.type(birthdayInput, dayjs().subtract(20, 'year').format('YYYY-MM-DD'));
//   await userEvent.keyboard('{Enter}');

//   await userEvent.type(screen.getByLabelText(/^Email$/i), 'reg@example.com');
//   await userEvent.type(screen.getByPlaceholderText(/Enter OTP/i), '123456');

//   const submit = screen.getByRole('button', { name: /Create Account/i });
//   await userEvent.click(submit);

//   // onSuccess should be called with form values (birthday comes as dayjs/moment possibly; shape check)
//   await waitFor(() => {
//     expect(onSuccess).toHaveBeenCalled();
//     const arg = onSuccess.mock.calls[0][0];
//     expect(arg).toMatchObject({
//       username: 'TestUser',
//       password: 'Abcd1234',
//       otp: '123456',
//       email: 'reg@example.com',
//     });
//   });
// });
