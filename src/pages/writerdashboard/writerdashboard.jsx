import React, { useState, useEffect, useRef } from 'react';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { Select, Card, List, Typography } from 'antd';
import * as echarts from 'echarts';
import './writerdashboard.css';
import novelService from '../../services/novel';
import userService from '../../services/user';
import voteService from '../../services/vote';

const { Title, Text } = Typography;

const WriterDashboard = () => {
  const [novels, setNovels] = useState([]);
  const [selectedNovelId, setSelectedNovelId] = useState(null);
  const [selectedNovel, setSelectedNovel] = useState(null);

  const viewsChartRef = useRef(null);
  const votesChartRef = useRef(null);

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

  useEffect(() => {
    if (selectedNovel) {
      // Views Trend Chart
      const viewsChart = echarts.init(viewsChartRef.current);
      viewsChart.setOption({
        title: { text: 'Views (Last 7 Days)', left: 'center', top: 10, textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
          axisLine: { lineStyle: { color: '#b1bdf5ff' } },
          axisLabel: { color: '#283157' },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#b1bdf5ff' } },
          axisLabel: { color: '#283157' },
          splitLine: { lineStyle: { color: '#e1e6f5' } },
        },
        series: [
          {
            data: selectedNovel.viewsTrend,
            type: 'line',
            smooth: true,
            areaStyle: { color: 'rgba(24, 144, 255, 0.15)' },
            lineStyle: { color: '#b1bdf5ff', width: 3 },
            itemStyle: { color: '#b1bdf5ff' },
          },
        ],
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
      });
      // Votes Trend Chart
      const votesChart = echarts.init(votesChartRef.current);
      votesChart.setOption({
        title: { text: 'Votes (Last 7 Days)', left: 'center', top: 10, textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
          axisLine: { lineStyle: { color: '#cab8ebff' } },
          axisLabel: { color: '#283157' },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#cab8ebff' } },
          axisLabel: { color: '#283157' },
          splitLine: { lineStyle: { color: '#e1e6f5' } },
        },
        series: [
          {
            data: selectedNovel.votesTrend,
            type: 'line',
            smooth: true,
            areaStyle: { color: 'rgba(124, 58, 237, 0.15)' },
            lineStyle: { color: '#cab8ebff', width: 3 },
            itemStyle: { color: '#cab8ebff' },
          },
        ],
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
      });
      const resize = () => {
        viewsChart.resize();
        votesChart.resize();
      };
      window.addEventListener('resize', resize);
      return () => {
        viewsChart.dispose();
        votesChart.dispose();
        window.removeEventListener('resize', resize);
      };
    }
  }, [selectedNovel]);

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
        ) : selectedNovel && (
          <Card className="writerdashboard-novel-card" bodyStyle={{ padding: 32 }}>
            <div className="writerdashboard-novel-info">
              <img src={selectedNovel.coverImgUrl} alt="cover" className="writerdashboard-novel-cover" />
              <div className="writerdashboard-novel-main">
                <Title level={4} className="writerdashboard-novel-title">
                  {selectedNovel.title}
                </Title>
                <Text type="secondary" className="writerdashboard-novel-desc">
                  {selectedNovel.synopsis}
                </Text>
                <div className="writerdashboard-novel-stats-list">
                  <List
                    grid={{ gutter: 16, column: 4 }}
                    dataSource={[
                      { label: 'Views', value: selectedNovel.viewCnt },
                      { label: 'Votes', value: selectedNovel.voteCnt },
                      { label: 'Rating', value: selectedNovel.avgRating },
                      { label: 'Words', value: selectedNovel.wordCnt },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <div className="writerdashboard-novel-stat-item">
                          <Text strong className="writerdashboard-novel-stat-value">
                            {item.value}
                          </Text>
                          <br />
                          <Text type="secondary" className="writerdashboard-novel-stat-label">
                            {item.label}
                          </Text>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
        {novels.length > 0 && (
          <div className="writerdashboard-charts-row">
            <Card
              className="writerdashboard-chart-card"
              style={{ width: '49%', minHeight: 320, marginRight: '2%' }}
            >
              <div ref={viewsChartRef} className="writerdashboard-chart-echarts" />
            </Card>
            <Card className="writerdashboard-chart-card" style={{ width: '49%', minHeight: 320 }}>
              <div ref={votesChartRef} className="writerdashboard-chart-echarts" />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriterDashboard;
