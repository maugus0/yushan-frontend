import React, { useState, useRef, useEffect } from 'react';
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
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/user';
import './navbar.css';
import ContentPopover from '../contentpopover/contentpopover';

const { Header } = Layout;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch authentication status and user info from Redux
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef(null);

  // Focus search input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
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

  // mock data
  const browseMenuData = [
    {
      key: 'novels',
      label: 'Novels',
      right: [
        {
          title: 'MALELEAD',
          types: [
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
          types: ['Romance', 'Drama', 'Slice of Life', 'School Life', 'Comedy'],
        },
      ],
    },
    {
      key: 'comics',
      label: 'Comics',
      right: [
        { title: '', types: ['Manga', 'Manhua', 'Webtoon', 'Superhero', 'Fantasy', 'Romance'] },
      ],
    },
    {
      key: 'fanfics',
      label: 'Fan-fics',
      right: [{ title: '', types: ['Anime', 'Game', 'Movie', 'TV', 'Book', 'Original'] }],
    },
  ];
  const rankingsMenuData = [
    {
      key: 'novels rankings',
      label: 'Novels rankings',
    },
    {
      key: 'comics rankings',
      label: 'Comics rankings',
    },
    {
      key: 'fanfics rankings',
      label: 'Fan-fics rankings',
    },
  ];

  // Main navigation items
  const menuItems = [
    {
      key: 'browse',
      label: (
        <Popover
          placement="bottomLeft"
          trigger="hover"
          overlayClassName="popover-overlay"
          content={<ContentPopover data={browseMenuData} />}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <CompassOutlined style={{ fontSize: 28 }} />
            <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Browse</span>
          </div>
        </Popover>
      ),
      onClick: () => navigate('/browse'),
    },
    {
      key: 'rankings',
      label: (
        <Popover
          placement="bottomLeft"
          trigger="hover"
          overlayClassName="popover-overlay"
          content={<ContentPopover data={rankingsMenuData} />}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <BarChartOutlined style={{ fontSize: 28 }} />
            <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>Rankings</span>
          </div>
        </Popover>
      ),
      onClick: () => navigate('/rankings'),
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
      console.log('Search:', value);
      // Implement search logic
      navigate(`/search?q=${encodeURIComponent(value)}`);
      setSearchExpanded(false);
      setSearchValue('');
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
            selectedKeys={[location.pathname.slice(1) || 'home']}
            className="nav-menu"
            items={menuItems}
          />
        </div>

        {/* Search Bar - Expandable */}
        <div className={`navbar-search ${searchExpanded ? 'expanded' : ''}`}>
          {searchExpanded ? (
            <div className="search-input-container">
              <Input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={() => handleSearch(searchValue)}
                placeholder="Search projects, users..."
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

        {/* Right Side Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Library */}
              <Button
                type="text"
                icon={<BookOutlined />}
                className="nav-button"
                onClick={() => navigate('/library')}
              >
                Library
              </Button>

              {/* User Avatar */}
              <Dropdown
                menu={{ items: userMenuItems }}
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
              placeholder="Search projects, users..."
              prefix={<SearchOutlined />}
              onPressEnter={(e) => handleSearch(e.target.value)}
              className="mobile-search"
            />
          </div>

          {/* Mobile Menu */}
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname.slice(1) || 'home']}
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
                  onClick={() => navigate('/library')}
                  style={{ marginBottom: '12px' }}
                >
                  Library
                </Button>
                <Button
                  block
                  icon={<UserOutlined />}
                  onClick={() => navigate('/profile')}
                  style={{ marginBottom: '12px' }}
                >
                  Profile
                </Button>
                <Button
                  block
                  icon={<SettingOutlined />}
                  onClick={() => navigate('/settings')}
                  style={{ marginBottom: '12px' }}
                >
                  Settings
                </Button>
                <Button
                  block
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    dispatch(logout());
                    navigate('/login');
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div>
                <Button block onClick={() => navigate('/login')} style={{ marginBottom: '12px' }}>
                  Login
                </Button>
                <Button block type="primary" onClick={() => navigate('/register')}>
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
