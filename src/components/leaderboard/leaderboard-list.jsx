import React from 'react';
import { List, Avatar, Tag, Pagination, Skeleton, Alert, Space, Tooltip } from 'antd';
import { CrownFilled, UserOutlined, ReadOutlined, FireFilled, LikeFilled, BookFilled } from '@ant-design/icons';
import { xpToLevel, freeTicketsPerWeek, freeTicketsPerDay, levelMeta } from '../../utils/levels';

const Medal = ({ rank }) => {
  if (rank > 3) return null;
  const colors = ['#fadb14', '#d9d9d9', '#ad6800'];
  return <CrownFilled style={{ color: colors[rank - 1], marginRight: 6 }} />;
};

export default function LeaderboardList({ tab, loading, error, data, page, pageSize, onPageChange }) {
  const renderItem = (item, index) => {
    const rank = (page - 1) * pageSize + index + 1;

    if (tab === 'novels') {
      return (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar shape="square" size={48} src={item.cover} icon={<ReadOutlined />} />}
            title={
              <Space wrap>
                <Medal rank={rank} />
                <span>{rank}.</span>
                <a href={`/read/${item.novelId || item.id}`}>{item.title}</a>
                {item.genre && <Tag>{item.genre}</Tag>}
              </Space>
            }
            description={
              <Space size={12} wrap>
                <Tooltip title="Views"><span><FireFilled style={{ color: '#fa8c16' }} /> {item.views?.toLocaleString?.() || 0}</span></Tooltip>
                <Tooltip title="Votes"><span><LikeFilled style={{ color: '#52c41a' }} /> {item.votes?.toLocaleString?.() || 0}</span></Tooltip>
              </Space>
            }
          />
        </List.Item>
      );
    }

    if (tab === 'users') {
      const level = item.level ?? xpToLevel(item.xp || 0);
      const week = freeTicketsPerWeek(level);
      const day = freeTicketsPerDay(level);
      const meta = levelMeta(level);
      return (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar size={48} src={item.avatar} icon={<UserOutlined />} />}
            title={
              <Space wrap>
                <Medal rank={rank} />
                <span>{rank}.</span>
                <a href={`/profile/${item.userId || item.username}`}>{item.username}</a>
                <Tag color="blue">Lv.{level} · {meta.title}</Tag>
              </Space>
            }
            description={
              <Space size={12} wrap>
                <span>XP: {item.xp?.toLocaleString?.() || 0}</span>
                <span>Free tickets: {week}/week (~{day}/day)</span>
              </Space>
            }
          />
        </List.Item>
      );
    }

    // writers
    return (
      <List.Item>
        <List.Item.Meta
          avatar={<Avatar size={48} src={item.avatar} icon={<UserOutlined />} />}
          title={
            <Space wrap>
              <Medal rank={rank} />
              <span>{rank}.</span>
              <a href={`/profile/${item.writerId || item.name}`}>{item.name}</a>
              <Tag color="purple">Score: {typeof item.score === 'number' ? item.score.toFixed(3) : item.score}</Tag>
            </Space>
          }
          description={
            <Space size={12} wrap>
              <span><BookFilled /> Books: {item.books || 0}</span>
              <span><FireFilled style={{ color: '#fa8c16' }} /> Views: {item.views?.toLocaleString?.() || 0}</span>
              <span><LikeFilled style={{ color: '#52c41a' }} /> Votes: {item.votes?.toLocaleString?.() || 0}</span>
            </Space>
          }
        />
      </List.Item>
    );
  };

  if (error) return <div className="leaderboard-list"><Alert type="error" message={error} /></div>;

  return (
    <div className="leaderboard-list">
      <List
        itemLayout="horizontal"
        dataSource={loading ? Array.from({ length: pageSize }).map((_, i) => ({ __skeleton: i })) : data.items}
        renderItem={(it, idx) =>
          it.__skeleton ? (
            <List.Item>
              <List.Item.Meta
                avatar={<Skeleton.Avatar active size={48} shape="circle" />}
                title={<Skeleton.Input active style={{ width: 320 }} />}
                description={<Skeleton.Input active style={{ width: 420 }} />}
              />
            </List.Item>
          ) : (
            renderItem(it, idx)
          )
        }
      />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={data.total}
          onChange={onPageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50']}
        />
      </div>
    </div>
  );
}