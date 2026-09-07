import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

const defaultSettings = {
  randomizeQuestions: false
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('aptis_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('aptis_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
