import React from 'react';
import { Breadcrumb, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/auth/AuthForm';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: '0 16px' }}>
      <Breadcrumb
        items={[
          { title: 'Home', href: '/' },
          //{ title: 'Auth' },
          { title: 'Login' }
        ]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Login">
        <AuthForm
          mode="login"
          onSuccess={() => {
            // Replace with navigation when backend is ready
            // navigate('/dashboard');
            console.log('Login static success');
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
