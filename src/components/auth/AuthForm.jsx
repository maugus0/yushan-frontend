import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';

// 密码强度规则（后期可抽到 utils/validators.js）
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

const AuthForm = ({ mode = 'login', onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === 'register';

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      // 纯静态：打印并提示成功
      console.log(`[STATIC SUBMIT] ${mode} values:`, values);
      message.success(`${isRegister ? 'Register' : 'Login'} form validated (static)`);

  //  后续接入后端时的改动点 替换为：
  // const res = isRegister ? await apiRegister(values) : await apiLogin(values);
  // message.success(isRegister ? 'Registration successful' : 'Login successful');
      onSuccess && onSuccess(values);
    } catch (e) {
      message.error('Unexpected error (static)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
      requiredMark="optional"
      onFinish={handleFinish}
    >
      <Form.Item
        label="Username"
        name="username"
        rules={[
          { required: true, message: 'Username is required' },
          { min: 3, message: 'Minimum 3 characters' },
          { max: 20, message: 'Maximum 20 characters' }
        ]}
      >
        <Input placeholder="Enter username" />
      </Form.Item>

      {isRegister && (
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' }
          ]}
        >
          <Input placeholder="Enter email" type="email" />
        </Form.Item>
      )}

      <Form.Item
        label="Password"
        name="password"
        rules={[
          {
            required: true,
            message: 'Password is required'
          },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve(); // 已被 required 捕捉
              if (!passwordRegex.test(value)) {
                return Promise.reject(
                  '至少8位，需包含大写/小写字母和数字'
                );
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <Input.Password placeholder="Enter password" />
      </Form.Item>

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
              }
            })
          ]}
        >
          <Input.Password placeholder="Confirm password" />
      </Form.Item>
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={submitting}
        >
          {isRegister ? 'Register' : 'Login'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AuthForm;