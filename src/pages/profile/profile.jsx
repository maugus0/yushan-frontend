import React from 'react';
import { Layout, Button, Avatar, Typography, Divider, Tooltip } from 'antd';
import { EditOutlined, CalendarOutlined, StarFilled } from '@ant-design/icons';
import { useSelector } from 'react-redux'; // Import useSelector to fetch Redux data
import { useNavigate } from 'react-router-dom';
import './profile.css';
import * as LevelIcons from '../../components/user/icons/levelicon';
import { MaleIcon, FemaleIcon } from '../../components/user/icons/gendericon';
import { WriterIcon } from '../../components/user/icons/userrolesicon';

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  // Fetch user data from Redux
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

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
          </div>
          <div className="profile-info-row">
            <div className="profile-info-left">
              <Text className="profile-bio">{user.profileDetail}</Text>
              <div className="profile-id-row">
                <Text type="secondary" className="profile-uuid">
                  ID: {user.uuid}
                </Text>
              </div>
              <div className="profile-join-row">
                <CalendarOutlined style={{ marginRight: 6, fontSize: 17 }} />
                <Text type="secondary" className="profile-joined">
                  {user.createDate} joined
                </Text>
                <Divider type="vertical" />
                <span className="profile-exp">
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
