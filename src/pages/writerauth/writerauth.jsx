import { useState, useRef, useEffect } from 'react';
import { Button, Input, Modal, message } from 'antd';
import './writerauth.css';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/user';

const COUNTDOWN_SECONDS = 300;

const WriterAuth = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorModal, setErrorModal] = useState(false);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing timers when the component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const res = await userService.getMe();
        if (res.email) {
          setEmail(res.email);
        }
      } catch (error) {
        // Handle error silently or show a message
        console.error('Failed to fetch user email:', error);
      }
    };
    getUserEmail();
  }, []);

  const handleSendOtp = async () => {
    setSending(true);
    try {
      await userService.upgradeToAuthorEmail(email);
      setErrorMsg('');
      setErrorModal(false);
      message.success('OTP sent to your email.');
      setCountdown(COUNTDOWN_SECONDS);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to send OTP.');
      setErrorModal(true);
    }
    setSending(false);
  };

  const handleRegister = async () => {
    if (!otp) {
      setErrorMsg('Please enter OTP code.');
      setErrorModal(true);
      return;
    }
    try {
      await userService.upgradeToAuthor(otp);
      setErrorMsg('');
      setErrorModal(false);
      navigate('/writerdashboard');
    } catch (error) {
      setErrorMsg(error.message || 'Failed to register as author.');
      setErrorModal(true);
    }
  };

  const formatCountdown = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="writerauth-page">
      <div className="writerauth-box">
        <h2 className="writerauth-title">Register as Yushan Author</h2>
        <div className="writerauth-form">
          <label className="writerauth-label">Email</label>
          <Input
            className="writerauth-input"
            placeholder="Enter your email"
            value={email}
            readOnly
            disabled
            autoComplete="email"
          />
          <Button
            className="writerauth-send-btn"
            type="primary"
            onClick={handleSendOtp}
            disabled={countdown > 0 || !email || sending}
            block
          >
            {sending
              ? 'Sending...'
              : countdown > 0
                ? `Resend OTP (${formatCountdown(countdown)})`
                : 'Send OTP'}
          </Button>
          <label className="writerauth-label" style={{ marginTop: 24 }}>
            OTP Code
          </label>
          <Input
            className="writerauth-input"
            placeholder="Enter OTP code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={8}
            autoComplete="one-time-code"
          />
          <Button
            className="writerauth-register-btn"
            type="primary"
            onClick={handleRegister}
            disabled={!email || !otp}
            block
          >
            Register to be a Yushan author
          </Button>
        </div>
        <Modal
          open={errorModal}
          onCancel={() => setErrorModal(false)}
          footer={[
            <Button key="confirm" type="primary" onClick={() => setErrorModal(false)}>
              Confirm
            </Button>,
          ]}
          centered
          maskClosable={false}
          closable={false}
          style={{ textAlign: 'center', borderRadius: 12, background: '#fff' }}
        >
          <div
            style={{
              color: '#cf1322',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 8,
              padding: '18px 16px',
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 12,
              boxShadow: '0 2px 12px rgba(255,77,79,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#ff4d4f" />
              <path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1.2" fill="#fff" />
            </svg>
            {errorMsg}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WriterAuth;
