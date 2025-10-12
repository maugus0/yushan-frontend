import React, { useEffect, useState } from 'react';
import { Breadcrumb, Card, Button, message } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/auth';
import AuthForm from '../../components/auth/auth-form';
import { login } from '../../store/slices/user';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check for expired session
    const expired = new URLSearchParams(location.search).get('expired');
    if (expired) {
      message.warning('Your session has expired. Please log in again.');
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const handleLogin = async (values) => {
    try {
      setLoginError(''); // Clear previous errors
      const userData = await authService.login(values.email, values.password);
      dispatch(login(userData));
      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);

      // Display user-friendly error message
      const errorMessage =
        error.message || error.response?.data?.message || 'Login failed. Please try again';

      setLoginError(errorMessage); // Set error for display in form
      message.error(errorMessage, 5); // Show for 5 seconds

      // If it's an authentication error, add visual feedback
      if (error.message?.includes('Invalid') || error.message?.includes('not found')) {
        // Add shake animation and focus on email field
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) {
          emailInput.classList.add('shake');
          setTimeout(() => emailInput.classList.remove('shake'), 500);
          emailInput.focus();
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: '0 16px' }}>
      <Breadcrumb
        // Use React Router <Link> to respect basename on GitHub Pages
        items={[{ title: <Link to="/">Home</Link> }, { title: 'Login' }]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Login">
        <AuthForm mode="login" onSuccess={handleLogin} loginError={loginError} />
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          {/* Use accessible link-style button instead of bare <a> without href */}
          <Button type="link" onClick={() => navigate('/register')}>
            No account? Register
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
