import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles

import { useSelector } from 'react-redux';

// Layout Components - Fixed to lowercase
import LayoutWrapper from './components/common/layoutwrapper/layout-wrapper';

// Page Components - Fixed to lowercase
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import Browse from './pages/browse/browse';
import Profile from './pages/profile/profile';
import EditProfile from './pages/editprofile/editprofile';

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

// Route protection wrapper
const ProtectedRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.user);

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
            {/* Public routes with LayoutWrapper and redirect if authenticated */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                    <Login />
                  </LayoutWrapper>
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                    <Register />
                  </LayoutWrapper>
                )
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                    <Home />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                    <Profile />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/editprofile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                    <EditProfile />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/*"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                    <Browse />
                  </LayoutWrapper>
                </ProtectedRoute>
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
