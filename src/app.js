import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, message } from 'antd';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthenticated } from './store/slices/user';
import authService from './services/auth';
import 'antd/dist/reset.css';

// Layout Components
import LayoutWrapper from './components/common/layoutwrapper/layout-wrapper';

// Page Components
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import Browse from './pages/browse/browse';
import Leaderboard from './pages/leaderboard/leaderboard';
import Profile from './pages/profile/profile';
import EditProfile from './pages/editprofile/editprofile';

// Global Styles & interceptors
import './app.css';
import './utils/axios-interceptor';

// Theme configuration (keeps main's extended component tokens + YW-95 font family)
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

// Global message config
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
  const dispatch = useDispatch();

  // Read auth state from Redux if available
  const { isAuthenticated: reduxIsAuthenticated = false, user: reduxUser = null } = useSelector(
    (state) => state.user || {}
  );

  // Local fallback state (keeps compatibility with components expecting setIsAuthenticated/setUser props)
  const [isAuthenticated, setIsAuthenticated] = useState(reduxIsAuthenticated);
  const [user, setUser] = useState(reduxUser);

  // Keep local state in sync with Redux state
  useEffect(() => {
    setIsAuthenticated(reduxIsAuthenticated);
    setUser(reduxUser);
  }, [reduxIsAuthenticated, reduxUser]);

  // Initialize auth state on app load using authService
  useEffect(() => {
    const initAuth = () => {
      try {
        const auth = authService.isAuthenticated();
        // update redux store so other parts of app relying on Redux are consistent
        dispatch(setAuthenticated(!!auth));
        // if authService can provide user, attempt to set local user (non-breaking)
        if (auth && typeof auth === 'object' && auth.user) {
          setUser(auth.user);
        }
      } catch (err) {
        // ignore - keep defaults
        dispatch(setAuthenticated(false));
      }
    };

    initAuth();
  }, [dispatch]);

  // Helper that can be passed to legacy Login component expecting setIsAuthenticated / setUser
  const updateAuth = (authFlag, userObj = null) => {
    setIsAuthenticated(!!authFlag);
    if (userObj) setUser(userObj);
    dispatch(setAuthenticated(!!authFlag));
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <PersistGate loading={null} persistor={persistor}>
        <AntApp>
          <Router
            basename={process.env.NODE_ENV === 'production' ? '/yushan-frontend' : ''}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <div className="App">
              <Routes>
                {/* Public routes: login/register (redirect to / if already authenticated) */}
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/" replace />
                    ) : (
                      <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                        <Login setIsAuthenticated={updateAuth} setUser={setUser} />
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

                {/* Home */}
                <Route
                  path="/"
                  element={
                    <LayoutWrapper isAuthenticated={isAuthenticated} user={user}>
                      <Home />
                    </LayoutWrapper>
                  }
                />

                {/* Protected routes (profile/editprofile/browse) - follow main's protection policy */}
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

                {/* Leaderboard / rankings - kept public (from YW-95) with category support */}
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

                {/* Legacy routes for backward compatibility (redirects to /rankings/Novel) */}
                <Route path="/leaderboard" element={<Navigate to="/rankings/Novel" replace />} />
                <Route
                  path="/leaderboard/Novel"
                  element={<Navigate to="/rankings/Novel" replace />}
                />
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

                {/* Catch-all: (optional) could add 404 here */}
              </Routes>
            </div>
          </Router>
        </AntApp>
      </PersistGate>
    </ConfigProvider>
  );
}

export default App;
