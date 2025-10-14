import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  FacebookOutlined,
} from '@ant-design/icons';
import './footer.css';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const socialLinks = [
    {
      icon: <GithubOutlined />,
      href: 'https://github.com/maugus0/yushan-frontend/',
      label: 'GitHub',
    },
    {
      icon: <TwitterOutlined />,
      href: 'https://github.com/maugus0/yushan-backend/',
      label: 'Twitter',
    },
    { icon: <LinkedinOutlined />, href: 'https://www.linkedin.com/in/maugus0/', label: 'LinkedIn' },
    {
      icon: <FacebookOutlined />,
      href: 'https://github.com/maugus0/yushan-admin/',
      label: 'Facebook',
    },
  ];

  const quickLinks = [
    { title: 'Home', href: '/', isInternal: true },
    { title: 'Browse Novels', href: '/browse', isInternal: true },
    { title: 'Rankings & Leaderboards', href: '/rankings', isInternal: true },
    { title: 'New Releases', href: '/browse', isInternal: true },
  ];

  const legalLinks = [
    { title: 'Join as Author', href: '/writerdashboard', isInternal: true },
    { title: 'Terms of Service', href: '/terms', isInternal: true },
    { title: 'Cookie Policy', href: '/cookies', isInternal: true },
    { title: 'Affiliate Programme', href: '/affliate-programme', isInternal: true },
  ];

  return (
    <AntFooter className="footer">
      <div className="footer-container">
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={4} className="footer-title">
                Yushan
              </Title>
              <Text className="footer-description">
                A gamified platform where stories come alive. Read, write, and play your way through
                endless adventures.
              </Text>
              <div className="social-links">
                <Space size="middle">
                  {socialLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="social-link"
                      aria-label={link.label}
                    >
                      {link.icon}
                    </Link>
                  ))}
                </Space>
              </div>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-section-title">
                Discover
              </Title>
              <ul className="footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    {link.isInternal ? (
                      <span
                        className="footer-link"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(link.href)}
                      >
                        {link.title}
                      </span>
                    ) : (
                      <Link href={link.href} className="footer-link">
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          {/* Legal */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-section-title">
                Resources
              </Title>
              <ul className="footer-links">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    {link.isInternal ? (
                      <span
                        className="footer-link"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(link.href)}
                      >
                        {link.title}
                      </span>
                    ) : (
                      <Link href={link.href} className="footer-link">
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-section-title">
                Contact Us
              </Title>
              <Space direction="vertical" className="contact-info">
                <div className="contact-item">
                  <EnvironmentOutlined className="contact-icon" />
                  <Text className="contact-text">Yushan Interactive Pte. Ltd. Singapore</Text>
                </div>
                <div className="contact-item">
                  <PhoneOutlined className="contact-icon" />
                  <Link href="tel:+1234567890" className="contact-text">
                    +65 8063-6867
                  </Link>
                </div>
                <div className="contact-item">
                  <MailOutlined className="contact-icon" />
                  <Link href="mailto:support@yushan.com" className="contact-text">
                    support@yushan.com
                  </Link>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        <Divider className="footer-divider" />

        {/* Copyright */}
        <div className="footer-bottom">
          <Row justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <Text className="copyright">© {currentYear} Yushan. All rights reserved.</Text>
            </Col>
            <Col xs={24} md={12} className="footer-bottom-right">
              <Text className="footer-credit">Made with ❤️ for readers & writers everywhere.</Text>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
