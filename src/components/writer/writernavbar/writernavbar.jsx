import React, { useState } from 'react';
import { Layout, Button, Avatar, Tooltip, Popover } from 'antd';
import {
  ArrowLeftOutlined,
  CloseOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  RocketOutlined,
  UserOutlined,
  PlusOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import './writernavbar.css';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

const WriterNavbar = ({ user = { username: 'Writer', avatarUrl: null } }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [workspacePopover, setWorkspacePopover] = useState(false);
  const navigate = useNavigate();

  return (
    <Sider
      className={`writer-sider${collapsed ? ' collapsed' : ''}`}
      width={220}
      collapsedWidth={64}
      collapsible
      collapsed={collapsed}
      trigger={null}
    >
      <div className="writer-navbar-header">
        {!collapsed && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="writer-navbar-back"
            size="large"
            onClick={() => navigate('/')}
          />
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <CloseOutlined />}
          className="writer-navbar-close"
          size="large"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>
      <div className="writer-navbar-menu" style={collapsed ? { alignItems: 'center' } : {}}>
        <Tooltip title="Dashboard" placement="right" overlayClassName="writer-navbar-tooltip">
          <Button
            type="text"
            icon={<DashboardOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            style={{
              justifyContent: 'flex-start',
              ...(collapsed
                ? {
                    padding: 0,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                : {}),
            }}
            onClick={() => navigate('/writerdashboard')}
          >
            {!collapsed && <span>Dashboard</span>}
          </Button>
        </Tooltip>
        <Tooltip title="Workspace" placement="right" overlayClassName="writer-navbar-tooltip">
          <Button
            type="text"
            icon={<AppstoreOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            style={{
              justifyContent: 'flex-start',
              ...(collapsed
                ? {
                    padding: 0,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                : {}),
            }}
            onClick={() => navigate('/writerworkspace')}
          >
            {!collapsed && <span>Workspace</span>}
          </Button>
        </Tooltip>
        <Tooltip title="Promote" placement="right" overlayClassName="writer-navbar-tooltip">
          <Button
            type="text"
            icon={<RocketOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            style={{
              justifyContent: 'flex-start',
              ...(collapsed
                ? {
                    padding: 0,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                : {}),
            }}
            onClick={() => navigate('/writerinteraction')}
          >
            {!collapsed && <span>Interaction</span>}
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
        {!collapsed && <span className="writer-navbar-username">{user.username}</span>}
      </div>
    </Sider>
  );
};

export default WriterNavbar;
