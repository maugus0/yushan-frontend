import React, { useState } from 'react';
import { Form, Input, Button, message, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

// Static demo toggle for login without backend.
const USE_STATIC_DEMO_CHECK = true;
const DEMO_USER = { username: 'test', password: '1234' };

// Password strength rule for registration only (not used on login).
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

// Disable future dates for the birthday field.
const disabledFutureDate = (current) => {
  if (!current) return false;
  return current.endOf('day').isAfter(dayjs().endOf('day'));
};

const AuthForm = ({ mode = 'login', onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // After the first failed submit on login, switch to live validation.
  const [liveValidate, setLiveValidate] = useState(false);

  const isRegister = mode === 'register';

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
      };

      if (isRegister) {
        // Simulate successful registration in the current static demo setup.
        console.log('[STATIC SUBMIT] register values:', payload);
        message.success('Registration form validated (static)');
        onSuccess && onSuccess(payload);
        return;
      }

      // Login (static demo)
      console.log('[STATIC SUBMIT] login values:', payload);

      if (USE_STATIC_DEMO_CHECK) {
        const ok =
          payload.username === DEMO_USER.username && payload.password === DEMO_USER.password;
        if (!ok) {
          message.error('Invalid username or password');
          return;
        }
      }

      // Add a mock authToken for static demo
      const mockAuthToken = 'mockAuthToken12345';
      const userData = { ...payload, authToken: mockAuthToken };

      message.success('Login validated (static)');
      onSuccess && onSuccess(userData); // Pass userData with authToken to onSuccess
    } catch (e) {
      message.error('Unexpected error (static)');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishFailed = () => {
    // First time a login submit fails, enable live validation so errors clear as the user types.
    if (!isRegister && !liveValidate) setLiveValidate(true);
  };

  // For login UX:
  // - before any failed submit: validate only on submit
  // - after first failed submit: validate on change & blur
  const loginValidateTrigger = isRegister
    ? undefined
    : liveValidate
      ? ['onChange', 'onBlur']
      : ['onSubmit'];

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
      // Show AntD built-in red asterisk on required fields.
      requiredMark={true}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    >
      {/* Username (required) */}
      <Form.Item
        label="Username"
        name="username"
        validateTrigger={loginValidateTrigger}
        rules={
          isRegister
            ? [
                { required: true, message: 'Username is required' },
                { min: 3, message: 'Minimum 3 characters' },
                { max: 20, message: 'Maximum 20 characters' },
              ]
            : [{ required: true, message: 'Username is required' }]
        }
      >
        <Input placeholder="Enter username" />
      </Form.Item>

      {/* Email (registration only, required) */}
      {isRegister && (
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
      )}

      {/* Password (required) */}
      <Form.Item
        label="Password"
        name="password"
        rules={
          isRegister
            ? [
                { required: true, message: 'Password is required' },
                {
                  pattern: passwordRegex,
                  message: 'At least 8 characters with uppercase, lowercase and a number',
                },
              ]
            : [{ required: true, message: 'Password is required' }]
        }
        hasFeedback={isRegister}
      >
        <Input.Password placeholder="Enter password" />
      </Form.Item>

      {/* Confirm Password (registration only, required) */}
      {isRegister && (
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Re-enter password" />
        </Form.Item>
      )}

      {/* Gender (registration only, optional; no required rule => no asterisk) */}
      {isRegister && (
        <Form.Item label="Gender" name="gender">
          <Select placeholder="Select gender (optional)" allowClear>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="prefer_not_to_say">Prefer not to say</Option>
          </Select>
        </Form.Item>
      )}

      {/* Birthday (registration only, optional; future dates disabled) */}
      {isRegister && (
        <Form.Item label="Birthday" name="birthday">
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Select birthday (optional)"
            format="YYYY-MM-DD"
            disabledDate={disabledFutureDate}
          />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} block>
          {isRegister ? 'Create Account' : 'Login'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AuthForm;
