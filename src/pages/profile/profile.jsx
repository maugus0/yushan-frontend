import React, { useEffect, useState } from 'react';
import { Layout, Button, Avatar, Typography, Divider, Tooltip } from 'antd';
import { EditOutlined, CalendarOutlined, StarFilled } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import './profile.css';
import * as LevelIcons from '../../components/user/icons/levelicon';
import { MaleIcon, FemaleIcon } from '../../components/user/icons/gendericon';
import { WriterIcon } from '../../components/user/icons/userrolesicon';
import userProfileService from '../../services/userProfile';

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  const { user: currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Get userId from query string
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get('userId');

  const [user, setUser] = useState(currentUser);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (userId && userId !== currentUser?.uuid) {
      // Fetch target user profile
      setLoading(true);
      userProfileService
        .getUserById(userId)
        .then((data) => {
          setUser(data);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(currentUser);
      setLoading(false);
    }
  }, [userId, currentUser]);

  if (loading || !user) {
    return <div style={{ padding: 64, textAlign: 'center' }}>Loading...</div>;
  }

  const LevelIconComponent = LevelIcons[`LevelIcon${user.level}`] || LevelIcons.LevelIcon1;

  return (
    <Layout className="profile-layout-wrapper">
      <Content>
        <div className="profile-bg-section">
          <img
            src={require('../../assets/images/userprofilecover.png')}
            alt="profile-bg"
            className="profile-bg-img"
          />
          <div className="profile-bg-mask" />
          <div className="profile-bg-stats">
            <div className="profile-bg-stats-group">
              <div className="profile-bg-stats-item">
                <span className="profile-hours">{user.readTime}</span>
                <span className="profile-hours-label">hours of reading</span>
              </div>
              <div className="profile-bg-stats-divider" />
              <div className="profile-bg-stats-item">
                <span className="profile-books">{user.readBookNum}</span>
                <span className="profile-books-label">read books</span>
              </div>
            </div>
          </div>
          <div className="profile-avatar-wrapper">
            <Avatar src={user.avatarUrl} size={160} className="profile-avatar" />
          </div>
        </div>
        <div className="profile-content-section">
          <div className="profile-header-row">
            <div className="profile-header-left">
              <Title level={2} className="profile-username">
                {user.username}
                {user.isAuthor && (
                  <Tooltip title="Author">
                    <WriterIcon
                      width={30}
                      height={30}
                      style={{ verticalAlign: 'middle', marginLeft: 8 }}
                    />
                  </Tooltip>
                )}
              </Title>
            </div>
            {/* Only show Edit Profile button if viewing own profile */}
            {(!userId || userId === currentUser?.uuid) && (
              <div className="profile-header-right">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="profile-edit-btn"
                  onClick={() => {
                    navigate('/editprofile');
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
          <div className="profile-info-row">
            <div className="profile-info-left">
              <Text
                className="profile-bio"
                style={{ fontSize: 16, marginBottom: 12, display: 'block', color: '#333' }}
              >
                {user.profileDetail}
              </Text>
              <div className="profile-id-row" style={{ marginBottom: 6 }}>
                <Text type="secondary" className="profile-uuid" style={{ fontSize: 13 }}>
                  ID: {user.uuid}
                </Text>
              </div>
              <div className="profile-email-row" style={{ marginBottom: 10 }}>
                <Text type="secondary" className="profile-email" style={{ fontSize: 13 }}>
                  email: {user.email}
                </Text>
              </div>
              <div
                className="profile-join-row"
                style={{ marginBottom: 6, display: 'flex', alignItems: 'center' }}
              >
                <CalendarOutlined style={{ marginRight: 6, fontSize: 17 }} />
                <Text type="secondary" className="profile-joined" style={{ fontSize: 13 }}>
                  {user.createDate || user.createTime} joined
                </Text>
                <Divider type="vertical" style={{ margin: '0 8px' }} />
                <span className="profile-exp" style={{ fontSize: 13 }}>
                  <StarFilled
                    style={{
                      color: '#faad14',
                      marginRight: 4,
                      fontSize: 17,
                      verticalAlign: 'middle',
                    }}
                  />
                  EXP: {user.exp}
                </span>
              </div>
            </div>
            <div className="profile-info-right">
              {user.gender === 1 || user.gender === 2 ? (
                <Tooltip title={user.gender === 1 ? 'Male' : 'Female'}>
                  {user.gender === 1 ? (
                    <MaleIcon width={20} height={20} style={{ verticalAlign: 'middle' }} />
                  ) : (
                    <FemaleIcon width={20} height={20} style={{ verticalAlign: 'middle' }} />
                  )}
                </Tooltip>
              ) : null}
              <Tooltip title={`Level ${user.level}`}>
                <LevelIconComponent width={40} height={40} style={{ verticalAlign: 'middle' }} />
              </Tooltip>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Profile;
