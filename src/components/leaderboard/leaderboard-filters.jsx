import './leaderboard-filters.css';

/**
 * Single-row capsule filter bar.
 * - Label "FILTER"
 * - No reset button, no view toggles
 * - Novels: only "most Popular (Views)" and "Most Voted (Votes)"
 * - Writers: "By Books", "By Votes", "By Views"
 * - Hide sort group when hideSort = true (Readers)
 */
export default function LeaderboardFilters({ tab, query, onChange, hideSort = false }) {
  const timeOptions = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'overall', label: 'Total' },
  ];

  const sortOptions =
    tab === 'novels'
      ? [
          { key: 'views', label: 'Popularity' },
          { key: 'votes', label: 'Votes' },
        ]
      : tab === 'writers'
        ? [
            { key: 'books', label: 'Novels' },
            { key: 'votes', label: 'Votes' },
            { key: 'views', label: 'Views' },
          ]
        : [];

  // fallback: if invalid sortBy，automatically fallback to first option
  let activeSortBy = query.sortBy;
  if (!sortOptions.find((s) => s.key === activeSortBy)) {
    activeSortBy = sortOptions.length > 0 ? sortOptions[0].key : '';
  }

  return (
    <div className="lb-filters-bar responsive">
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
                className={`lb-pill${activeSortBy === s.key ? ' active' : ''}`}
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
