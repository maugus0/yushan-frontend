import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';

import LayoutWrapper from './components/common/layoutwrapper/layout-wrapper';

import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import Browse from './pages/browse/browse';
import Leaderboard from './pages/leaderboard/leaderboard';

import './app.css';

const themeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      setUser({ name: 'John Doe', email: 'john@example.com', avatar: null });
    }
  }, []);

  return (
    <ConfigProvider theme={themeConfig}>
      <Router
        basename={process.env.NODE_ENV === 'production' ? '/yushan-frontend' : ''}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Home />
                </LayoutWrapper>
              }
            />
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
              path="/browse/*"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Browse />
                </LayoutWrapper>
              }
            />

            {/* Leaderboard routes with support for categories */}
            <Route
              path="/rankings"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Leaderboard />
                </LayoutWrapper>
              }
            />
            <Route
              path="/rankings/Novel"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Leaderboard />
                </LayoutWrapper>
              }
            />
            <Route
              path="/rankings/Novel/:category"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Leaderboard />
                </LayoutWrapper>
              }
            />
            <Route
              path="/rankings/Readers"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Leaderboard />
                </LayoutWrapper>
              }
            />
            <Route
              path="/rankings/Writers"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Leaderboard />
                </LayoutWrapper>
              }
            />

            {/* Legacy routes for backward compatibility */}
            <Route path="/leaderboard" element={<Navigate to="/rankings/Novel" replace />} />
            <Route path="/leaderboard/Novel" element={<Navigate to="/rankings/Novel" replace />} />
            <Route
              path="/leaderboard/Readers"
              element={<Navigate to="/rankings/Readers" replace />}
            />
            <Route
              path="/leaderboard/Writers"
              element={<Navigate to="/rankings/Writers" replace />}
            />
            <Route
              path="/leaderboard/*"
              element={
                <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                  <Leaderboard />
                </LayoutWrapper>
              }
            />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
