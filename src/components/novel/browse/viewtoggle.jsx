import React from 'react';
import { Button, Tooltip } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';

/**
 * ViewToggle
 * Props:
 *  - mode: 'grid' | 'list'
 *  - onChange: (nextMode) => void
 */
const ViewToggle = ({ mode, onChange }) => {
  return (
    <div className="view-toggle-group" role="group" aria-label="Change view mode">
      <Tooltip title="Grid view">
        <Button
          aria-pressed={mode === 'grid'}
          type={mode === 'grid' ? 'primary' : 'default'}
          icon={<AppstoreOutlined />}
          onClick={() => onChange('grid')}
        />
      </Tooltip>
      <Tooltip title="List view">
        <Button
          aria-pressed={mode === 'list'}
          type={mode === 'list' ? 'primary' : 'default'}
          icon={<UnorderedListOutlined />}
          onClick={() => onChange('list')}
        />
      </Tooltip>
    </div>
  );
};

export default ViewToggle;