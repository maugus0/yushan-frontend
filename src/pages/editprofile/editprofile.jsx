import React, { useRef, useState } from 'react';
import { Layout, Button, Avatar, Input, Form, Select, message, App } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/user';
import './editprofile.css';
import { useNavigate } from 'react-router-dom';

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

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

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
  const handleSendOtp = () => {
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
    setCountdown(300);
    message.success('Verification email sent!');
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
  const handleSave = () => {
    form.validateFields().then((values) => {
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
      else genderValue = 0;

      // Prepare updated user data
      const updatedData = {
        username: values.username,
        email: values.email,
        gender: genderValue,
        profileDetail: values.bio,
      };

      if (avatarFile) {
        const reader = new FileReader();
        reader.onload = () => {
          updatedData.avatarUrl = reader.result;
          dispatch(updateUser(updatedData));
          message.success('Profile updated!');
          setIsDirty(false);
          navigate('/profile');
        };
        reader.readAsDataURL(avatarFile);
      } else {
        dispatch(updateUser(updatedData));
        message.success('Profile updated!');
        setIsDirty(false);
        navigate('/profile');
      }
    });
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
      setAvatarFile(file);
      setIsDirty(true);
    }
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
                src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatarUrl}
                size={160}
                className="editprofile-avatar"
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
                gender:
                  user.gender === 1 ? 'male' : user.gender === 2 ? 'female' : 'prefer_not_to_say', // Convert gender
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
                  <Option value="prefer_not_to_say">Prefer not to say</Option>
                </Select>
              </Form.Item>
              <Form.Item label="About" name="bio">
                <Input.TextArea rows={3} placeholder="Tell us about yourself" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  disabled={!isDirty}
                  onClick={handleSave}
                  style={{ marginRight: 16 }}
                >
                  SAVE CHANGES
                </Button>
                <Button onClick={handleCancel}>CANCEL</Button>
              </Form.Item>
            </Form>
          </div>
        </Content>
      </Layout>
    </App>
  );
};

export default EditProfile;
