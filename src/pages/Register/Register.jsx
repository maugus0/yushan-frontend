
// const Register = () => {
//   return (
//     <div>
//       <h1>Register Page</h1>
//       {/* Registration form elements go here */}
//     </div>
//   );
// }

// export default Register;

import React from 'react';
import { Breadcrumb, Card } from 'antd';
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
          { title: 'Auth' },
          { title: 'Register' }
        ]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Create Account">
        <AuthForm
          mode="register"
          onSuccess={() => {
            console.log('Register static success');
            // 以后可以改成 navigate('/login');
          }}
        />
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <a onClick={() => navigate('/login')}>Already have account? Login</a>
        </div>
      </Card>
    </div>
  );
};

export default Register;