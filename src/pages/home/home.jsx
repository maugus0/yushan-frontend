import { useState, useEffect } from 'react';
import { Typography, Button, Card, Space, Carousel, Row, Col } from 'antd';
import { BookOutlined, EditOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './home.css';
import HeroSection from '../../components/novel/herosection/herosection';
import FeatureNovels from '../../components/novel/featurenovels/featurenovels';
import {
  getWeeklyFeaturedNovels,
  getOngoingNovels,
  getCompletedNovels,
  getNewestNovels,
} from '../../services/api/novels';
import { GRADIENT_COLORS } from '../../services/api/novels';
import fallbackImage from '../../assets/images/novel_default.png';

const { Title, Paragraph } = Typography;

// hero section
const heroItems = [
  {
    title: 'Read Thousands of Novels',
    desc: 'Explore a vast library of web novels across all genres, updated daily.',
    img: require('../../assets/images/icon1.png'),
  },
  {
    title: 'Write and Share Stories',
    desc: 'Become an author and share your imagination with millions of readers.',
    img: require('../../assets/images/icon2.jpg'),
  },
  {
    title: 'Join the Community',
    desc: 'Connect, discuss, and grow with fellow readers and writers.',
    img: require('../../assets/images/icon3.jpg'),
  },
];

//3 box section
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

const Homepage = () => {
  const navigate = useNavigate();

  // State for different novel sections
  const [weeklyFeaturedNovels, setWeeklyFeaturedNovels] = useState([]);
  const [ongoingNovels, setOngoingNovels] = useState([]);
  const [completedNovels, setCompletedNovels] = useState([]);
  const [newestNovels, setNewestNovels] = useState([]);

  // Handle image error for hero carousel
  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  // Fetch data on component mount
  useEffect(() => {
    // Load each section independently for faster initial loading
    const loadNewestNovels = async () => {
      try {
        const response = await getNewestNovels();
        setNewestNovels(response.content || []);
      } catch (error) {
        console.error('Error fetching newest novels:', error);
        setNewestNovels([]);
      }
    };

    const loadWeeklyFeaturedNovels = async () => {
      try {
        const response = await getWeeklyFeaturedNovels();
        setWeeklyFeaturedNovels(response.content || []);
      } catch (error) {
        console.error('Error fetching weekly featured novels:', error);
        setWeeklyFeaturedNovels([]);
      }
    };

    const loadOngoingNovels = async () => {
      try {
        const response = await getOngoingNovels();
        setOngoingNovels(response.content || []);
      } catch (error) {
        console.error('Error fetching ongoing novels:', error);
        setOngoingNovels([]);
      }
    };

    const loadCompletedNovels = async () => {
      try {
        const response = await getCompletedNovels();
        setCompletedNovels(response.content || []);
      } catch (error) {
        console.error('Error fetching completed novels:', error);
        setCompletedNovels([]);
      }
    };

    // Load each section independently
    loadNewestNovels();
    loadWeeklyFeaturedNovels();
    loadOngoingNovels();
    loadCompletedNovels();
  }, []);

  // Handle hero section item clicks
  const handleHeroSectionClick = () => {
    navigate('/login');
  };

  // Handle novel clicks
  const handleNovelClick = (novel) => {
    navigate(`/novel/${novel.id}`);
  };

  return (
    <div className="home-bg">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="home-hero-flex">
          <div className="home-hero-flex-left">
            <div className="home-hero-carousel-wrapper">
              <div className="home-hero-carousel-title">
                <Typography.Title level={3} className="home-hero-carousel-title-text">
                  Newest Books
                </Typography.Title>
              </div>
              <Carousel autoplay dots={true} className="home-hero-carousel">
                {newestNovels.map((novel, idx) => (
                  <div key={novel.id || idx}>
                    <div
                      className="home-hero-slide"
                      style={{
                        position: 'relative',
                        justifyContent: 'flex-start',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleNovelClick(novel)}
                    >
                      <div
                        className="home-hero-blur-bg"
                        style={{
                          background: GRADIENT_COLORS,
                          opacity: 0.9,
                        }}
                      />
                      <div className="home-hero-slide-content home-hero-slide-content-left">
                        <div className="home-hero-img">
                          <img
                            src={novel.cover}
                            alt={novel.title}
                            className="home-hero-img-el"
                            onError={handleImageError}
                          />
                        </div>
                        <div className="home-hero-content">
                          <Title level={2} className="home-hero-title home-hero-title-white">
                            {novel.title}
                          </Title>
                          <Paragraph className="home-hero-desc home-hero-desc-white">
                            {novel.description || novel.synopsis || 'A captivating story awaits...'}
                          </Paragraph>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
          <div className="home-hero-flex-right">
            <HeroSection
              data={heroItems}
              title="About Yushan"
              onItemClick={handleHeroSectionClick}
            />
          </div>
        </div>
      </section>

      {/* 3 boxes Section */}
      <section className="home-features-section">
        <div className="home-features-flex">
          {features.map((feature, index) => (
            <div className="home-feature-card-wrapper" key={index}>
              <Card
                hoverable
                className="home-feature-card"
                style={{
                  padding: '32px 24px',
                  backgroundColor: feature.bgColor,
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>{feature.icon}</div>
                  <Title level={3} className="home-feature-title">
                    {feature.title}
                  </Title>
                  <Paragraph className="home-feature-desc">{feature.description}</Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    className="home-feature-btn"
                    onClick={() => {
                      console.log('Button clicked, index:', index);
                      if (index === 0) {
                        navigate('/browse');
                      } else if (index === 1) {
                        navigate('/writerdashboard');
                      } else {
                        navigate('/register', { replace: false });
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </Space>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Features Section */}
      <FeatureNovels
        title="Weekly Featured"
        novels={weeklyFeaturedNovels}
        onNovelClick={handleNovelClick}
      />

      {/* Ongoing Novels Section */}
      <FeatureNovels
        title="Ongoing Novels"
        novels={ongoingNovels}
        onNovelClick={handleNovelClick}
      />

      {/* Completed Novels Section */}
      <FeatureNovels
        title="Completed Novels"
        novels={completedNovels}
        onNovelClick={handleNovelClick}
      />

      {/* CTA Section */}
      <section
        className="home-cta-section"
        style={{
          background: GRADIENT_COLORS,
          padding: '80px 0',
        }}
      >
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12} style={{ textAlign: 'center' }}>
            <Card
              className="home-cta-card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Title level={2} className="home-cta-title" style={{ color: 'white' }}>
                Ready to Begin Your Journey?
              </Title>
              <Paragraph className="home-cta-desc" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Join thousands of readers and writers in the Yushan community. Your next favorite
                story is just a click away.
              </Paragraph>
              <Space size="middle" wrap>
                <Button
                  type="primary"
                  size="large"
                  className="home-cta-btn"
                  onClick={() => navigate('/browse')}
                  style={{
                    backgroundColor: 'white',
                    borderColor: 'white',
                    color: '#6B46C1',
                  }}
                >
                  Start Reading Now
                </Button>
                <Button
                  type="default"
                  size="large"
                  className="home-cta-link"
                  onClick={() => navigate('/writerdashboard')}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'white',
                    color: 'white',
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
