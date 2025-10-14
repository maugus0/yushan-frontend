import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Layout, Button, Avatar, Input, Form, Select, message, App, Modal, Slider } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/user';
import './editprofile.css';
import { useNavigate } from 'react-router-dom';
import userProfileService from '../../services/userProfile';
import { processUserAvatar, getGenderBasedAvatar } from '../../utils/imageUtils';
import authService from '../../services/auth';
import Cropper from 'react-easy-crop';

const { Content } = Layout;
const { Option } = Select;

const EditProfile = () => {
  const fileInputRef = useRef();
  const [form] = Form.useForm();
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [profileError, setProfileError] = useState(''); // General profile error
  const [countdown, setCountdown] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null); // base64 string
  const [avatarPreview, setAvatarPreview] = useState(''); // Preview of selected avatar
  const [isSaving, setIsSaving] = useState(false); // Loading state for save button

  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropImage, setCropImage] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Set initial avatar preview
  useEffect(() => {
    if (user && !avatarFile) {
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
      message.error(error, 3);
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
      message.success('Verification email sent! Please check your inbox.', 4);
    } catch (error) {
      console.error('Send OTP error:', error);

      // Display user-friendly error message
      const errorMessage =
        error.message || error.response?.data?.message || 'Failed to send verification email';
      message.error(errorMessage, 5);

      // Add visual feedback for email field
      const emailInput = document.querySelector('.editprofile-email-input');
      if (emailInput) {
        emailInput.classList.add('shake');
        setTimeout(() => emailInput.classList.remove('shake'), 500);
      }

      // Set email error if it's an email-specific issue
      if (error.message?.includes('Email already') || error.message?.includes('Invalid email')) {
        setEmailError(error.message);
      }
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
      setProfileError(''); // Clear previous errors
      const values = await form.validateFields();

      // test OTP
      const emailChanged = values.email !== user.email;
      const otpEmpty = !values.otp;
      if (emailChanged && otpEmpty) {
        setOtpError('Please enter the OTP sent to your email.');
        message.error('Please enter the OTP sent to your email.', 5);
        // error OTP
        const el = document.querySelector('input[placeholder="Enter OTP"]');
        if (el) {
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 500);
        }
        return;
      }

      // Convert gender to uppercase string format for BE API
      let genderValue = 'UNKNOWN';
      if (values.gender === 'male') genderValue = 'MALE';
      else if (values.gender === 'female') genderValue = 'FEMALE';
      else if (values.gender === 'unknown') genderValue = 'UNKNOWN';

      const profileData = {
        username: values.username,
        email: values.email,
        gender: genderValue,
        profileDetail: values.bio || '',
        avatarBase64: avatarFile,
        verificationCode: values.otp || undefined,
      };

      console.log('Profile data to submit:', profileData);

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
            'Profile updated successfully! Email changed and you have been re-authenticated.',
            5
          );
        } else {
          message.success('Profile updated successfully!', 3);
        }

        setIsDirty(false);
        navigate('/profile');
      } else {
        const errorMsg = response.message || 'Failed to update profile';
        message.error(errorMsg, 5);
      }
    } catch (error) {
      console.error('Save profile error:', error);

      // Display user-friendly error message
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        'Failed to update profile. Please try again';

      setProfileError(errorMessage); // Set error for display in form
      message.error(errorMessage, 5);

      // Handle specific error types with visual feedback
      if (error.message?.includes('verification code') || error.message?.includes('code expired')) {
        // Highlight OTP field
        const otpInput = document.querySelector('input[placeholder="Enter OTP"]');
        if (otpInput) {
          otpInput.focus();
          otpInput.classList.add('shake');
          setTimeout(() => otpInput.classList.remove('shake'), 500);
        }
        setOtpError('Invalid or expired verification code');
      } else if (error.message?.includes('Email already')) {
        // Highlight email field
        const emailInput = document.querySelector('.editprofile-email-input');
        if (emailInput) {
          emailInput.focus();
          emailInput.classList.add('shake');
          setTimeout(() => emailInput.classList.remove('shake'), 500);
        }
        setEmailError('Email already in use by another account');
      } else if (error.message?.includes('too large') || error.message?.includes('file')) {
        // Clear the avatar file if there's a file-related error
        setAvatarFile(null);
        if (user?.avatarUrl) {
          const processedAvatar = processUserAvatar(
            user.avatarUrl,
            user.gender,
            process.env.REACT_APP_API_URL?.replace('/api', '/images')
          );
          setAvatarPreview(processedAvatar);
        }
      } else if (
        error.message?.includes('Session expired') ||
        error.message?.includes('login again')
      ) {
        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login?expired=true');
        }, 2000);
      }
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
      fileInputRef.current.value = null;
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

      const reader = new FileReader();
      reader.onload = (ev) => {
        setCropImage(ev.target.result); // base64 url
        setCropModalVisible(true);
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropFinish = async () => {
    if (cropImage && croppedAreaPixels) {
      const image = new window.Image();
      image.src = cropImage;
      await new Promise((res) => (image.onload = res));
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        160,
        160
      );
      const base64url = canvas.toDataURL('image/jpeg');
      setAvatarPreview(base64url);
      setAvatarFile(base64url);
      setCropModalVisible(false);
      setCropImage('');
      setIsDirty(true);
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
                gender:
                  user.gender === 1 || user.gender === 'MALE'
                    ? 'male'
                    : user.gender === 2 || user.gender === 'FEMALE'
                      ? 'female'
                      : 'unknown',
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

              {/* Profile Error Display */}
              {profileError && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '12px 16px',
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '4px',
                    color: '#cf1322',
                  }}
                >
                  <strong>Error:</strong> {profileError}
                </div>
              )}

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
          <Modal
            open={cropModalVisible}
            title="Crop Avatar"
            onCancel={() => setCropModalVisible(false)}
            onOk={handleCropFinish}
            okText="Crop"
            cancelText="Cancel"
            width={400}
          >
            {cropImage && (
              <div style={{ position: 'relative', width: '100%', height: 320 }}>
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
                <div style={{ marginTop: 16 }}>
                  <span style={{ fontSize: 13, color: '#888' }}>
                    Adjust and crop to 160x160 avatar.
                  </span>
                  <Slider
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={setZoom}
                    style={{ marginTop: 8 }}
                  />
                </div>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </App>
  );
};

export default EditProfile;
