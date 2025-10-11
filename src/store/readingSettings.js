// Reading settings context (font size & font family) with localStorage persistence.
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LS_KEY = 'yushan.reader.settings.v1';
const DEFAULTS = { fontSize: 18, fontFamily: 'serif' }; // 'serif' | 'sans'

function loadInitial() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

const Ctx = createContext({
  settings: DEFAULTS,
  updateSetting: () => {},
  resetSettings: () => {},
});

export const ReadingSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(loadInitial);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((s) => (s[key] === value ? s : { ...s, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULTS), []);

  return <Ctx.Provider value={{ settings, updateSetting, resetSettings }}>{children}</Ctx.Provider>;
};

export function useReadingSettings() {
  return useContext(Ctx);
}
