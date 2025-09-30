import React, { useState } from 'react';
import './contentpopover.css';

// Split an array into N columns with near-even distribution
function splitToColumns(arr, colCount = 3) {
  const columns = Array.from({ length: colCount }, () => []);
  const perCol = Math.ceil(arr.length / colCount);
  arr.forEach((item, idx) => {
    const colIndex = Math.min(Math.floor(idx / perCol), colCount - 1);
    columns[colIndex].push(item);
  });
  return columns.filter((col) => col.length > 0);
}

/**
 * Props:
 * - data: [{ key, label, right: [{ title, types: string[] }] }]
 * - onSelect?: (sectionKey: string, typeLabel: string) => void
 * - categoriesOnly?: boolean
 */
const ContentPopover = ({ data, onSelect, categoriesOnly = false }) => {
  if (categoriesOnly) {
    const categories = data?.[0]?.right?.[0]?.types || [];
    const columns = splitToColumns(categories, 3);

    return (
      <div className="browse-popover categories-only">
        <div className="categories-grid">
          {columns.map((col, i) => (
            <div key={i} className="categories-grid-col">
              {col.map((type) => (
                <div
                  key={type}
                  className="browse-popover-type browse-popover-type--strong"
                  onClick={() => onSelect && onSelect('novels', type)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelect && onSelect('novels', type);
                    }
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback version (left rail + right pane)
  const [activeKey, setActiveKey] = useState(data[0]?.key || '');
  const activeItem = data.find((item) => item.key === activeKey);

  return (
    <div className="browse-popover">
      <div className="browse-popover-left">
        {data.map((item) => (
          <div
            key={item.key}
            className={`browse-popover-left-item${activeKey === item.key ? ' active' : ''}`}
            onMouseEnter={() => setActiveKey(item.key)}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveKey(item.key);
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {activeItem?.right && (
        <div className="browse-popover-right">
          <div className="browse-popover-novels">
            {activeItem.right.map((col, colIdx) => {
              const columns = splitToColumns(col.types, 3);
              return (
                <div className="browse-popover-novels-col" key={colIdx}>
                  {col.title && <div className="browse-popover-novels-title">{col.title}</div>}
                  <div className="browse-popover-novels-list">
                    {columns.map((types, idx) => (
                      <div key={idx}>
                        {types.map((type) => (
                          <div
                            key={type}
                            className="browse-popover-type"
                            onClick={() => onSelect && onSelect(activeKey, type)}
                            role="menuitem"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') onSelect && onSelect(activeKey, type);
                            }}
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPopover;