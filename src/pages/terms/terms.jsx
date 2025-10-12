import React from 'react';
import { Typography, Card, Divider, Row, Col } from 'antd';
import './terms.css';

const { Title, Paragraph, Text } = Typography;

const TermsOfService = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={16} xl={14}>
            <Card className="terms-card">
              <div className="terms-header">
                <Title level={1} className="terms-title">
                  Terms of Service
                </Title>
                <Text className="terms-updated">Last updated: October 12, 2025</Text>
              </div>

              <Divider />

              <div className="terms-content">
                <Title level={2}>1. Acceptance of Terms</Title>
                <Paragraph>
                  By accessing and using Yushan, you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by the above, please do
                  not use this service.
                </Paragraph>

                <Title level={2}>2. Description of Service</Title>
                <Paragraph>
                  Yushan is a gamified platform for reading and writing web novels. We provide tools
                  for authors to publish their stories and for readers to discover and engage with
                  content. Our platform includes features such as user profiles, reading progress
                  tracking, author dashboards, and community interaction tools.
                </Paragraph>

                <Title level={2}>3. User Accounts</Title>
                <Paragraph>
                  To access certain features of our service, you may be required to create an
                  account. You are responsible for maintaining the confidentiality of your account
                  credentials and for all activities that occur under your account.
                </Paragraph>

                <Title level={2}>4. Content Guidelines</Title>
                <Paragraph>
                  Users are responsible for the content they post on Yushan. Content must not
                  violate any applicable laws or regulations. We reserve the right to remove content
                  that violates our community guidelines or these terms of service.
                </Paragraph>

                <Title level={2}>5. Intellectual Property</Title>
                <Paragraph>
                  Authors retain ownership of their original content posted on Yushan. However, by
                  posting content, you grant Yushan a non-exclusive license to display, distribute,
                  and promote your content on our platform.
                </Paragraph>

                <Title level={2}>6. Privacy Policy</Title>
                <Paragraph>
                  Your privacy is important to us. Please review our Privacy Policy, which also
                  governs your use of the service, to understand our practices.
                </Paragraph>

                <Title level={2}>7. Limitation of Liability</Title>
                <Paragraph>
                  Yushan shall not be liable for any indirect, incidental, special, consequential,
                  or punitive damages, or any loss of profits or revenues, whether incurred directly
                  or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </Paragraph>

                <Title level={2}>8. Modifications to Service</Title>
                <Paragraph>
                  We reserve the right to modify or discontinue, temporarily or permanently, the
                  service (or any part thereof) with or without notice at any time.
                </Paragraph>

                <Title level={2}>9. Governing Law</Title>
                <Paragraph>
                  These terms shall be interpreted and governed in accordance with the laws of
                  Singapore, without regard to its conflict of law provisions.
                </Paragraph>

                <Title level={2}>10. Contact Information</Title>
                <Paragraph>
                  If you have any questions about these Terms of Service, please contact us at:
                  <br />
                  <Text strong>Email:</Text> support@yushan.com
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

export default TermsOfService;
