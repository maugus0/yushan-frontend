import React from 'react';
import { Breadcrumb, Card, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../../components/auth/auth-form';
import './register.css';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 16px' }}>
      <Breadcrumb
        // Use React Router <Link> to respect basename on GitHub Pages
        items={[
          { title: <Link to="/">Home</Link> },
          { title: 'Register' },
        ]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Create Account">
        <AuthForm
          mode="register"
          onSuccess={() => {
            // Replace with navigation after backend integration
            // navigate('/dashboard');
            console.log('Register static success');
          }}
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