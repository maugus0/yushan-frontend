import React from 'react';
import { Typography, Button, Card, Space, Carousel, Row, Col } from 'antd';
import { BookOutlined, EditOutlined, TrophyOutlined } from '@ant-design/icons';
import './home.css';
import HeroSection from '../../components/novel/herosection/herosection';
import FeatureNovels from '../../components/novel/featurenovels/featurenovels';
import Leaderboard from '../../components/novel/leaderboard/leaderboard';
import Categories from '../../components/novel/categories/categories';

const { Title, Paragraph } = Typography;

//mock data for hero carousel
const heroSlides = [
  {
    img: require('../../assets/images/testimg.png'),
    title: 'Legendary Dragon Awakens',
    desc: 'A new era begins as the dragon rises from the ashes. Witness the legend unfold.',
  },
  {
    img: require('../../assets/images/testimg2.png'),
    title: 'Cultivation Journey',
    desc: 'Embark on a journey of power, wisdom, and destiny in the world of cultivation.',
  },
  {
    img: require('../../assets/images/testimg3.png'),
    title: 'System Overlord',
    desc: 'Reality and game merge. Can you survive the ultimate challenge?',
  },
];

//mock data for hero section
const heroItems = [
  {
    title: 'Read Thousands of Novels',
    desc: 'Explore a vast library of web novels across all genres, updated daily.',
    img: require('../../assets/images/testimg.png'),
  },
  {
    title: 'Write and Share Stories',
    desc: 'Become an author and share your imagination with millions of readers.',
    img: require('../../assets/images/testimg2.png'),
  },
  {
    title: 'Join the Community',
    desc: 'Connect, discuss, and grow with fellow readers and writers.',
    img: require('../../assets/images/testimg3.png'),
  },
];

// mock data for featured novels
const featureNovelsData = [
  {
    id: 1,
    title: 'Legendary Dragon Awakensssssssssss',
    author: 'Master Chensssssss',
    cover: require('../../assets/images/testimg.png'),
    category: 'Fantasyssssssssssssssssssssssssssss',
    status: 'Ongoing',
    description: 'A new era begins as the dragon rises from the ashes. Witness the legend unfold.',
    rating: 4.8,
    chapters: 156,
    tags: ['Dragon', 'Adventure', 'Magic'],
  },
  {
    id: 2,
    title: 'Cultivation Journey',
    author: 'Jade Phoenix',
    cover: require('../../assets/images/testimg2.png'),
    category: 'Cultivation',
    status: 'Ongoing',
    description: 'Embark on a journey of power, wisdom, and destiny in the world of cultivation.',
    rating: 4.6,
    chapters: 203,
    tags: ['Cultivation', 'Growth', 'Eastern'],
  },
  {
    id: 3,
    title: 'System Overlord',
    author: 'Digital Sage',
    cover: require('../../assets/images/testimg3.png'),
    category: 'System',
    status: 'Completed',
    description: 'Reality and game merge. Can you survive the ultimate challenge?',
    rating: 4.9,
    chapters: 89,
    tags: ['System', 'Game', 'Survival'],
  },
  {
    id: 4,
    title: 'Romance in the City',
    author: 'Lily Heart',
    cover: require('../../assets/images/testimg2.png'),
    category: 'Romance',
    status: 'Ongoing',
    description: 'A heartwarming story of love and life in the bustling city.',
    rating: 4.5,
    chapters: 120,
    tags: ['Romance', 'Urban', 'Slice of Life'],
  },
  {
    id: 5,
    title: 'Martial Arts Legend',
    author: 'Iron Fist',
    cover: require('../../assets/images/testimg4.png'),
    category: 'Martial Arts',
    status: 'Completed',
    description: 'From humble beginnings to martial arts legend, this is his story.',
    rating: 4.7,
    chapters: 200,
    tags: ['Martial Arts', 'Action', 'Legend'],
  },
  {
    id: 6,
    title: 'School Life Diaries',
    author: 'Sunny Day',
    cover: require('../../assets/images/testimg3.png'),
    category: 'School Life',
    status: 'Ongoing',
    description: 'Follow the ups and downs of students in a modern school.',
    rating: 4.3,
    chapters: 75,
    tags: ['School', 'Youth', 'Comedy'],
  },
  {
    id: 7,
    title: 'Urban Fantasy',
    author: 'Night Owl',
    cover: require('../../assets/images/testimg2.png'),
    category: 'Fantasy',
    status: 'Ongoing',
    description: 'Magic and mystery blend in the heart of the city.',
    rating: 4.4,
    chapters: 134,
    tags: ['Urban', 'Fantasy', 'Magic'],
  },
  {
    id: 8,
    title: 'Comedy King',
    author: 'Laugh Master',
    cover: require('../../assets/images/testimg4.png'),
    category: 'Comedy',
    status: 'Completed',
    description: 'A hilarious journey through the world of stand-up comedy.',
    rating: 4.2,
    chapters: 60,
    tags: ['Comedy', 'Entertainment', 'Slice of Life'],
  },
];

// Mock data for leaderboard
const books = Array.from({ length: 15 }).map((_, idx) => ({
  id: idx + 1,
  cover: require('../../assets/images/testimg4.png'),
  title: `Novel Title ${idx + 1}`,
  category: 'Fantasy',
  rating: (Math.random() * 2 + 3).toFixed(1),
}));

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

// mock data for categories
const browseMenuData = [
  {
    key: 'novels',
    label: 'Novels',
    right: [
      {
        title: 'MALELEAD',
        types: ['Action', 'Adventure', 'Martial Arts', 'Fantasy', 'Sci-Fi', 'Urban'],
      },
      {
        title: 'FEMALELEAD',
        types: ['Romance', 'Drama', 'Slice of Life', 'School Life', 'Comedy'],
      },
    ],
  },
  {
    key: 'comics',
    label: 'Comics',
    right: [
      { title: '', types: ['Manga', 'Manhua', 'Webtoon', 'Superhero', 'Fantasy', 'Romance'] },
    ],
  },
  {
    key: 'fanfics',
    label: 'Fan-fics',
    right: [{ title: '', types: ['Anime', 'Game', 'Movie', 'TV', 'Book', 'Original'] }],
  },
];

const Homepage = () => {
  return (
    <div className="home-bg">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="home-hero-flex">
          <div className="home-hero-flex-left">
            <div className="home-hero-carousel-wrapper">
              <div className="home-hero-carousel-title">
                <Typography.Title level={3} className="home-hero-carousel-title-text">
                  Weekly Book
                </Typography.Title>
              </div>
              <Carousel autoplay dots={true} className="home-hero-carousel">
                {heroSlides.map((slide, idx) => (
                  <div key={idx}>
                    <div
                      className="home-hero-slide"
                      style={{ position: 'relative', justifyContent: 'flex-start' }}
                    >
                      <div
                        className="home-hero-blur-bg"
                        style={{
                          backgroundImage: `url(${slide.img})`,
                        }}
                      />
                      <div className="home-hero-slide-content home-hero-slide-content-left">
                        <div className="home-hero-img">
                          <img src={slide.img} alt={slide.title} className="home-hero-img-el" />
                        </div>
                        <div className="home-hero-content">
                          <Title level={2} className="home-hero-title home-hero-title-white">
                            {slide.title}
                          </Title>
                          <Paragraph className="home-hero-desc home-hero-desc-white">
                            {slide.desc}
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
            <HeroSection data={heroItems} title="Meet Yushan" />
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
                  <Button type="primary" size="large" className="home-feature-btn">
                    Get Started
                  </Button>
                </Space>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Menu Section */}
      <Categories data={browseMenuData} />

      {/* Weekly Features Section */}
      <FeatureNovels title="Weekly Featured" novels={featureNovelsData} />

      {/* Top Books Section */}
      <Leaderboard data={books} />

      {/* Browse Menu Section */}
      <Categories data={browseMenuData} />

      {/* Ongoing Novels Section */}
      <FeatureNovels title="Ongoing Novels" novels={featureNovelsData} />

     {/* CTA Section */}
      <section className="home-cta-section">
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12} style={{ textAlign: 'center' }}>
            <Card className="home-cta-card">
              <Title level={2} className="home-cta-title">
                Ready to Begin Your Journey?
              </Title>
              <Paragraph className="home-cta-desc">
                Join thousands of readers and writers in the Yushan community. Your next favorite
                story is just a click away.
              </Paragraph>
              <Space size="middle" wrap>
                <Button type="default" size="large" className="home-cta-btn">
                  Start Reading Now
                </Button>
                <Button type="link" size="large" className="home-cta-link">
                  Become an Author
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </section>


      {/* Completed Novels Section */}
      <FeatureNovels title="Completed Novels" novels={featureNovelsData} />
    </div>
  );
};

export default Homepage;