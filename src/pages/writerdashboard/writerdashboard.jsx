import { useEffect, useState } from 'react';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { Select, Card, Typography, Tag, Row, Col, Divider, Modal, Button, Spin } from 'antd';
import './writerdashboard.css';
import novelService from '../../services/novel';
import userService from '../../services/user';

const { Title, Text } = Typography;

const WriterDashboard = () => {
  const [novels, setNovels] = useState([]);
  const [selectedNovelId, setSelectedNovelId] = useState(null);
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getNovelData = async () => {
      setLoading(true);
      try {
        const author = await userService.getMe();
        const data = await novelService.getNovel({ authorId: author.uuid });
        setNovels(data || []);
        if (data && data.length > 0) {
          setSelectedNovelId(data[0].id);
          setSelectedNovel(data[0]);
        }
      } catch (error) {
        setErrorMsg(error.message || 'Failed to load dashboard data.');
        setErrorModal(true);
      } finally {
        setLoading(false);
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

  const isValidBase64Url = (url) => {
    return /^data:image\/(jpeg|png|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(url);
  };

  return (
    <div className="writerdashboard-page">
      <WriterNavbar />
      <div className="writerdashboard-content">
        <div className="writerdashboard-header">
          <h2 className="writerdashboard-title">Dashboard</h2>
          <Select
            className="writerdashboard-select"
            value={selectedNovelId}
            onChange={setSelectedNovelId}
            options={novels.map((n) => ({
              label: n.title,
              value: n.id,
            }))}
            placeholder="Select a novel"
          />
        </div>
        <div className="writerdashboard-main">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" tip="Loading..." />
            </div>
          ) : novels.length === 0 ? (
            <div className="no-data-placeholder">No data! Create your first book~</div>
          ) : (
            selectedNovel && (
              <Card className="writerdashboard-novel-card" bodyStyle={{ padding: 0 }}>
                <Row gutter={[32, 24]}>
                  <Col xs={24} md={8} lg={6} className="writerdashboard-cover-col">
                    <img
                      src={
                        selectedNovel.coverImgUrl && isValidBase64Url(selectedNovel.coverImgUrl)
                          ? selectedNovel.coverImgUrl
                          : require('../../assets/images/novel_default.png')
                      }
                      alt={selectedNovel.title}
                      className="writerdashboard-novel-cover"
                      style={
                        selectedNovel.coverImgUrl && isValidBase64Url(selectedNovel.coverImgUrl)
                          ? undefined
                          : {
                              objectFit: 'cover',
                              objectPosition: 'center',
                              borderRadius: 12,
                              transform: 'scale(1.08) translateY(-6px)',
                              background: '#f5f5f5',
                            }
                      }
                    />
                  </Col>
                  <Col xs={24} md={16} lg={18} className="writerdashboard-details-col">
                    <div className="writerdashboard-novel-main">
                      <Title level={3} className="writerdashboard-novel-title">
                        {selectedNovel.title}
                      </Title>
                      <div className="writerdashboard-tags">
                        <Tag color="blue">{selectedNovel.categoryName}</Tag>
                        <Tag color={selectedNovel.status === 'PUBLISHED' ? 'green' : 'orange'}>
                          {selectedNovel.status}
                        </Tag>
                      </div>
                      <Text type="secondary" className="writerdashboard-novel-desc">
                        {selectedNovel.synopsis}
                      </Text>
                      <Divider className="writerdashboard-divider" />
                      <Row gutter={[16, 16]} className="writerdashboard-stats-grid">
                        <Col xs={12} sm={8}>
                          <div className="writerdashboard-novel-stat-item">
                            <Text strong className="writerdashboard-novel-stat-value">
                              {selectedNovel.chapterCnt}
                            </Text>
                            <Text type="secondary" className="writerdashboard-novel-stat-label">
                              Chapters
                            </Text>
                          </div>
                        </Col>
                        <Col xs={12} sm={8}>
                          <div className="writerdashboard-novel-stat-item">
                            <Text strong className="writerdashboard-novel-stat-value">
                              {selectedNovel.wordCnt}
                            </Text>
                            <Text type="secondary" className="writerdashboard-novel-stat-label">
                              Words
                            </Text>
                          </div>
                        </Col>
                        <Col xs={12} sm={8}>
                          <div className="writerdashboard-novel-stat-item">
                            <Text strong className="writerdashboard-novel-stat-value">
                              {selectedNovel.reviewCnt}
                            </Text>
                            <Text type="secondary" className="writerdashboard-novel-stat-label">
                              Reviews
                            </Text>
                          </div>
                        </Col>
                        <Col xs={12} sm={8}>
                          <div className="writerdashboard-novel-stat-item">
                            <Text strong className="writerdashboard-novel-stat-value">
                              {selectedNovel.viewCnt}
                            </Text>
                            <Text type="secondary" className="writerdashboard-novel-stat-label">
                              Views
                            </Text>
                          </div>
                        </Col>
                        <Col xs={12} sm={8}>
                          <div className="writerdashboard-novel-stat-item">
                            <Text strong className="writerdashboard-novel-stat-value">
                              {selectedNovel.voteCnt}
                            </Text>
                            <Text type="secondary" className="writerdashboard-novel-stat-label">
                              Votes
                            </Text>
                          </div>
                        </Col>
                        <Col xs={12} sm={8}>
                          <div className="writerdashboard-novel-stat-item">
                            <Text strong className="writerdashboard-novel-stat-value">
                              {selectedNovel.avgRating}
                            </Text>
                            <Text type="secondary" className="writerdashboard-novel-stat-label">
                              Avg Rating
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
        <Modal
          open={errorModal}
          onCancel={() => setErrorModal(false)}
          footer={[
            <Button key="confirm" type="primary" onClick={() => setErrorModal(false)}>
              Confirm
            </Button>,
          ]}
          centered
          maskClosable={false}
          closable={false}
          style={{ textAlign: 'center', borderRadius: 12, background: '#fff' }}
        >
          <div
            style={{
              color: '#cf1322',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 8,
              padding: '18px 16px',
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 12,
              boxShadow: '0 2px 12px rgba(255,77,79,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#ff4d4f" />
              <path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1.2" fill="#fff" />
            </svg>
            {errorMsg}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WriterDashboard;
