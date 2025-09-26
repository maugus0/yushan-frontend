import React, { useState } from 'react';
import './contentpopover.css';
import './browse-popover.css';
import { useNavigate } from 'react-router-dom';

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}
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
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState(data[0]?.key || '');
  const activeItem = data.find((item) => item.key === activeKey);

  const go = (sectionKey, typeLabel) => {
    if (onSelect) {
      onSelect(sectionKey, typeLabel);
      return;
    }
    const base = sectionPathFromKey(sectionKey);
    if (!typeLabel || typeLabel.toLowerCase() === 'all') navigate(base);
    else navigate(`${base}/${slugify(typeLabel)}`);
  };

  return (
    <div className="browse-popover">
      <div className="browse-popover-left">
        {data.map((item) => (
          <div
            key={item.key}
            className={`browse-popover-left-item${activeKey === item.key ? ' active' : ''}`}
            onMouseEnter={() => setActiveKey(item.key)}
            onClick={() => go(item.key, 'All')}
          >
            {item.label}
          </div>
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
                            <div
                              key={type}
                              className="browse-popover-type"
                              onClick={() => go('novels', type)}
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
          ) : (
            <div className="browse-popover-types-list">
              {splitToColumns(activeItem.right[0].types, 3, 9).map((types, idx) => (
                <div key={idx}>
                  {types.map((type) => (
                    <div
                      key={type}
                      className="browse-popover-type"
                      onClick={() => go(activeKey, type)}
                    >
                      {type}
                    </div>
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