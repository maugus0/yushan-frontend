import { useContext } from 'react';
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

  return (
    <Sider
      className="writer-sider"
      width={220}
      collapsedWidth={220}
      collapsible={false}
      trigger={null}
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
        <Tooltip title="Dashboard" placement="right" overlayClassName="writer-navbar-tooltip">
          <Button
            type="text"
            icon={<DashboardOutlined />}
            className="writer-navbar-btn"
            block
            size="large"
            style={{
              justifyContent: 'flex-start',
            }}
            onClick={() => navigate('/writerdashboard')}
          >
            <span>Dashboard</span>
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
            }}
            onClick={() => navigate('/writerworkspace')}
          >
            <span>Workspace</span>
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
            }}
            onClick={() => navigate('/writerinteraction')}
          >
            <span>Interaction</span>
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
        <span className="writer-navbar-username">{user.username}</span>
      </div>
    </Sider>
  );
};

export default WriterNavbar;
