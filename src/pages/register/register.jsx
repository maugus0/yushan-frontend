import React from 'react';
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

  const handleRegister = async (values) => {
    try {
      console.log('Registration values:', values);
      const userData = await authService.register(values);
      console.log('Registration response:', userData);
      dispatch(login(userData));      
      message.success('Registration successful!');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 16px' }}>
      <Breadcrumb
        // Use React Router <Link> to respect basename on GitHub Pages
        items={[{ title: <Link to="/">Home</Link> }, { title: 'Register' }]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Create Account">
        <AuthForm
          mode="register"
          onSuccess={handleRegister}
        />
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
