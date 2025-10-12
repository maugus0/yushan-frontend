import React from 'react';
import { Typography, Card, Divider, Row, Col, Button, Space, List } from 'antd';
import { DollarOutlined, TeamOutlined, TrophyOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './affliate-programme.css';

const { Title, Paragraph, Text } = Typography;

const AffiliateProgram = () => {
  const navigate = useNavigate();

  const handleApplyNow = () => {
    const subject = 'Affiliate Programme Application - Yushan';
    const body = `Hello Yushan Affiliate Team,

I am interested in joining the Yushan Affiliate Programme. Please provide me with more information about the application process and requirements.

Best regards,
[Your Name]
[Your Platform/Website]
[Your Contact Information]`;

    const mailtoLink = `mailto:affiliates@yushan.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleLearnMore = () => {
    navigate('/');
  };

  const benefits = [
    {
      icon: <DollarOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: 'Competitive Commissions',
      description:
        'Earn up to 30% commission on all successful referrals and premium subscriptions.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: 'Growing Community',
      description:
        'Join a thriving community of content creators and earn from our expanding user base.',
    },
    {
      icon: <TrophyOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
      title: 'Performance Bonuses',
      description: 'Get additional bonuses for reaching monthly and yearly performance milestones.',
    },
  ];

  const requirements = [
    'Active social media presence or content platform',
    "Alignment with Yushan's values and community guidelines",
    'Commitment to promoting quality content',
    'Minimum age of 18 years',
    'Valid bank account for commission payments',
  ];

  const steps = [
    {
      title: 'Apply to Join',
      description:
        'Fill out our affiliate application form with your details and platform information.',
    },
    {
      title: 'Get Approved',
      description: 'Our team will review your application within 3-5 business days.',
    },
    {
      title: 'Receive Your Links',
      description: 'Get your unique affiliate links and promotional materials.',
    },
    {
      title: 'Start Promoting',
      description: 'Share Yushan with your audience using your affiliate links.',
    },
    {
      title: 'Earn Commissions',
      description: 'Get paid monthly for all successful referrals and conversions.',
    },
  ];

  return (
    <div className="affiliate-page">
      <div className="affiliate-container">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Card className="affiliate-card">
              <div className="affiliate-header">
                <Title level={1} className="affiliate-title">
                  Affiliate Programme
                </Title>
                <Paragraph className="affiliate-subtitle">
                  Partner with Yushan and earn while helping readers discover amazing stories
                </Paragraph>
              </div>

              <Divider />

              <div className="affiliate-content">
                <Title level={2}>Why Join Our Affiliate Programme?</Title>
                <Paragraph>
                  Yushan's Affiliate Programme offers content creators, bloggers, and social media
                  influencers the opportunity to earn competitive commissions by promoting our
                  platform to their audience. Help readers discover their next favorite story while
                  building a sustainable income stream.
                </Paragraph>

                <div className="benefits-section">
                  <Row gutter={[24, 24]}>
                    {benefits.map((benefit, index) => (
                      <Col xs={24} md={8} key={index}>
                        <Card className="benefit-card" hoverable>
                          <div className="benefit-icon">{benefit.icon}</div>
                          <Title level={4} className="benefit-title">
                            {benefit.title}
                          </Title>
                          <Paragraph className="benefit-description">
                            {benefit.description}
                          </Paragraph>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>

                <Title level={2}>Commission Structure</Title>
                <div className="commission-info">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <Card className="commission-card">
                        <Title level={4}>Standard Referrals</Title>
                        <div className="commission-rate">15%</div>
                        <Paragraph>
                          Earn 15% commission on all premium subscriptions from your referrals
                        </Paragraph>
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card className="commission-card">
                        <Title level={4}>Author Referrals</Title>
                        <div className="commission-rate">30%</div>
                        <Paragraph>
                          Earn 30% commission when you refer successful authors to our platform
                        </Paragraph>
                      </Card>
                    </Col>
                  </Row>
                </div>

                <Title level={2}>How It Works</Title>
                <List
                  className="steps-list"
                  itemLayout="horizontal"
                  dataSource={steps}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<div className="step-number">{index + 1}</div>}
                        title={<Text strong>{item.title}</Text>}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />

                <Title level={2}>Requirements</Title>
                <List
                  className="requirements-list"
                  dataSource={requirements}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />

                <Title level={2}>Payment Information</Title>
                <Paragraph>
                  <Text strong>Payment Schedule:</Text> Monthly payments on the 15th of each month
                  <br />
                  <Text strong>Minimum Payout:</Text> $50 USD
                  <br />
                  <Text strong>Payment Methods:</Text> Bank transfer, PayPal, or digital wallets
                  <br />
                  <Text strong>Cookie Duration:</Text> 30 days attribution window
                </Paragraph>

                <Title level={2}>Marketing Materials</Title>
                <Paragraph>Once approved, you'll get access to:</Paragraph>
                <ul className="materials-list">
                  <li>Branded banners and graphics in various sizes</li>
                  <li>Product screenshots and promotional images</li>
                  <li>Email templates and social media content</li>
                  <li>Video promotional materials</li>
                  <li>Real-time tracking dashboard</li>
                </ul>

                <div className="cta-section">
                  <Card className="cta-card">
                    <Title level={3}>Ready to Get Started?</Title>
                    <Paragraph>
                      Join thousands of affiliates already earning with Yushan. Apply today and
                      start monetizing your audience while promoting quality content.
                    </Paragraph>
                    <Space size="middle">
                      <Button
                        type="primary"
                        size="large"
                        icon={<MailOutlined />}
                        onClick={handleApplyNow}
                      >
                        Apply Now
                      </Button>
                      <Button size="large" onClick={handleLearnMore}>
                        Learn More
                      </Button>
                    </Space>
                  </Card>
                </div>

                <Title level={2}>Contact Our Affiliate Team</Title>
                <Paragraph>
                  Have questions about our affiliate programme? Our dedicated affiliate team is here
                  to help:
                  <br />
                  <Text strong>Email:</Text> affiliates@yushan.com
                  <br />
                  <Text strong>Response Time:</Text> Within 24 hours
                  <br />
                  <Text strong>Support Hours:</Text> Monday - Friday, 9 AM - 6 PM SGT
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AffiliateProgram;
