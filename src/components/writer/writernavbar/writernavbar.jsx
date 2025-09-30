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

const { Sider } = Layout;

const WriterNavbar = ({ user = { username: 'Writer', avatarUrl: null } }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [workspacePopover, setWorkspacePopover] = useState(false);

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
      <div className="writer-navbar-menu">
        <Tooltip title="Dashboard" placement="right" overlayClassName="writer-navbar-tooltip">
          <Button
            type="text"
            icon={<DashboardOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            style={{ justifyContent: 'flex-start' }} // 左对齐
          >
            {!collapsed && <span>Dashboard</span>}
          </Button>
        </Tooltip>
        <Popover
          placement="right"
          content={
            <div className="writer-navbar-popover">
              <Button type="text" icon={<PlusOutlined />} block style={{ textAlign: 'left' }}>
                Create
              </Button>
              <Button type="text" icon={<ToolOutlined />} block style={{ textAlign: 'left' }}>
                Maintain
              </Button>
            </div>
          }
          trigger="click"
          open={workspacePopover}
          onOpenChange={setWorkspacePopover}
        >
          <Tooltip title="Workspace" placement="right" overlayClassName="writer-navbar-tooltip">
            <Button
              type="text"
              icon={<AppstoreOutlined />}
              className="writer-navbar-btn"
              block
              size="large"
              onClick={() => setWorkspacePopover(!workspacePopover)}
              style={{ justifyContent: 'flex-start' }} // 左对齐
            >
              {!collapsed && <span>Workspace</span>}
            </Button>
          </Tooltip>
        </Popover>
        <Tooltip title="Promote" placement="right" overlayClassName="writer-navbar-tooltip">
          <Button
            type="text"
            icon={<RocketOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            style={{ justifyContent: 'flex-start' }}
          >
            {!collapsed && <span>Promote</span>}
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
