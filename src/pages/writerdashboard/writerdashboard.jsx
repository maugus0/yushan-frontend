import React, { useState, useEffect, useRef } from 'react';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { Select, Card, List, Typography } from 'antd';
import * as echarts from 'echarts';
import './writerdashboard.css';

const { Title, Text } = Typography;

const novels = [
  {
    id: 1,
    title: 'Novel One',
    desc: 'A fantasy adventure.',
    cover: require('../../assets/images/testimg.png'),
    views: 12345,
    votes: 88,
    rating: 4.5,
    chapters: 12,
    words: 45000,
    viewsTrend: [100, 120, 130, 110, 90, 80, 95],
    votesTrend: [10, 12, 15, 14, 13, 12, 11],
    genderRatio: { male: 60, female: 35, other: 5 },
  },
  {
    id: 2,
    title: 'Novel Two',
    desc: 'A sci-fi thriller.',
    cover: require('../../assets/images/testimg2.png'),
    views: 6789,
    votes: 72,
    rating: 4.0,
    chapters: 8,
    words: 32000,
    viewsTrend: [80, 85, 90, 95, 100, 105, 110],
    votesTrend: [5, 6, 7, 8, 9, 10, 11],
    genderRatio: { male: 40, female: 50, other: 10 },
  },
];

const statList = [
  { label: 'Views', key: 'views' },
  { label: 'Votes', key: 'votes' },
  { label: 'Rating', key: 'rating' },
  { label: 'Words', key: 'words' },
];

const WriterDashboard = () => {
  const [selectedNovelId, setSelectedNovelId] = useState(novels[0].id);
  const selectedNovel = novels.find((n) => n.id === selectedNovelId);

  const viewsChartRef = useRef(null);
  const votesChartRef = useRef(null);
  const genderChartRef = useRef(null);

  useEffect(() => {
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
    // Gender Pie Chart
    const genderChart = echarts.init(genderChartRef.current);
    genderChart.setOption({
      title: { text: 'Gender Ratio', left: 'center', top: 10, textStyle: { fontSize: 16 } },
      tooltip: { trigger: 'item' },
      legend: { bottom: 10, left: 'center', textStyle: { color: '#283157' } },
      series: [
        {
          name: 'Gender',
          type: 'pie',
          radius: '50%',
          data: [
            {
              value: selectedNovel.genderRatio.male,
              name: 'MALE',
              itemStyle: { color: '#a7d0f7ff' },
            },
            {
              value: selectedNovel.genderRatio.female,
              name: 'FEMALE',
              itemStyle: { color: '#f7aad4ff' },
            },
            {
              value: selectedNovel.genderRatio.other,
              name: 'PREFER NOT TO SAY',
              itemStyle: { color: '#cce1c1ff' },
            },
          ],
          label: { formatter: '{b}: {d}%' },
        },
      ],
    });
    // Resize on window
    const resize = () => {
      viewsChart.resize();
      votesChart.resize();
      genderChart.resize();
    };
    window.addEventListener('resize', resize);
    return () => {
      viewsChart.dispose();
      votesChart.dispose();
      genderChart.dispose();
      window.removeEventListener('resize', resize);
    };
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
            options={novels.map((n) => ({ label: n.title, value: n.id }))}
          />
        </div>
        <Card className="writerdashboard-novel-card" bodyStyle={{ padding: 32 }}>
          <div className="writerdashboard-novel-info">
            <img src={selectedNovel.cover} alt="cover" className="writerdashboard-novel-cover" />
            <div className="writerdashboard-novel-main">
              <Title level={4} className="writerdashboard-novel-title">
                {selectedNovel.title}
              </Title>
              <Text type="secondary" className="writerdashboard-novel-desc">
                {selectedNovel.desc}
              </Text>
              <div className="writerdashboard-novel-stats-list">
                <List
                  grid={{ gutter: 16, column: 4 }}
                  dataSource={statList}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="writerdashboard-novel-stat-item">
                        <Text strong className="writerdashboard-novel-stat-value">
                          {selectedNovel[item.key]}
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
        <Card
          className="writerdashboard-gender-card"
          style={{ width: '100%', minHeight: 320, marginTop: 24 }}
        >
          <div ref={genderChartRef} className="writerdashboard-chart-echarts" />
        </Card>
      </div>
    </div>
  );
};

export default WriterDashboard;
