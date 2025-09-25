import React from 'react';
import { Layout, Button, Avatar, Typography, Divider, Tooltip } from 'antd';
import { EditOutlined, ManOutlined, WomanOutlined, CalendarOutlined, StarFilled } from '@ant-design/icons';
import './profile.css';
import * as LevelIcons from '../../components/user/icons/levelicon';
import { MaleIcon, FemaleIcon } from '../../components/user/icons/gendericon';

const { Content } = Layout;
const { Title, Text } = Typography;

// mock user data
const user = {
  username: 'YushanUser',
  gender: 'male', // or 'female'
  level: 5,
  bio: 'A passionate reader. Love fantasy and sci-fi.A passionate reader. Love fantasy and sci-fi.',
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  joined: '2022-03-15',
  exp: 3200,
  avatar: require('../../assets/images/testimg.png'),
  bg: require('../../assets/images/userprofilecover.png'),
  hours: 128,
  books: 56,
};

const Profile = () => {
  const LevelIconComponent = LevelIcons[`LevelIcon${user.level}`] || LevelIcons.LevelIcon1;

  return (
    <Layout className="profile-layout-wrapper">
      <Content>
        <div className="profile-bg-section">
          <img src={user.bg} alt="profile-bg" className="profile-bg-img" />
          <div className="profile-bg-mask" />
          <div className="profile-bg-stats">
            <div className="profile-bg-stats-group">
              <div className="profile-bg-stats-item">
                <span className="profile-hours">{user.hours}</span>
                <span className="profile-hours-label">hours of reading</span>
              </div>
              <div className="profile-bg-stats-divider" />
              <div className="profile-bg-stats-item">
                <span className="profile-books">{user.books}</span>
                <span className="profile-books-label">read books</span>
              </div>
            </div>
          </div>
          <div className="profile-avatar-wrapper">
            <Avatar src={user.avatar} size={160} className="profile-avatar" />
          </div>
        </div>
        <div className="profile-content-section">
          <div className="profile-header-row">
            <div className="profile-header-left">
              <Title level={2} className="profile-username">{user.username}</Title>
            </div>
            <div className="profile-header-right">
              <Button type="primary" icon={<EditOutlined />} className="profile-edit-btn">
                Edit Profile
              </Button>
            </div>
          </div>
          <div className="profile-info-row">
            <div className="profile-info-left">
              <Text className="profile-bio">{user.bio}</Text>
              <div className="profile-id-row">
                <Text type="secondary" className="profile-uuid">ID: {user.uuid}</Text>
              </div>
              <div className="profile-join-row">
                <CalendarOutlined style={{ marginRight: 6, fontSize: 17 }} />
                <Text type="secondary" className="profile-joined">
                  {user.joined} joined
                </Text>
                <Divider type="vertical" />
                <span className="profile-exp">
                  <StarFilled style={{ color: '#faad14', marginRight: 4, fontSize: 17, verticalAlign: 'middle' }} />
                  EXP: {user.exp}
                </span>
              </div>
            </div>
            <div className="profile-info-right">
              {user.gender === 'male' || user.gender === 'female' ? (
                <Tooltip title={user.gender === 'male' ? 'Male' : 'Female'}>
                  {user.gender === 'male' ? (
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
