import { Typography, Card, Divider, Row, Col, Table } from 'antd';
import './cookies.css';

const { Title, Paragraph, Text } = Typography;

const CookiePolicy = () => {
  const cookieTableData = [
    {
      key: '1',
      name: 'Essential Cookies',
      purpose: 'Authentication, security, and basic site functionality',
      duration: 'Session/30 days',
      example: 'auth_token, session_id',
    },
    {
      key: '2',
      name: 'Analytics Cookies',
      purpose: 'Understanding how users interact with our platform',
      duration: '2 years',
      example: 'Google Analytics cookies',
    },
    {
      key: '3',
      name: 'Preference Cookies',
      purpose: 'Remembering user settings and preferences',
      duration: '1 year',
      example: 'theme_preference, language_setting',
    },
    {
      key: '4',
      name: 'Marketing Cookies',
      purpose: 'Delivering relevant advertisements and tracking campaigns',
      duration: '90 days',
      example: 'ad_tracking, campaign_source',
    },
  ];

  const cookieTableColumns = [
    {
      title: 'Cookie Type',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
      width: '35%',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: '20%',
    },
    {
      title: 'Examples',
      dataIndex: 'example',
      key: 'example',
      width: '25%',
    },
  ];

  return (
    <div className="cookies-page">
      <div className="cookies-container">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={16} xl={14}>
            <Card className="cookies-card">
              <div className="cookies-header">
                <Title level={1} className="cookies-title">
                  Cookie Policy
                </Title>
                <Text className="cookies-updated">Last updated: October 12, 2025</Text>
              </div>

              <Divider />

              <div className="cookies-content">
                <Title level={2}>What Are Cookies?</Title>
                <Paragraph>
                  Cookies are small text files that are stored on your device when you visit our
                  website. They help us provide you with a better experience by remembering your
                  preferences and understanding how you use our platform.
                </Paragraph>

                <Title level={2}>How We Use Cookies</Title>
                <Paragraph>Yushan uses cookies for various purposes, including:</Paragraph>
                <ul className="cookies-list">
                  <li>Keeping you logged in to your account</li>
                  <li>Remembering your reading preferences and settings</li>
                  <li>Analyzing site traffic and user behavior</li>
                  <li>Personalizing content and recommendations</li>
                  <li>Improving our services and user experience</li>
                </ul>

                <Title level={2}>Types of Cookies We Use</Title>
                <div className="cookies-table-wrapper">
                  <Table
                    dataSource={cookieTableData}
                    columns={cookieTableColumns}
                    pagination={false}
                    bordered
                    size="middle"
                  />
                </div>

                <Title level={2}>Managing Your Cookie Preferences</Title>
                <Paragraph>You can control and manage cookies in several ways:</Paragraph>
                <ul className="cookies-list">
                  <li>
                    <Text strong>Browser Settings:</Text> Most browsers allow you to view, manage,
                    and delete cookies through their settings.
                  </li>
                  <li>
                    <Text strong>Opt-out Tools:</Text> You can opt out of analytics cookies through
                    Google Analytics' opt-out browser add-on.
                  </li>
                  <li>
                    <Text strong>Do Not Track:</Text> We respect Do Not Track signals where
                    technically feasible.
                  </li>
                </ul>

                <Title level={2}>Essential Cookies</Title>
                <Paragraph>
                  Some cookies are essential for our website to function properly. These cannot be
                  disabled without affecting the basic functionality of our platform, such as user
                  authentication and security features.
                </Paragraph>

                <Title level={2}>Third-Party Cookies</Title>
                <Paragraph>
                  We may use third-party services that set cookies on your device. These include:
                </Paragraph>
                <ul className="cookies-list">
                  <li>
                    <Text strong>Google Analytics:</Text> For website analytics and performance
                    monitoring
                  </li>
                  <li>
                    <Text strong>Social Media:</Text> For social sharing functionality
                  </li>
                  <li>
                    <Text strong>Content Delivery Networks:</Text> For faster content delivery
                  </li>
                </ul>

                <Title level={2}>Updates to This Policy</Title>
                <Paragraph>
                  We may update this Cookie Policy from time to time to reflect changes in our
                  practices or for other operational, legal, or regulatory reasons. We will notify
                  you of any material changes by posting the updated policy on our website.
                </Paragraph>

                <Title level={2}>Contact Us</Title>
                <Paragraph>
                  If you have any questions about our use of cookies, please contact us at:
                  <br />
                  <Text strong>Email:</Text> privacy@yushan.com
                  <br />
                  <Text strong>Address:</Text> Yushan Interactive Pte. Ltd., Singapore
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CookiePolicy;
