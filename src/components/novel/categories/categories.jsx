import React from 'react';
import { Tag } from 'antd';
import './categories.css';

const Categories = ({ title = 'Categories', data = [] }) => (
  <div className="categories-container">
    <div className="categories-title">{title}</div>
    <div className="categories-divider" />
    <div className="categories-section">
      {data.flatMap(section =>
        section.right.flatMap(group =>
          group.types.map(type => (
            <Tag
              key={type}
              className="categories-tag"
              color="default"
            >
              {type}
            </Tag>
          ))
        )
      )}
    </div>
  </div>
);

export default Categories;
