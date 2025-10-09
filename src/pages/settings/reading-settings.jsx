import React from 'react';
import { useReadingSettings } from '../../store/readingSettings';
import './reading-settings.css';

export default function ReadingSettingsPage() {
  const { settings, updateSetting, resetSettings } = useReadingSettings();

  // Compute font-family string locally (keeps preview independent from reader page)
  const computedFamily =
    settings.fontFamily === 'serif'
      ? 'Georgia, "Times New Roman", serif'
      : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

  return (
    <div className="reading-settings-page">
      <div className="reading-settings-card">
        <h1>Reading Settings</h1>

        <div className="reading-settings-group">
          <label>
            Font Size ({settings.fontSize}px)
            <input
              type="range"
              min={14}
              max={22}
              step={1}
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
            />
          </label>

          <label>
            Font Family
            <span className="reading-select-wrapper">
              <select
                className="reading-select"
                value={settings.fontFamily}
                onChange={(e) => updateSetting('fontFamily', e.target.value)}
              >
                <option value="serif">Serif (Georgia)</option>
                <option value="sans">Sans (System UI)</option>
              </select>
            </span>
          </label>
        </div>

        <div
          className="reading-preview"
          style={{
            fontSize: settings.fontSize,
            fontFamily: computedFamily,
          }}
        >
          Preview paragraph. Adjust settings to see live changes. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit. Integer posuere erat a ante. Curabitur vitae sem nec nunc
          placerat tincidunt.
        </div>

        <div className="reading-settings-actions">
          <button type="button" className="reading-settings-btn" onClick={resetSettings}>
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
