import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';

// Static demo toggle for login without backend.
const USE_STATIC_DEMO_CHECK = true;
const DEMO_USER = { username: 'demo', password: 'Demo1234' };

// Password strength rule for registration only (not used on login).
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

const AuthForm = ({ mode = 'login', onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // After the first failed submit on login, switch to live validation.
  const [liveValidate, setLiveValidate] = useState(false);

  const isRegister = mode === 'register';

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      if (isRegister) {
        console.log('[STATIC SUBMIT] register values:', values);
        message.success('Registration form validated (static)');
        onSuccess && onSuccess(values);
        return;
      }

      console.log('[STATIC SUBMIT] login values:', values);

      if (USE_STATIC_DEMO_CHECK) {
        const ok = values.username === DEMO_USER.username && values.password === DEMO_USER.password;

        if (!ok) {
          message.error('Invalid username or password');
          return;
        }
      }

      message.success('Login validated (static)');
      onSuccess && onSuccess(values);
      // Replace with real API calls when backend is ready:
      /** const res = await apiLogin(values);
          if (res?.data?.token) localStorage.setItem('token', res.data.token);
          message.success('Login successful');
          onSuccess && onSuccess(res); **/
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

  // For login:
  // - before any failed submit: validate only on submit
  // - after first failed submit: validate on change & blur (smarter UX)
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
      requiredMark="optional"
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    >
      {/* Username */}
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

      {/* Email (registration only) */}
      {isRegister && (
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' },
          ]}
        >
          <Input placeholder="Enter email" type="email" />
        </Form.Item>
      )}

      {/* Password */}
      <Form.Item
        label="Password"
        name="password"
        validateTrigger={loginValidateTrigger}
        rules={
          isRegister
            ? [
                { required: true, message: 'Password is required' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve(); // covered by required
                    if (!passwordRegex.test(value)) {
                      return Promise.reject(
                        'At least 8 characters and include uppercase, lowercase, and a number'
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]
            : [{ required: true, message: 'Password is required' }]
        }
      >
        <Input.Password placeholder="Enter password" />
      </Form.Item>

      {/* Confirm Password (registration only) */}
      {isRegister && (
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Passwords do not match');
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm password" />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={submitting}>
          {isRegister ? 'Register' : 'Login'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AuthForm;
