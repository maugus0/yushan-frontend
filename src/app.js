import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store';
import { message } from 'antd';
import 'antd/dist/reset.css';

import { useSelector, useDispatch } from 'react-redux';
import { setAuthenticated } from './store/slices/user';
import authService from './services/auth';

// Layout Components
import LayoutWrapper from './components/common/layoutwrapper/layout-wrapper';

// Page Components
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import Browse from './pages/browse/browse';
import Profile from './pages/profile/profile';
import EditProfile from './pages/editprofile/editprofile';
import Leaderboard from './pages/leaderboard/leaderboard';
import Library from './pages/library/library';
import WriterDashboard from './pages/writerdashboard/writerdashboard';
import WriterWorkspace from './pages/writerworkspace/writerworkspace';
import WriterInteraction from './pages/writerinteraction/writerinteraction';
import WriterCreate from './pages/writercreate/writercreate';
import WriterStoryProfile from './pages/writerstoryprofile/writerstoryprofile';
import WriterCreateChapters from './pages/writercreatechapters/writercreatechapters';
import WriterAuth from './pages/writerauth/writerauth';

// Global Styles
import './app.css';
import './utils/axios-interceptor';
import { UserProvider } from './store/UserContext';

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

const ProtectedRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    if (location.pathname === '/login' || location.pathname === '/register') {
      return children;
    }
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // AC3: Check authentication on app load
  useEffect(() => {
    const initAuth = () => {
      const token = authService.getToken();
      const isAuthed = !!token;
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
                {/* Public routes */}
                <Route
                  path="/login"
                  element={
                    <LayoutWrapper>
                      <Login />
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <LayoutWrapper>
                      <Register />
                    </LayoutWrapper>
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

                {/* Writer routes with UserProvider */}
                <Route
                  path="/writerdashboard"
                  element={
                    <UserProvider>
                      <WriterDashboard />
                    </UserProvider>
                  }
                />
                <Route
                  path="/writerworkspace"
                  element={
                    <UserProvider>
                      <WriterWorkspace />
                    </UserProvider>
                  }
                />
                <Route
                  path="/writerinteraction"
                  element={
                    <UserProvider>
                      <WriterInteraction />
                    </UserProvider>
                  }
                />
                <Route
                  path="/writercreate"
                  element={
                    <UserProvider>
                      <WriterCreate />
                    </UserProvider>
                  }
                />
                <Route
                  path="/writerstoryprofile"
                  element={
                    <UserProvider>
                      <WriterStoryProfile />
                    </UserProvider>
                  }
                />
                <Route
                  path="/writercreatechapters"
                  element={
                    <UserProvider>
                      <WriterCreateChapters />
                    </UserProvider>
                  }
                />
                <Route
                  path="/writerauth"
                  element={
                    <UserProvider>
                      <WriterAuth />
                    </UserProvider>
                  }
                />

                {/* Library route */}
                <Route
                  path="/library"
                  element={
                    <LayoutWrapper>
                      <Library />
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

                {/* Leaderboard routes */}
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

                {/* Legacy routes for backward compatibility */}
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
              </Routes>
            </div>
          </Router>
        </AntApp>
      </PersistGate>
    </ConfigProvider>
  );
}

export default App;