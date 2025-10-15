import { useEffect, useState } from 'react';
import { Card, Typography, Spin, Tag, Alert } from 'antd';
import { EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleImageError } from '../../../utils/imageUtils';
import fallbackImage from '../../../assets/images/novel_default.png';
import './topnovels.css';

const { Title } = Typography;

const TopNovels = () => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onImageError = (e) => handleImageError(e, fallbackImage);

  useEffect(() => {
    const fetchTopNovels = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          'https://yushan-backend-staging.up.railway.app/api/ranking/novel',
          {
            params: {
              page: 0,
              size: 15,
              sortType: 'view',
              timeRange: 'overall',
            },
          }
        );

        if (response.data && response.data.data && response.data.data.content) {
          const novels = response.data.data.content;
          setNovels(novels);
        }
      } catch (error) {
        console.error('Error fetching top novels:', error);
        setError('Failed to load top novels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopNovels();
  }, []);

  const handleNovelClick = (novel) => {
    navigate(`/novel/${novel.id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <section className="top-novels-section">
      <div className="top-novels-container">
        <Title level={2} className="top-novels-title">
          Top Novels
        </Title>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}
        {!error && novels.length === 0 && (
          <Alert
            message="No novels found"
            description="There are currently no top novels to display."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}
        <div className="top-novels-grid">
          {novels.map((novel, index) => (
            <div
              key={novel.id}
              className="top-novel-card-wrapper"
              onClick={() => handleNovelClick(novel)}
            >
              <Card hoverable className="top-novel-card">
                <div className="top-novel-cover-wrapper">
                  <div className="top-novel-rank-badge">#{index + 1}</div>
                  <img
                    alt={novel.title}
                    src={novel.coverImgUrl || fallbackImage}
                    onError={onImageError}
                    className="top-novel-cover"
                  />
                </div>
                <div className="top-novel-content">
                  <Title level={5} ellipsis={{ rows: 2 }} className="top-novel-title-text">
                    {novel.title}
                  </Title>
                  <Typography.Text
                    className="top-novel-author"
                    ellipsis
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent novel card click
                      navigate(`/profile/${novel.authorId || novel.userId}`);
                    }}
                  >
                    by {novel.authorUsername || novel.author || 'Unknown Author'}
                  </Typography.Text>
                  <div className="top-novel-stats">
                    <span className="top-novel-stat">
                      <EyeOutlined /> {novel.viewCnt?.toLocaleString() || 0}
                    </span>
                    <span className="top-novel-stat">
                      <HeartOutlined /> {novel.voteCnt?.toLocaleString() || 0}
                    </span>
                  </div>
                  {novel.category && <Tag className="top-novel-category">{novel.category}</Tag>}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopNovels;
