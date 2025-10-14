import { useState } from 'react';
import { Breadcrumb, Card, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/auth';
import AuthForm from '../../components/auth/auth-form';
import { login } from '../../store/slices/user';
import './register.css';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerError, setRegisterError] = useState('');

  const handleRegister = async (values) => {
    try {
      setRegisterError(''); // Clear previous errors
      console.log('Registration values:', values);
      const userData = await authService.register(values);
      console.log('Registration response:', userData);
      dispatch(login(userData));
      message.success('Registration successful! Welcome to Yushan!', 5);
      navigate('/');
    } catch (error) {
      console.error('Registration error caught in component:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });

      // Display user-friendly error message
      const errorMessage =
        error.message || error.response?.data?.message || 'Registration failed. Please try again';

      setRegisterError(errorMessage); // Set error for display in form
      message.error(errorMessage, 5); // Show for 5 seconds

      // Handle specific error types with visual feedback
      if (error.message?.includes('verification code') || error.message?.includes('code expired')) {
        // Highlight OTP field
        const otpInput = document.querySelector('input[placeholder*="OTP"]');
        if (otpInput) {
          otpInput.focus();
          otpInput.classList.add('shake');
          setTimeout(() => otpInput.classList.remove('shake'), 500);
        }
      } else if (
        error.message?.includes('Email already') ||
        error.message?.includes('email already')
      ) {
        // Highlight email field
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) {
          emailInput.focus();
          emailInput.classList.add('shake');
          setTimeout(() => emailInput.classList.remove('shake'), 500);
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 16px' }}>
      <Breadcrumb
        items={[{ title: <Link to="/">Home</Link> }, { title: 'Register' }]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Create Account">
        <AuthForm mode="register" onSuccess={handleRegister} registerError={registerError} />
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          {/* Use accessible link-style button instead of bare <a> without href */}
          <Button type="link" onClick={() => navigate('/login')}>
            Already have account? Login
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Register;
