import React from 'react';
import { Row, Col, Typography, Button, Card, Space, Carousel, Tag } from 'antd';
import {
  BookOutlined,
  EditOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  StarFilled,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Homepage = () => {
  const featuredBooks = [
    {
      id: 1,
      title: 'First Legendary Dragon: Starting...',
      author: 'Master Chen',
      cover: '/api/placeholder/200/300',
      description:
        'He died. Not by fate, not by accident, but as collateral in a hunt between beings beyond mortal comprehension. And yet... death was only the beginning. Chosen by a mysterious entity known only as Echo, a sarcastic soul from Earth...',
      rating: 4.8,
      chapters: 156,
      genre: 'Fantasy',
    },
    {
      id: 2,
      title: 'Cultivation Chronicles: The Rise',
      author: 'Jade Phoenix',
      cover: '/api/placeholder/200/300',
      description:
        'In a world where power determines everything, Lin Wei discovers an ancient cultivation technique that could change his destiny forever. But with great power comes great danger...',
      rating: 4.6,
      chapters: 203,
      genre: 'Cultivation',
    },
    {
      id: 3,
      title: 'System Overlord',
      author: 'Digital Sage',
      cover: '/api/placeholder/200/300',
      description:
        'When reality becomes a game and the game becomes reality, Alex must navigate through levels, quests, and boss battles to survive in this new world order...',
      rating: 4.9,
      chapters: 89,
      genre: 'System',
    },
  ];

  const features = [
    {
      icon: <BookOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: 'Read Novels',
      description:
        'Discover thousands of captivating web novels across all genres. From cultivation to romance, fantasy to sci-fi.',
      bgColor: '#f0f8ff',
    },
    {
      icon: <EditOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: 'Write Novels',
      description:
        'Share your stories with the world. Our platform provides all the tools you need to publish and promote your work.',
      bgColor: '#f6ffed',
    },
    {
      icon: <TrophyOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
      title: 'Earn Yuan/XP and Level Up',
      description:
        'Earn rewards for reading, writing, and engaging with the community. Level up your profile and unlock exclusive features.',
      bgColor: '#fffbe6',
    },
  ];

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ padding: '60px 24px' }}>
        <Row gutter={[48, 48]} align="middle" justify="center">
          {/* Featured Books Carousel */}
          <Col xs={24} lg={12}>
            <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
              Featured Books
            </Title>
            <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Carousel autoplay dots={{ position: 'bottom' }}>
                {featuredBooks.map((book) => (
                  <div key={book.id}>
                    <Row gutter={16} align="middle">
                      <Col span={8}>
                        <div
                          style={{
                            width: '100%',
                            height: '200px',
                            background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 'bold',
                          }}
                        >
                          {book.title.split(':')[0]}
                        </div>
                      </Col>
                      <Col span={16}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            {book.title}
                          </Title>
                          <Text type="secondary">
                            <UserOutlined /> {book.author}
                          </Text>
                          <Space>
                            <Tag color="blue">{book.genre}</Tag>
                            <Text>
                              <StarFilled style={{ color: '#faad14' }} /> {book.rating}
                            </Text>
                            <Text type="secondary">{book.chapters} chapters</Text>
                          </Space>
                          <Paragraph
                            ellipsis={{ rows: 3 }}
                            style={{ margin: '8px 0', fontSize: '14px' }}
                          >
                            {book.description}
                          </Paragraph>
                          <Button type="primary" size="small" icon={<PlayCircleOutlined />}>
                            Start Reading
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Carousel>
            </Card>
          </Col>

          {/* About Yushan */}
          <Col xs={24} lg={12}>
            <Title level={2} style={{ marginBottom: '24px', color: '#722ed1' }}>
              About Yushan
            </Title>

            <Card style={{ borderRadius: '12px' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={3} style={{ color: '#1890ff' }}>
                    Yushan Author Benefits
                  </Title>
                  <Paragraph>
                    Why should you start your writing journey here at Yushan? Enjoy exclusive
                    benefits, monetization options, and a supportive community.
                  </Paragraph>
                  <Button type="primary" ghost>
                    Learn More
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 24px', backgroundColor: 'white' }}>
        <Row justify="center" style={{ marginBottom: '48px' }}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Title level={2}>Discover Your Next Adventure</Title>
            <Paragraph style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              Join millions of readers and writers in the ultimate web novel community
            </Paragraph>
          </Col>
        </Row>

        <Row gutter={[32, 32]} justify="center">
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                style={{
                  textAlign: 'center',
                  height: '100%',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
                bodyStyle={{
                  padding: '32px 24px',
                  backgroundColor: feature.bgColor,
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>{feature.icon}</div>
                  <Title level={3} style={{ margin: 0 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ margin: 0, fontSize: '15px' }}>
                    {feature.description}
                  </Paragraph>
                  <Button type="primary" size="large" style={{ marginTop: '16px' }}>
                    Get Started
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 24px', backgroundColor: '#f0f2f5' }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12} style={{ textAlign: 'center' }}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
              }}
            >
              <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>
                Ready to Begin Your Journey?
              </Title>
              <Paragraph
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '16px',
                  marginBottom: '32px',
                }}
              >
                Join thousands of readers and writers in the Yushan community. Your next favorite
                story is just a click away.
              </Paragraph>
              <Space size="middle" wrap>
                <Button
                  type="default"
                  size="large"
                  style={{
                    background: 'white',
                    borderColor: 'white',
                    color: '#667eea',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                  }}
                >
                  Start Reading Now
                </Button>
                <Button
                  type="link"
                  size="large"
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                  }}
                >
                  Become an Author
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
};

export default Homepage;
