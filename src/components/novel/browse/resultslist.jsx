import React from 'react';
import { Alert, Empty, Spin, Button } from 'antd';
import NovelCard from './novelcard';

/**
 * ResultsList
 * Props:
 *  - novels: array
 *  - loading: bool
 *  - error: string|null
 *  - viewMode: 'grid' | 'list'
 *  - onRetry: () => void
 *  - onItemClick: (novel) => void
 */
const ResultsList = ({ novels, loading, error, viewMode, onRetry, onItemClick }) => {
  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ textAlign: 'center', marginTop: 40 }}>
        <Spin size="large" />
        <div style={{ marginTop: 8 }}>Loading novels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-live="assertive" style={{ marginTop: 24 }}>
        <Alert
          type="error"
          message="Failed to load novels"
          description={
            <div>
              {error}
              <div style={{ marginTop: 8 }}>
                <Button onClick={onRetry}>Retry</Button>
              </div>
            </div>
          }
          showIcon
        />
      </div>
    );
  }

  if (!novels.length) {
    return (
      <div role="status" aria-live="polite" style={{ marginTop: 40 }}>
        <Empty description="No results" />
      </div>
    );
  }

  const containerClass = viewMode === 'grid' ? 'novel-grid' : 'novel-list';

  return (
    <div
      className={containerClass}
      role="list"
      aria-label={`Novels in ${viewMode} view`}
    >
      {novels.map((n) => (
        <div key={n.id} role="listitem">
          <NovelCard novel={n} viewMode={viewMode} onClick={onItemClick} />
        </div>
      ))}
    </div>
  );
};

export default ResultsList;