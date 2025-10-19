import { useState, useEffect, useContext } from 'react';
import { Layout, Button, Avatar, Tooltip } from 'antd';
import {
  ArrowLeftOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  RocketOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './writernavbar.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../store/UserContext';

const { Sider } = Layout;

const WriterNavbar = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 900);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Sider
      className="writer-sider"
      width={220}
      collapsed={collapsed}
      collapsedWidth={64} // 确保折叠宽度和 CSS 对应
    >
      <div className="writer-navbar-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="writer-navbar-back"
          size="large"
          onClick={() => navigate('/')}
        />
      </div>

      <div className="writer-navbar-menu">
        <Tooltip
          title={collapsed ? 'Dashboard' : ''}
          placement="right"
          overlayClassName="writer-navbar-tooltip"
        >
          <Button
            type="text"
            icon={<DashboardOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            onClick={() => navigate('/writerdashboard')}
          >
            {/* 修改点：当不折叠时才渲染文字 */}
            {!collapsed && 'Dashboard'}
          </Button>
        </Tooltip>

        <Tooltip
          title={collapsed ? 'Workspace' : ''}
          placement="right"
          overlayClassName="writer-navbar-tooltip"
        >
          <Button
            type="text"
            icon={<AppstoreOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            onClick={() => navigate('/writerworkspace')}
          >
            {/* 修改点：当不折叠时才渲染文字 */}
            {!collapsed && 'Workspace'}
          </Button>
        </Tooltip>

        <Tooltip
          title={collapsed ? 'Interaction' : ''}
          placement="right"
          overlayClassName="writer-navbar-tooltip"
        >
          <Button
            type="text"
            icon={<RocketOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            onClick={() => navigate('/writerinteraction')}
          >
            {/* 修改点：当不折叠时才渲染文字 */}
            {!collapsed && 'Interaction'}
          </Button>
        </Tooltip>
      </div>

      <div className="writer-navbar-footer writer-navbar-footer-fixed">
        <Avatar
          size={40}
          src={user.avatarUrl}
          icon={<UserOutlined />}
          className="writer-navbar-avatar"
        />
        {/* 修改点：当不折叠时才渲染用户名 */}
        {!collapsed && <span className="writer-navbar-username">{user.username}</span>}
      </div>
    </Sider>
  );
};

export default WriterNavbar;
