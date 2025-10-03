import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store';
import { message } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles

import { useSelector, useDispatch } from 'react-redux';
import { setAuthenticated } from './store/slices/user';
import authService from './services/auth';

// Layout Components - Fixed to lowercase
import LayoutWrapper from './components/common/layoutwrapper/layout-wrapper';

// Page Components - Fixed to lowercase
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import Browse from './pages/browse/browse';
import Profile from './pages/profile/profile';
import EditProfile from './pages/editprofile/editprofile';
import Leaderboard from './pages/leaderboard/leaderboard';

// Global Styles
import './app.css';
import './utils/axios-interceptor';

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

// Set up message configuration globally
message.config({
  top: 24,
  duration: 3,
  maxCount: 3,
});

// Route protection wrapper
const ProtectedRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // AC3: Check authentication on app load
  useEffect(() => {
    const initAuth = () => {
      const isAuthed = authService.isAuthenticated();
      dispatch(setAuthenticated(isAuthed));
    };

    initAuth();
  }, [dispatch]);

  return (
    <ConfigProvider theme={themeConfig}>
      <PersistGate loading={null} persistor={persistor}>
        <AntApp>
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
                      <LayoutWrapper>
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
                      <LayoutWrapper>
                        <Register />
                      </LayoutWrapper>
                    )
                  }
                />

                <Route
                  path="/"
                  element={
                    <LayoutWrapper>
                      <Home />
                    </LayoutWrapper>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper>
                        <Profile />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/editprofile"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper>
                        <EditProfile />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/browse/*"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper>
                        <Browse />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />

                {/* Leaderboard routes with support for categories (protected) */}
                <Route
                  path="/rankings"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper isAuthenticated={isAuthenticated}>
                        <Leaderboard />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankings/Novel"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper isAuthenticated={isAuthenticated}>
                        <Leaderboard />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankings/Novel/:category"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper isAuthenticated={isAuthenticated}>
                        <Leaderboard />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankings/Readers"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper isAuthenticated={isAuthenticated}>
                        <Leaderboard />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankings/Writers"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper isAuthenticated={isAuthenticated}>
                        <Leaderboard />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />

                {/* Legacy routes for backward compatibility (also protected) */}
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Navigate to="/rankings/Novel" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard/Novel"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Navigate to="/rankings/Novel" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard/Readers"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Navigate to="/rankings/Readers" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard/Writers"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Navigate to="/rankings/Writers" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard/*"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <LayoutWrapper isAuthenticated={isAuthenticated}>
                        <Leaderboard />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />
                {/* Add more routes as needed */}
              </Routes>
            </div>
          </Router>
        </AntApp>
      </PersistGate>
    </ConfigProvider>
  );
}

export default App;
