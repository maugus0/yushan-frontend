import React, { useState } from 'react';

const LoginPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        console.log('Login attempt:', formData);
        alert('Login functionality will be implemented with backend integration');
        // After successful login, you might want to:
        // onNavigate('dashboard'); // Navigate to user dashboard
      }, 1000);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Back to Home Button */}
      <button
        onClick={() => onNavigate('home')}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
          e.target.style.borderColor = 'rgba(255,255,255,0.5)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
        }}
      >
        ← Back to Home
      </button>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '3rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}>
        {/* Logo/Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📚
          </div>
          <h1 style={{
            fontSize: '2.2rem',
            marginBottom: '0.5rem',
            color: '#2c3e50',
            fontWeight: 'bold'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#7f8c8d', fontSize: '1rem' }}>
            Sign in to continue your reading journey
          </p>
        </div>
        
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#2c3e50',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                border: errors.email ? '2px solid #e74c3c' : '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                backgroundColor: errors.email ? '#fdf2f2' : '#ffffff'
              }}
              placeholder="Enter your email"
              onFocus={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#e9ecef';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors.email && (
              <span style={{ 
                color: '#e74c3c', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem', 
                display: 'block',
                fontWeight: '500'
              }}>
                ⚠️ {errors.email}
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#2c3e50',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                border: errors.password ? '2px solid #e74c3c' : '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                backgroundColor: errors.password ? '#fdf2f2' : '#ffffff'
              }}
              placeholder="Enter your password"
              onFocus={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = '#e9ecef';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors.password && (
              <span style={{ 
                color: '#e74c3c', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem', 
                display: 'block',
                fontWeight: '500'
              }}>
                ⚠️ {errors.password}
              </span>
            )}
          </div>

          {/* Remember Me and Forgot Password */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#7f8c8d'
            }}>
              <input 
                type="checkbox" 
                style={{ marginRight: '0.5rem' }}
              />
              Remember me
            </label>
            <button 
              type="button"
              style={{ 
                color: '#3498db', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
              onClick={() => alert('Forgot password functionality coming soon!')}
            >
              Forgot Password?
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.9rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1.5rem',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ 
                  marginRight: '0.5rem',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block'
                }}>
                  ⟳
                </span>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#7f8c8d', fontSize: '0.95rem' }}>
            Don't have an account?{' '}
            <button 
              onClick={() => onNavigate('register')}
              style={{ 
                color: '#3498db', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Sign up here
            </button>
          </p>
        </div>

        {/* Social Login Options (Optional) */}
        <div style={{ 
          marginTop: '2rem', 
          paddingTop: '2rem', 
          borderTop: '1px solid #e9ecef'
        }}>
          <p style={{ 
            textAlign: 'center', 
            color: '#7f8c8d', 
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            Or continue with
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{
              flex: 1,
              padding: '0.7rem',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#2c3e50',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.borderColor = '#3498db';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e9ecef';
            }}
            onClick={() => alert('Google login coming soon!')}
            >
              🔍 Google
            </button>
            <button style={{
              flex: 1,
              padding: '0.7rem',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#2c3e50',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.borderColor = '#3498db';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e9ecef';
            }}
            onClick={() => alert('GitHub login coming soon!')}
            >
              🐙 GitHub
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;