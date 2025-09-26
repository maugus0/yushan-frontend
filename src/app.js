import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles

// Layout Components - Fixed to lowercase
import LayoutWrapper from './components/common/layoutwrapper/layout-wrapper';

// Page Components - Fixed to lowercase
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import Profile from './pages/profile/profile';
import EditProfile from './pages/editprofile/editprofile'

// Global Styles
import './app.css';

// Ant Design Theme Configuration
const themeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
};

function App() {
  // State for authentication (you can replace this with your actual auth logic)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Example: Check authentication status on app load
  useEffect(() => {
    // Replace with your actual authentication check
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // You might want to decode the token or make an API call to get user info
      setUser({
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null,
      });
    }
  }, []);

  return (
    <ConfigProvider theme={themeConfig}>
      <Router
        basename={process.env.NODE_ENV === 'production' ? '/yushan-frontend' : ''}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App">
          <Routes>
            {/* Routes that use the common layout */}
            <Route
              path="/"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Home />
                </LayoutWrapper>
              }
            />

            {/* Authentication routes without full layout (optional) */}
            <Route
              path="/login"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
                </LayoutWrapper>
              }
            />

            <Route
              path="/register"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Register />
                </LayoutWrapper>
              }
            />

            <Route
              path="/profile"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Profile />
                </LayoutWrapper>
              }
            />

            <Route
              path="/editprofile"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <EditProfile />
                </LayoutWrapper>
              }
            />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
