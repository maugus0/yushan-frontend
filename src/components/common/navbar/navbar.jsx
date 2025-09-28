import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Layout, Menu, Button, Drawer, Avatar, Dropdown, Input, Badge, Popover } from 'antd';
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
  BellOutlined, // 补充引入 BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/user';
import './navbar.css';
import ContentPopover from '../contentpopover/contentpopover';

const { Header } = Layout;

/** Make a URL-friendly slug (must match browse page parser) */
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/** Build route path for a given top section and type */
const buildBrowsePath = (sectionKey, typeLabel) => {
  const sec = sectionKey === 'novels' ? 'novel' : sectionKey === 'fanfics' ? 'fanfics' : sectionKey;
  if (!typeLabel || typeLabel.toLowerCase() === 'all') return `/browse/${sec}`;
  return `/browse/${sec}/${slugify(typeLabel)}`;
};

/** Mobile detection: width < 768 or coarse pointer (touch) */
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

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Fetch authentication status and user info from Redux
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef(null);

  // Focus search input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) searchInputRef.current.focus();
  }, [searchExpanded]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && searchExpanded) {
        setSearchExpanded(false);
        setSearchValue('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [searchExpanded]);

  // Browse menu data
  const browseMenuData = useMemo(
    () => [
      {
        key: 'novels',
        label: 'Novels',
        right: [
          {
            title: 'MALELEAD',
            types: [
              'All',
              'Action',
              'Adventure',
              'Martial Arts',
              'Fantasy',
              'Sci-Fi',
              'Urban',
              'Historical',
              'Eastern Fantasy',
              'Wuxia',
              'Xianxia',
              'Military',
              'Sports',
            ],
          },
          {
            title: 'FEMALELEAD',
            types: ['All', 'Romance', 'Drama', 'Slice of Life', 'School Life', 'Comedy'],
          },
        ],
      },
      {
        key: 'comics',
        label: 'Comics',
        right: [
          {
            title: '',
            types: ['All', 'Manga', 'Manhua', 'Webtoon', 'Superhero', 'Fantasy', 'Romance'],
          },
        ],
      },
      {
        key: 'fanfics',
        label: 'Fan-fics',
        right: [{ title: '', types: ['All', 'Anime', 'Game', 'Movie', 'TV', 'Book', 'Original'] }],
      },
    ],
    []
  );

  const rankingsMenuData = useMemo(
    () => [
      { key: 'novels rankings', label: 'Novels rankings' },
      { key: 'comics rankings', label: 'Comics rankings' },
      { key: 'fanfics rankings', label: 'Fan-fics rankings' },
    ],
    []
  );

  // Navigate for popover selection (desktop)
  const handleBrowseSelect = (sectionKey, typeLabel) => {
    const path = buildBrowsePath(sectionKey, typeLabel);
    navigate(path);
    setMobileMenuVisible(false);
  };

  // Desktop: hover opens popover, click navigates to /browse
  // Mobile: no popover, click navigates to /browse
  const BrowseLabel = isMobile ? (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
      onClick={() => {
        navigate('/browse');
        setMobileMenuVisible(false);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate('/browse');
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
      trigger="hover" // hover only, so desktop click still navigates
      overlayClassName="browse-popover-overlay"
      content={<ContentPopover data={browseMenuData} onSelect={handleBrowseSelect} />}
      destroyTooltipOnHide
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => navigate('/browse')}
      >
        <CompassOutlined style={{ fontSize: 28 }} />
        <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Browse</span>
      </div>
    </Popover>
  );

  // Main nav items
  const menuItems = [
    {
      key: 'browse',
      label: BrowseLabel,
      onClick: () => {
        // fallback for any menu-level click handling on mobile
        if (isMobile) {
          navigate('/browse');
          setMobileMenuVisible(false);
        }
      },
    },
    {
      key: 'rankings',
      label: isMobile ? (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => {
            navigate('/rankings');
            setMobileMenuVisible(false);
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
          content={<ContentPopover data={rankingsMenuData} onSelect={() => {}} />}
          destroyTooltipOnHide
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <BarChartOutlined style={{ fontSize: 28 }} />
            <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Rankings</span>
          </div>
        </Popover>
      ),
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
      onClick: () => navigate('/create'),
    },
  ];

  // User dropdown menu
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
      onClick: () => {
        navigate('/settings');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        dispatch(logout());
        navigate('/login');
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

  const handleSearchToggle = () => {
    if (searchExpanded) {
      setSearchExpanded(false);
      setSearchValue('');
    } else {
      setSearchExpanded(true);
    }
  };

  return (
    <Header className="modern-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">Y</div>
          <span className="logo-text">Yushan</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[
              location.pathname.startsWith('/browse')
                ? 'browse'
                : location.pathname.slice(1) || 'home',
            ]}
            className="nav-menu"
            items={menuItems}
          />
        </div>

        {/* Search */}
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
                      onClick={handleSearchToggle}
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
              onClick={handleSearchToggle}
              className="search-button"
            >
              Search
            </Button>
          )}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
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

        {/* Mobile Menu Button */}
        <Button
          className="mobile-menu-button"
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuVisible(true)}
        />

        {/* Mobile Drawer */}
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
          {/* Mobile Search */}
          <div style={{ marginBottom: '20px' }}>
            <Input
              placeholder="Search novels, comics, fan-fics..."
              prefix={<SearchOutlined />}
              onPressEnter={(e) => handleSearch(e.target.value)}
              className="mobile-search"
            />
          </div>

          {/* Mobile Menu */}
          <Menu
            mode="vertical"
            selectedKeys={[
              location.pathname.startsWith('/browse')
                ? 'browse'
                : location.pathname.slice(1) || 'home',
            ]}
            items={menuItems}
            style={{ border: 'none', background: 'transparent' }}
            theme="dark"
          />

          {/* Mobile Auth */}
          <div className="mobile-auth">
            {isAuthenticated ? (
              <div>
                <Button
                  block
                  icon={<BookOutlined />}
                  onClick={() => {
                    navigate('/library');
                    setMobileMenuVisible(false);
                  }}
                  style={{ marginBottom: '12px' }}
                >
                  Library
                </Button>
                <Button
                  block
                  icon={<UserOutlined />}
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuVisible(false);
                  }}
                  style={{ marginBottom: '12px' }}
                >
                  Profile
                </Button>
                <Button
                  block
                  icon={<SettingOutlined />}
                  onClick={() => {
                    navigate('/settings');
                    setMobileMenuVisible(false);
                  }}
                  style={{ marginBottom: '12px' }}
                >
                  Settings
                </Button>
                <Button
                  block
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    dispatch(logout());
                    setMobileMenuVisible(false);
                    navigate('/login');
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  block
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuVisible(false);
                  }}
                  style={{ marginBottom: '12px' }}
                >
                  Login
                </Button>
                <Button
                  block
                  type="primary"
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuVisible(false);
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </Drawer>
      </div>
    </Header>
  );
};

export default Navbar;
