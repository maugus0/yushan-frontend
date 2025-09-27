import React from 'react';
import { Breadcrumb, Card, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import AuthForm from '../../components/auth/auth-form';
import { login } from '../../store/slices/user';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: '0 16px' }}>
      <Breadcrumb
        // Use React Router <Link> to respect basename on GitHub Pages
        items={[{ title: <Link to="/">Home</Link> }, { title: 'Login' }]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Login">
        <AuthForm
          mode="login"
          onSuccess={(userData) => {
            dispatch(login(userData));
            navigate('/');
          }}
        />
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
