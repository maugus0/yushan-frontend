import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

/**
 * FilterPills
 * Pill-style filter & sort bar (right column top).
 *
 * Props:
 *  - sort: string
 *  - onChangeSort: (value) => void
 *  - status: string|null   ('Ongoing' | 'Completed' | null)
 *  - onChangeStatus: (status|null) => void
 *  - onReset: () => void
 *  - viewToggle (ReactNode)  pass in <ViewToggle/>
 */

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popular' },
  { value: 'latest', label: 'Latest' },
  { value: 'rating', label: 'Rating' },
];

const STATUS_OPTIONS = [
  { value: null, label: 'All' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
];

const PillButton = ({ active, children, onClick, ariaLabel }) => (
  <Button
    size="small"
    type={active ? 'primary' : 'default'}
    shape="round"
    onClick={onClick}
    aria-pressed={active}
    aria-label={ariaLabel}
    className="pill-btn"
  >
    {children}
  </Button>
);

const FilterPills = ({ sort, onChangeSort, status, onChangeStatus, onReset, viewToggle }) => {
  return (
    <div className="filter-pills" role="region" aria-label="Filter and sort">
      <div className="filter-pills__row">
        <div className="filter-pills__group" aria-label="Status Filter">
          <span className="filter-pills__label">Status:</span>
          <Space size={[8, 8]} wrap>
            {STATUS_OPTIONS.map((s) => (
              <PillButton
                key={`status-${s.label}`}
                active={status === s.value}
                onClick={() => onChangeStatus(s.value)}
                ariaLabel={`Status ${s.label}`}
              >
                {s.label}
              </PillButton>
            ))}
          </Space>
        </div>

        <div className="filter-pills__group" aria-label="Sort By">
          <span className="filter-pills__label">Sort:</span>
          <Space size={[8, 8]} wrap>
            {SORT_OPTIONS.map((o) => (
              <PillButton
                key={`sort-${o.value}`}
                active={sort === o.value}
                onClick={() => onChangeSort(o.value)}
                ariaLabel={`Sort by ${o.label}`}
              >
                {o.label}
              </PillButton>
            ))}
          </Space>
        </div>

        <div className="filter-pills__group" aria-label="Actions">
          <Space>
            <Tooltip title="Search (coming soon)">
              <Button size="small" shape="round" icon={<SearchOutlined />} disabled>
                Search
              </Button>
            </Tooltip>
            <Button
              size="small"
              shape="round"
              icon={<ReloadOutlined />}
              onClick={onReset}
              aria-label="Reset filters"
            >
              Reset
            </Button>
            {viewToggle}
          </Space>
        </div>
      </div>
    </div>
  );
};

export default FilterPills;
