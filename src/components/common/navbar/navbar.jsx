import { useState, useRef, useEffect, useMemo } from 'react';
import { Layout, Menu, Button, Drawer, Avatar, Dropdown, Input, Popover } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  BarChartOutlined,
  CompassOutlined,
  BookOutlined,
  SettingOutlined,
  EditOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux'; // use store as source of truth
import authService from '../../../services/auth'; // unified auth operations
import './navbar.css';
import ContentPopover from '../contentpopover/contentpopover';
import userService from '../../../services/user';
import categoriesService from '../../../services/categories';

const { Header } = Layout;

function useIsMobile() {
  const get = () =>
    (typeof window !== 'undefined' && window.innerWidth < 768) ||
    (typeof window !== 'undefined' &&
      ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0));
  const [isMobile, setIsMobile] = useState(get());
  useEffect(() => {
    const onResize = () => setIsMobile(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

const slugify = (s = '') =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

// Accept optional props but default to Redux/auth when not provided
const Navbar = ({ isAuthenticated, user }) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([]);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Prefer Redux store; fallback to authService token presence
  const storeIsAuthenticated = useSelector((state) => state.user?.isAuthenticated);

  const finalIsAuthenticated =
    typeof isAuthenticated === 'boolean'
      ? isAuthenticated
      : (storeIsAuthenticated ?? authService.isAuthenticated());

  useEffect(() => {
    if (searchExpanded && searchInputRef.current) searchInputRef.current.focus();
  }, [searchExpanded]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoriesService.getCategories();
        setCategories(fetchedCategories.filter((cat) => cat.isActive));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { id: 1, name: 'Action' },
          { id: 2, name: 'Adventure' },
          { id: 3, name: 'Martial Arts' },
          { id: 4, name: 'Fantasy' },
          { id: 5, name: 'Sci-Fi' },
          { id: 6, name: 'Urban' },
          { id: 7, name: 'Historical' },
          { id: 8, name: 'Eastern Fantasy' },
          { id: 9, name: 'Wuxia' },
          { id: 10, name: 'Xianxia' },
          { id: 11, name: 'Military' },
          { id: 12, name: 'Sports' },
          { id: 13, name: 'Romance' },
          { id: 14, name: 'Drama' },
          { id: 15, name: 'Slice of Life' },
          { id: 16, name: 'School Life' },
          { id: 17, name: 'Comedy' },
        ]);
      }
    };

    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!finalIsAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await userService.getMe();
    if (res.isAuthor === true) {
      navigate('/writerdashboard');
    } else {
      navigate('/writerauth');
    }
  };

  const browseMenuData = useMemo(
    () => [
      {
        key: 'novels',
        label: 'Novels',
        right: [
          {
            title: 'CATEGORIES',
            types: categories.map((cat) => cat.name),
          },
        ],
      },
    ],
    [categories]
  );

  const rankingsPopoverItems = useMemo(
    () => [
      { key: 'Novel', label: 'Novel Rankings', to: '/rankings/Novel' },
      { key: 'Readers', label: 'Reader Rankings', to: '/rankings/Readers' },
      { key: 'Writers', label: 'Writers Rankings', to: '/rankings/Writers' },
    ],
    []
  );

  const handleBrowseSelect = (_sectionKey, typeLabel) => {
    if (typeLabel) {
      // Find the category by name to get the ID
      const category = categories.find((cat) => cat.name === typeLabel);
      if (category) {
        navigate(`/browse?category=${category.id}`);
      } else {
        // Fallback to slug-based navigation if category not found
        const slug = slugify(typeLabel);
        navigate(`/browse/novel/${slug}`);
      }
    } else {
      navigate('/browse/novel');
    }
    setMobileMenuVisible(false);
  };

  const BrowseLabel = isMobile ? (
    <div
      style={{ display: 'flex, alignItems: "center"', gap: 8, cursor: 'pointer' }}
      onClick={() => {
        navigate('/browse/novel');
        setMobileMenuVisible(false);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate('/browse/novel');
          setMobileMenuVisible(false);
        }
      }}
    >
      <CompassOutlined style={{ fontSize: 28 }} />
      <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Browse</span>
    </div>
  ) : (
    <Popover
      placement="bottomLeft"
      trigger="hover"
      overlayClassName="browse-popover-overlay"
      content={
        <ContentPopover data={browseMenuData} onSelect={handleBrowseSelect} categoriesOnly />
      }
      destroyTooltipOnHide
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => navigate('/browse/novel')}
      >
        <CompassOutlined style={{ fontSize: 28 }} />
        <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Browse</span>
      </div>
    </Popover>
  );

  const RankingsLabel = isMobile ? (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
      onClick={() => {
        navigate('/rankings');
        setMobileMenuVisible(false);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate('/rankings');
          setMobileMenuVisible(false);
        }
      }}
    >
      <BarChartOutlined style={{ fontSize: 28 }} />
      <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Rankings</span>
    </div>
  ) : (
    <Popover
      placement="bottomLeft"
      trigger="hover"
      overlayClassName="browse-popover-overlay"
      content={
        <div className="rankings-popover">
          {rankingsPopoverItems.map((it) => (
            <div
              key={it.key}
              className="rankings-popover-item"
              onClick={() => navigate(it.to)}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate(it.to);
              }}
            >
              {it.label}
            </div>
          ))}
        </div>
      }
      destroyTooltipOnHide
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => navigate('/rankings')}
      >
        <BarChartOutlined style={{ fontSize: 28 }} />
        <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Rankings</span>
      </div>
    </Popover>
  );

  const menuItems = [
    {
      key: 'browse',
      label: BrowseLabel,
      onClick: () => {
        if (isMobile) {
          navigate('/browse/novel');
          setMobileMenuVisible(false);
        }
      },
    },
    {
      key: 'leaderboard',
      label: RankingsLabel,
      onClick: () => {
        if (isMobile) {
          navigate('/rankings');
          setMobileMenuVisible(false);
        }
      },
    },
    {
      key: 'create',
      icon: <EditOutlined style={{ fontSize: 28 }} />,
      label: <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Create</span>,
      onClick: () => {
        handleCreate();
      },
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'library',
      icon: <BookOutlined />,
      label: 'My Library',
      onClick: () => navigate('/library'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      // Point to the new reading settings page
      onClick: () => navigate('/settings/reading'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: async () => {
        try {
          await authService.logout();
        } catch {
          await authService.clearTokens?.();
        } finally {
          navigate('/login');
        }
      },
    },
  ];

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`);
      setSearchExpanded(false);
      setSearchValue('');
      setMobileMenuVisible(false);
    }
  };

  return (
    <Header className="modern-navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">Y</div>
          <span className="logo-text">Yushan</span>
        </div>

        <div className="navbar-nav">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[
              location.pathname.startsWith('/browse')
                ? 'browse'
                : location.pathname.startsWith('/leaderboard') ||
                    location.pathname.startsWith('/rankings')
                  ? 'leaderboard'
                  : location.pathname.slice(1) || 'home',
            ]}
            className="nav-menu"
            items={menuItems}
          />
        </div>

        <div className={`navbar-search ${searchExpanded ? 'expanded' : ''}`}>
          {searchExpanded ? (
            <div className="search-input-container">
              <Input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={() => handleSearch(searchValue)}
                placeholder="Search novels, comics, fan-fics..."
                className="search-input"
                suffix={
                  <div className="search-actions">
                    <Button
                      type="text"
                      icon={<SearchOutlined />}
                      onClick={() => handleSearch(searchValue)}
                      className="search-submit"
                    />
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => setSearchExpanded(false)}
                      className="search-close"
                    />
                  </div>
                }
              />
            </div>
          ) : (
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => setSearchExpanded(true)}
              className="search-button"
            >
              Search
            </Button>
          )}
        </div>

        <div className="navbar-actions">
          {finalIsAuthenticated ? (
            <>
              <Button
                type="text"
                icon={<BookOutlined />}
                className="nav-button"
                onClick={() => navigate('/library')}
              >
                Library
              </Button>

              <Dropdown menu={{ items: [{ type: 'group', label: 'Account' }, ...[]] }} />
              <Dropdown
                menu={{
                  items: userMenuItems,
                }}
                placement="bottomRight"
                trigger={['click']}
                overlayClassName="user-dropdown"
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  src={user?.avatarUrl}
                  style={{
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: 'none',
                    background: 'transparent',
                    padding: 0,
                    margin: 0,
                  }}
                />
              </Dropdown>
            </>
          ) : (
            <div className="auth-buttons">
              <Button
                type={location.pathname === '/login' ? 'primary' : 'text'}
                onClick={() => navigate('/login')}
                className={`login-btn${location.pathname === '/login' ? ' active' : ''}`}
              >
                Login
              </Button>
              <Button
                type={location.pathname === '/register' ? 'primary' : 'text'}
                onClick={() => navigate('/register')}
                className={`signup-btn${location.pathname === '/register' ? ' active' : ''}`}
              >
                Register
              </Button>
            </div>
          )}
        </div>

        <Button
          className="mobile-menu-button"
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuVisible(true)}
        />

        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="logo-icon mobile">Y</div>
              <span>Yushan</span>
            </div>
          }
          placement="right"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          className="mobile-drawer"
          width={280}
        >
          <div style={{ marginBottom: '20px' }}>
            <Input
              placeholder="Search novels, comics, fan-fics..."
              prefix={<SearchOutlined />}
              onPressEnter={(e) => handleSearch(e.target.value)}
              className="mobile-search"
            />
          </div>

          <Menu
            mode="vertical"
            selectedKeys={[
              location.pathname.startsWith('/browse')
                ? 'browse'
                : location.pathname.startsWith('/leaderboard') ||
                    location.pathname.startsWith('/rankings')
                  ? 'leaderboard'
                  : location.pathname.slice(1) || 'home',
            ]}
            items={menuItems}
            style={{ border: 'none', background: 'transparent' }}
            theme="dark"
          />
        </Drawer>
      </div>
    </Header>
  );
};

export default Navbar;
