import React, { useState } from 'react';
import './contentpopover.css';
import './browse-popover.css';
import { Link } from 'react-router-dom';

/** Build URL-friendly slug for sub-genre paths */
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Map left keys to browse section base paths (without slug) */
function sectionPathFromKey(key) {
  if (key === 'novels') return '/browse/novel';
  if (key === 'comics') return '/browse/comics';
  if (key === 'fanfics') return '/browse/fanfics';
  return '/browse';
}

function splitToColumns(arr, colCount = 3, maxPerCol = 9) {
  const columns = Array.from({ length: colCount }, () => []);
  arr.forEach((item, idx) => {
    columns[Math.floor(idx / maxPerCol)]?.push(item);
  });
  return columns.filter((col) => col.length > 0);
}

const ContentPopover = ({ data, onSelect }) => {
  const [activeKey, setActiveKey] = useState(data[0]?.key || '');
  const activeItem = data.find((item) => item.key === activeKey);

  const hrefFor = (sectionKey, typeLabel) => {
    const base = sectionPathFromKey(sectionKey);
    if (!typeLabel || typeLabel.toLowerCase() === 'all') return base;
    return `${base}/${slugify(typeLabel)}`;
  };

  // Ensure parent onSelect still fires (keeps your navigate(path) fallback)
  const notifyParent = (sectionKey, typeLabel) => {
    if (onSelect) onSelect(sectionKey, typeLabel);
  };

  // Prevent text selection and event interference inside popover
  const stopMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const stopClickBubble = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="browse-popover" onMouseDown={stopMouseDown}>
      <div className="browse-popover-left">
        {data.map((item) => (
          <Link
            key={item.key}
            to={sectionPathFromKey(item.key)}
            className={`browse-popover-left-item${activeKey === item.key ? ' active' : ''}`}
            onMouseEnter={() => setActiveKey(item.key)}
            onClick={(e) => {
              stopClickBubble(e);
              notifyParent(item.key, 'All');
            }}
            onMouseDown={stopMouseDown}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {activeItem?.right && (
        <div className="browse-popover-right">
          {activeKey === 'novels' ? (
            <div className="browse-popover-novels">
              {activeItem.right.map((col, colIdx) => {
                const columns = splitToColumns(col.types, 3, 9);
                return (
                  <div className="browse-popover-novels-col" key={colIdx}>
                    {col.title && <div className="browse-popover-novels-title">{col.title}</div>}
                    <div className="browse-popover-novels-list">
                      {columns.map((types, idx) => (
                        <div key={idx}>
                          {types.map((type) => (
                            <Link
                              key={type}
                              to={hrefFor('novels', type)}
                              className="browse-popover-type"
                              onClick={(e) => {
                                stopClickBubble(e);
                                notifyParent('novels', type);
                              }}
                              onMouseDown={stopMouseDown}
                            >
                              {type}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="browse-popover-types-list">
              {splitToColumns(activeItem.right[0].types, 3, 9).map((types, idx) => (
                <div key={idx}>
                  {types.map((type) => (
                    <Link
                      key={type}
                      to={hrefFor(activeKey, type)}
                      className="browse-popover-type"
                      onClick={(e) => {
                        stopClickBubble(e);
                        notifyParent(activeKey, type);
                      }}
                      onMouseDown={stopMouseDown}
                    >
                      {type}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentPopover;
