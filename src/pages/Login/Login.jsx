
// const Login = () => {
//   return (
//     <div>
//       <h1>Login Page</h1>
//       {/* Registration form elements go here */}
//     </div>
//   );
// }

// export default Login;

import React from 'react';
import { Breadcrumb, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/auth/AuthForm';
import './Login.css'; // 如果你已有样式文件

const Login = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: '0 16px' }}>
      <Breadcrumb
        items={[
          { title: 'Home', href: '/' },
          { title: 'Auth' },
          { title: 'Login' }
        ]}
        style={{ marginBottom: 16 }}
      />
      <Card title="Login">
        <AuthForm
          mode="login"
          onSuccess={() => {
            // 静态模式：只是控制台打印。将来可 navigate('/dashboard')
            console.log('Login static success');
          }}
        />
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <a onClick={() => navigate('/register')}>No account? Register</a>
        </div>
      </Card>
    </div>
  );
};

export default Login;