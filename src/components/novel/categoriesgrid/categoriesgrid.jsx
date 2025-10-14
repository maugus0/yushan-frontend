import { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './categoriesgrid.css';

const { Title } = Typography;

const CategoriesGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          'https://yushan-backend-staging.up.railway.app/api/categories'
        );

        if (response.data && response.data.data && response.data.data.categories) {
          setCategories(response.data.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    // Navigate to browse page with category filter
    navigate(`/browse?category=${category.id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <section className="categories-grid-section">
      <div className="categories-grid-container">
        <Title level={2} className="categories-grid-title">
          Browse by Category
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
        {!error && categories.length === 0 && (
          <Alert
            message="No categories found"
            description="There are currently no categories to display."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}
        <Row gutter={[16, 16]} justify="center">
          {categories.map((category) => (
            <Col xs={12} sm={8} md={6} lg={4} key={category.id}>
              <Card
                hoverable
                className="category-grid-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-grid-content">
                  <Title level={4} className="category-grid-name">
                    {category.name}
                  </Title>
                  <Typography.Text className="category-grid-description">
                    {category.description}
                  </Typography.Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default CategoriesGrid;
