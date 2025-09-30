import React, { useMemo } from 'react';
import { Radio, Select, Space } from 'antd';

export default function LeaderboardFilters({ tab, query, onChange }) {
  const timeOptions = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Overall', value: 'overall' },
  ];

  const novelSortOptions = [
    { label: 'Most Popular (Views)', value: 'views' },
    { label: 'Most Voted (Votes)', value: 'votes' },
  ];

  const writerSortOptions = [
    { label: 'Composite Score', value: 'score' },
    { label: 'By Books', value: 'books' },
    { label: 'By Views', value: 'views' },
    { label: 'By Votes', value: 'votes' },
  ];

  const userSortOptions = [
    { label: 'Level + XP', value: 'levelxp' },
    { label: 'XP only', value: 'xp' },
  ];

  const genreOptions = useMemo(
    () =>
      [
        { label: 'All Novels', value: 'all' },
        'Action','Adventure','Fantasy','Sci-Fi','Romance','Drama','Comedy','Wuxia','Xianxia','Historical','Sports','Urban',
      ].map((g) =>
        typeof g === 'string' ? { label: g, value: g.toLowerCase().replace(/\s+/g, '-') } : g
      ),
    []
  );

  const sortOptions =
    tab === 'novels' ? novelSortOptions : tab === 'writers' ? writerSortOptions : userSortOptions;

  return (
    <div className="leaderboard-filters" role="region" aria-label="Leaderboard filters">
      <Space wrap size={12}>
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          options={timeOptions}
          value={query.timeRange}
          onChange={(e) => onChange({ timeRange: e.target.value })}
        />
        {tab === 'novels' && (
          <Select
            options={genreOptions}
            value={query.genre}
            onChange={(v) => onChange({ genre: v })}
            style={{ minWidth: 200 }}
          />
        )}
        <Select
          options={sortOptions}
          value={query.sortBy}
          onChange={(v) => onChange({ sortBy: v })}
          style={{ minWidth: 200 }}
        />
      </Space>
    </div>
  );
}