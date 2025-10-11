import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, message } from 'antd';
import './writerauth.css';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/user';

const COUNTDOWN_SECONDS = 300;

const WriterAuth = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getUserEmail = async () => {
      const res = await userService.getMe();
      console.log(res.email);
      setEmail(res.email);
    };
    getUserEmail();
  }, []);

  const handleSendOtp = async () => {
    setSending(true);
    await userService.upgradeToAuthorEmail(email);
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
    setSending(false);
  };

  const handleRegister = async () => {
    if (!otp) {
      return;
    }
    await userService.upgradeToAuthor(otp);
    navigate('/writerdashboard');
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
            style={{ marginTop: 12 }}
            onClick={handleSendOtp}
            disabled={countdown > 0 || !email || sending}
            block
          >
            {countdown > 0 ? `Resend OTP (${formatCountdown(countdown)})` : 'Send OTP'}
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
            style={{ marginTop: 32 }}
            onClick={handleRegister}
            disabled={!email || !otp}
            block
          >
            Register to be a Yushan author
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WriterAuth;
