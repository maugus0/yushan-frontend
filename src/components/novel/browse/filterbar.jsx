import React from 'react';
import { Select, Button, Space, Divider, Tooltip } from 'antd';
import { ReloadOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';

/**
 * FilterBar
 * Props:
 *  - genres: array of all genres
 *  - statuses: array of statuses
 *  - filters: { genre: string|null, status: string|null }
 *  - sort: string
 *  - onChangeFilters: (partial) => void
 *  - onChangeSort: (value) => void
 *  - onReset: () => void
 *  - isMobile (bool)
 *  - showSearchPlaceholder (bool) - placeholder input (future feature)
 */
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'latest', label: 'Latest' },
  { value: 'rating', label: 'Rating' },
];

const FilterBar = ({
  genres,
  statuses,
  filters,
  sort,
  onChangeFilters,
  onChangeSort,
  onReset,
  isMobile,
  showSearchPlaceholder = true,
}) => {
  return (
    <div role="region" aria-label="Filters and sorting">
      <Space wrap size="middle">
        {showSearchPlaceholder && (
          <Tooltip title="Search (coming soon)">
            <Button icon={<SearchOutlined />} disabled>
              Search
            </Button>
          </Tooltip>
        )}

        <Select
          allowClear
          placeholder="Genre"
          style={{ width: 160 }}
          value={filters.genre || undefined}
          options={genres.map((g) => ({ value: g, label: g }))}
          onChange={(v) => onChangeFilters({ genre: v || null })}
          aria-label="Filter by genre"
        />

        <Select
          allowClear
          placeholder="Status"
          style={{ width: 140 }}
          value={filters.status || undefined}
          options={statuses.map((s) => ({ value: s, label: s }))}
          onChange={(v) => onChangeFilters({ status: v || null })}
          aria-label="Filter by status"
        />

        <Select
          style={{ width: 160 }}
          value={sort}
          onChange={onChangeSort}
          options={SORT_OPTIONS}
          aria-label="Sort novels"
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={onReset}
          aria-label="Reset filters and sorting"
        >
          Reset
        </Button>

        {isMobile && (
          <>
            <Divider type="vertical" />
            <FilterOutlined />
          </>
        )}
      </Space>
    </div>
  );
};

export default FilterBar;