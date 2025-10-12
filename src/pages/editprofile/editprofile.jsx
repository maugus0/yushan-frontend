import React, { useRef, useState, useEffect } from 'react';
import { Layout, Button, Avatar, Input, Form, Select, message, App } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/user';
import './editprofile.css';
import { useNavigate } from 'react-router-dom';
import userProfileService from '../../services/userProfile';
import { processUserAvatar, getGenderBasedAvatar } from '../../utils/imageUtils';
import authService from '../../services/auth';

const { Content } = Layout;
const { Option } = Select;

const EditProfile = () => {
  const fileInputRef = useRef();
  const [form] = Form.useForm();
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null); // State to store the selected avatar file
  const [avatarPreview, setAvatarPreview] = useState(''); // Preview of selected avatar
  const [isSaving, setIsSaving] = useState(false); // Loading state for save button

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Set initial avatar preview
  useEffect(() => {
    if (user) {
      const processedAvatar = processUserAvatar(
        user.avatarUrl,
        user.gender,
        process.env.REACT_APP_API_URL?.replace('/api', '/images')
      );
      setAvatarPreview(processedAvatar);
    }
  }, [user]);

  // timeout
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // activate save button
  const handleFormChange = () => {
    setIsDirty(true);
  };

  // email validation logic
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return 'Invalid email address';
    return '';
  };

  // send OTP
  const handleSendOtp = async () => {
    const email = form.getFieldValue('email');
    const error = validateEmail(email);
    setEmailError(error);
    if (error) {
      message.error(error);
      const el = document.querySelector('.editprofile-email-input');
      if (el) {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 500);
      }
      return;
    }

    try {
      await userProfileService.sendEmailChangeVerification(email);
      setCountdown(300);
      message.success('Verification email sent!');
    } catch (error) {
      console.error('Send OTP error:', error);
      message.error(error.response?.data?.message || 'Failed to send verification email');
    }
  };

  // email validation when changing email address
  const handleEmailBlur = (e) => {
    const value = e.target.value;
    const error = validateEmail(value);
    setEmailError(error);
    if (error) {
      const el = document.querySelector('.editprofile-email-input');
      if (el) {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 500);
      }
    }
  };

  // already entered OTP
  const handleOtpChange = (e) => {
    if (otpError && e.target.value) {
      setOtpError('');
    }
  };

  // saving
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // test OTP
      const emailChanged = values.email !== user.email;
      const otpEmpty = !values.otp;
      if (emailChanged && otpEmpty) {
        setOtpError('Please enter the OTP sent to your email.');
        message.error('Please enter the OTP sent to your email.');
        // error OTP
        const el = document.querySelector('input[placeholder="Enter OTP"]');
        if (el) {
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 500);
        }
        return;
      }

      let genderValue = null;
      if (values.gender === 'male') genderValue = 1;
      else if (values.gender === 'female') genderValue = 2;
      else genderValue = 0; // unknown

      // Prepare updated user data for API
      const profileData = {
        username: values.username,
        email: values.email,
        gender: genderValue,
        profileDetail: values.bio || '',
        avatarFile: avatarFile, // Will be added to FormData in service
        verificationCode: values.otp || undefined,
      };

      setIsSaving(true);

      // Call the API to update profile
      const response = await userProfileService.updateProfile(user.uuid, profileData);

      if (response.code === 200 && response.data) {
        // Update Redux store with new data
        dispatch(updateUser(response.data));

        // If email was changed and new tokens were issued, update them
        if (response.emailChanged && response.accessToken && response.refreshToken) {
          authService.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
          message.success(
            'Profile updated successfully! Email changed and you have been re-authenticated.'
          );
        } else {
          message.success('Profile updated successfully!');
        }

        setIsDirty(false);
        navigate('/profile');
      } else {
        message.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // cancel
  const handleCancel = () => {
    navigate('/profile');
  };

  // Handle avatar file selection
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        message.error('Please select an image file');
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error('Image size should not exceed 5MB');
        return;
      }

      setAvatarFile(file);
      setIsDirty(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar error with gender-based fallback
  const handleAvatarError = (e) => {
    if (!e || !e.target) {
      console.warn('Avatar error handler called without event');
      return false;
    }
    const fallback = getGenderBasedAvatar(user?.gender);
    if (e.target.src !== fallback) {
      e.target.src = fallback;
    }
    return true;
  };

  return (
    <App>
      <Layout className="editprofile-layout-wrapper">
        <Content>
          <div className="editprofile-bg-section">
            {/* Replace background image with a hardcoded value */}
            <img
              src={require('../../assets/images/userprofilecover.png')}
              alt="editprofile-bg"
              className="editprofile-bg-img"
            />
            <div className="editprofile-bg-mask" />
            <div className="editprofile-bg-stats"></div>
            <div className="editprofile-avatar-wrapper">
              <Avatar
                src={avatarPreview}
                size={160}
                className="editprofile-avatar"
                onError={handleAvatarError}
              />
              <span className="editprofile-avatar-camera" onClick={handleCameraClick}>
                <CameraOutlined style={{ fontSize: 24, color: '#888' }} />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </span>
            </div>
          </div>
          <div className="editprofile-content-section">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                username: user.username,
                email: user.email,
                gender: user.gender === 1 ? 'male' : user.gender === 2 ? 'female' : 'unknown',
                bio: user.profileDetail,
                otp: '',
              }}
              onFieldsChange={handleFormChange}
            >
              <Form.Item label="Username" name="username">
                <Input placeholder="Enter your username" />
              </Form.Item>
              <Form.Item
                label="Email Address (need OTP to verify)"
                name="email"
                validateStatus={emailError ? 'error' : ''}
                help={emailError}
                required={false}
              >
                <Input
                  className="editprofile-email-input"
                  placeholder="Enter your email"
                  autoComplete="email"
                  onBlur={handleEmailBlur}
                />
              </Form.Item>
              <Form.Item label="OTP" required={false}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Form.Item name="otp" noStyle>
                    <Input
                      placeholder="Enter OTP"
                      style={{ width: '60%' }}
                      onChange={handleOtpChange}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    style={{ marginLeft: 12 }}
                    disabled={countdown > 0}
                    onClick={handleSendOtp}
                  >
                    {countdown > 0
                      ? `Resend in ${Math.floor(countdown / 60)
                          .toString()
                          .padStart(2, '0')}:${(countdown % 60).toString().padStart(2, '0')}`
                      : 'Send verify email'}
                  </Button>
                </div>
                {otpError && (
                  <div style={{ color: '#ff4d4f', fontSize: 13, marginTop: 4 }}>{otpError}</div>
                )}
              </Form.Item>
              <Form.Item label="Gender" name="gender">
                <Select placeholder="Select gender" allowClear>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="unknown">Unknown</Option>
                </Select>
              </Form.Item>
              <Form.Item label="About" name="bio">
                <Input.TextArea rows={3} placeholder="Tell us about yourself" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  disabled={!isDirty || isSaving}
                  loading={isSaving}
                  onClick={handleSave}
                  style={{ marginRight: 16 }}
                >
                  SAVE CHANGES
                </Button>
                <Button onClick={handleCancel} disabled={isSaving}>
                  CANCEL
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Content>
      </Layout>
    </App>
  );
};

export default EditProfile;
