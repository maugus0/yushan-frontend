import React from 'react';
import { Breadcrumb, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/auth/AuthForm';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 16px' }}>
      <Breadcrumb
        items={[
          { title: 'Home', href: '/' },
          //{ title: 'Auth' },
          { title: 'Register' }
        ]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Create Account">
        <AuthForm
          mode="register"
          onSuccess={() => {
            // Replace with navigation after backend integration
            // navigate('/Register');
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
