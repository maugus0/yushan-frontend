/**
 * Application root – adds ReadingSettingsProvider (new) and the Reader / Reading Settings routes.
 * Existing functionality for auth, protected routes, and other pages is preserved.
 */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store';
import 'antd/dist/reset.css';

import { setAuthenticated } from './store/slices/user';
import authService from './services/auth';

import './app.css';
import './index.css';
import './utils/axios-interceptor';

// Layout wrapper (already in project)
import LayoutWrapper from './components/common/layoutwrapper/layout-wrapper';

// NEW: Reading settings provider + new pages (added)
import { ReadingSettingsProvider } from './store/readingSettings';
import ReaderPage from './pages/reader/reader';
import ReadingSettingsPage from './pages/settings/reading-settings';

// Core pages
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
import NovelDetailPage from './pages/novel/novelDetailPage';

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
    Button: { borderRadius: 6, controlHeight: 40 },
    Input: { borderRadius: 6, controlHeight: 40 },
    Card: { borderRadiusLG: 12 },
  },
};

// Global message config
message.config({
  top: 24,
  duration: 3,
  maxCount: 3,
});

const ProtectedRoute = ({ isAuthenticated, children }) => {
  
  if (!isAuthenticated) {
    if (location.pathname === '/login' || location.pathname === '/register') {
      return children;
    }
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const ProtectedRouteWrapper = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  // Initialize auth state on mount (re-uses existing authService)
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
          {/* NEW: Wrap the whole app so any page (reader/settings) can access reading settings */}
          <ReadingSettingsProvider>
            <Router
              basename={process.env.NODE_ENV === 'production' ? '/yushan-frontend' : ''}
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <div className="App">
                <Routes>
                  {/* Public auth routes */}
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

                  {/* Library */}
                  <Route
                    path="/library"
                    element={
                      <LayoutWrapper>
                        <Library />
                      </LayoutWrapper>
                    }
                  />

                  {/* Protected user pages */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper>
                          <Profile />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/editprofile"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper>
                          <EditProfile />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/browse/*"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper>
                          <Browse />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />

                  {/* Leaderboard / rankings (original protected setup) */}
                  <Route
                    path="/rankings"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper isAuthenticated={isAuthenticated}>
                          <Leaderboard />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/rankings/Novel"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper isAuthenticated={isAuthenticated}>
                          <Leaderboard />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/rankings/Novel/:category"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper isAuthenticated={isAuthenticated}>
                          <Leaderboard />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/rankings/Readers"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper isAuthenticated={isAuthenticated}>
                          <Leaderboard />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/rankings/Writers"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper isAuthenticated={isAuthenticated}>
                          <Leaderboard />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />

                  {/* Legacy leaderboard redirects */}
                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <Navigate to="/rankings/Novel" replace />
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/leaderboard/Novel"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <Navigate to="/rankings/Novel" replace />
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/leaderboard/Readers"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <Navigate to="/rankings/Readers" replace />
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/leaderboard/Writers"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <Navigate to="/rankings/Writers" replace />
                      </ProtectedRouteWrapper>
                    }
                  />
                  <Route
                    path="/leaderboard/*"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper isAuthenticated={isAuthenticated}>
                          <Leaderboard />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />

                  {/* Novel detail (kept protected as in your version) */}
                  <Route
                    path="/novel/:novelId"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper isAuthenticated={isAuthenticated}>
                          <NovelDetailPage />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />

                  {/* NEW: Chapter reader route (protected) */}
                  <Route
                    path="/read/:novelId/:chapterId"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper>
                          <ReaderPage />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />

                  {/* NEW: Reading Settings route (protected) */}
                  <Route
                    path="/settings/reading"
                    element={
                      <ProtectedRouteWrapper isAuthenticated={isAuthenticated}>
                        <LayoutWrapper>
                          <ReadingSettingsPage />
                        </LayoutWrapper>
                      </ProtectedRouteWrapper>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </ReadingSettingsProvider>
        </AntApp>
      </PersistGate>
    </ConfigProvider>
  );
}

export default App;