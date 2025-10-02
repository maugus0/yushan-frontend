import React from 'react';
import './leaderboard-filters.css';

/**
 * Single-row capsule filter bar.
 * - Label "FILTER"
 * - No reset button, no view toggles
 * - Novels: only "Most Popular (Views)" and "Most Voted (Votes)"
 * - Writers: "By Books", "By Votes", "By Views"
 * - Hide sort group when hideSort = true (Readers)
 */
export default function LeaderboardFilters({ tab, query, onChange, hideSort = false }) {
  const timeOptions = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'overall', label: 'Overall' },
  ];

  const sortOptions =
    tab === 'novels'
      ? [
          { key: 'views', label: 'Most Popular' },
          { key: 'votes', label: 'Most Voted' },
        ]
      : tab === 'writers'
        ? [
            { key: 'books', label: 'By Books' },
            { key: 'votes', label: 'By Votes' },
            { key: 'views', label: 'By Views' },
          ]
        : [];

  return (
    <div className="lb-filters-bar one-line">
      <div className="lb-filter-group">
        <div className="lb-filter-title">FILTER:</div>
        <div className="lb-pills nowrap">
          {timeOptions.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`lb-pill${query.timeRange === t.key ? ' active' : ''}`}
              onClick={() => onChange?.({ timeRange: t.key })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!hideSort && (
        <div className="lb-filter-group">
          <div className="lb-filter-title">SORT:</div>
          <div className="lb-pills nowrap">
            {sortOptions.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`lb-pill${(query.sortBy || '') === s.key ? ' active' : ''}`}
                onClick={() => onChange?.({ sortBy: s.key })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
