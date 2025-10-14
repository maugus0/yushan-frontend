import { useEffect, useState } from 'react';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { Select, Card, Typography, Tag, Row, Col, Divider } from 'antd';
import './writerdashboard.css';
import novelService from '../../services/novel';
import userService from '../../services/user';

const { Title, Text } = Typography;

const WriterDashboard = () => {
  const [novels, setNovels] = useState([]);
  const [selectedNovelId, setSelectedNovelId] = useState(null);
  const [selectedNovel, setSelectedNovel] = useState(null);

  useEffect(() => {
    const getNovelData = async () => {
      const author = await userService.getMe();
      const data = await novelService.getNovel({ authorId: author.uuid });
      setNovels(data || []);
      if (data && data.length > 0) {
        setSelectedNovelId(data[0].id);
        setSelectedNovel(data[0]);
      }
    };
    getNovelData();
  }, []);

  useEffect(() => {
    if (novels.length > 0 && selectedNovelId) {
      const found = novels.find((n) => n.id === selectedNovelId);
      setSelectedNovel(found || novels[0]);
    }
  }, [novels, selectedNovelId]);

  return (
    <div className="writerdashboard-page">
      <WriterNavbar />
      <div className="writerdashboard-content">
        <div className="writerdashboard-header">
          <h2 className="writerdashboard-title">Dashboard</h2>
          <Select
            style={{ minWidth: 200, marginLeft: 'auto' }}
            value={selectedNovelId}
            onChange={setSelectedNovelId}
            options={novels.map((n) => ({
              label: n.title,
              value: n.id,
            }))}
          />
        </div>
        {novels.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 120, fontSize: 22, color: '#aaa' }}>
            No data! Create your first book~
          </div>
        ) : (
          selectedNovel && (
            <Card className="writerdashboard-novel-card" bodyStyle={{ padding: 32 }}>
              <Row gutter={32}>
                <Col xs={24} sm={8} md={6} style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={selectedNovel.coverImgUrl}
                    alt="cover"
                    className="writerdashboard-novel-cover"
                    style={{ boxShadow: '0 4px 24px rgba(81,95,160,0.08)' }}
                  />
                </Col>
                <Col xs={24} sm={16} md={18}>
                  <div className="writerdashboard-novel-main">
                    <Title
                      level={3}
                      className="writerdashboard-novel-title"
                      style={{ marginBottom: 0 }}
                    >
                      {selectedNovel.title}
                      <Tag color="blue" style={{ marginLeft: 16 }}>
                        {selectedNovel.categoryName}
                      </Tag>
                      <Tag
                        color={selectedNovel.status === 'PUBLISHED' ? 'green' : 'orange'}
                        style={{ marginLeft: 8 }}
                      >
                        {selectedNovel.status}
                      </Tag>
                    </Title>
                    <Text
                      type="secondary"
                      className="writerdashboard-novel-desc"
                      style={{ fontSize: 16 }}
                    >
                      {selectedNovel.synopsis}
                    </Text>
                    <Divider style={{ margin: '16px 0' }} />
                    <Row gutter={16} style={{ marginBottom: 12 }}>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.chapterCnt}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Chapters
                          </Text>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.wordCnt}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Words
                          </Text>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.reviewCnt}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Reviews
                          </Text>
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.viewCnt}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Views
                          </Text>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.voteCnt}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Votes
                          </Text>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.avgRating}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Avg Rating
                          </Text>
                        </div>
                      </Col>
                    </Row>
                    <Divider style={{ margin: '16px 0' }} />
                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.authorUsername}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Author
                          </Text>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.createTime && selectedNovel.createTime.slice(0, 10)}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Created
                          </Text>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {selectedNovel.updateTime && selectedNovel.updateTime.slice(0, 10)}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            Last Updated
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default WriterDashboard;
