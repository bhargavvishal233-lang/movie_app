import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setThemeMode: () => {},
  brightness: 100,
  setBrightnessLevel: () => {},
});

export function ThemeProvider({ children }) {
  // Theme state: 'dark' (default film-noir) or 'light' (white clean editorial)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('movie_app_theme');
        if (saved === 'light' || saved === 'dark') return saved;
      } catch (e) {}
    }
    return 'dark';
  });

  // Brightness level: 85 (dim cinema), 100 (standard), 115 (vivid bright)
  const [brightness, setBrightness] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('movie_app_brightness');
        if (saved) return Number(saved);
      } catch (e) {}
    }
    return 100;
  });

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    try {
      localStorage.setItem('movie_app_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Apply brightness filter variable to root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-brightness', `${brightness}%`);
    try {
      localStorage.setItem('movie_app_brightness', String(brightness));
    } catch (e) {}
  }, [brightness]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (mode) => {
    if (mode === 'dark' || mode === 'light') {
      setTheme(mode);
    }
  };

  const setBrightnessLevel = (lvl) => {
    setBrightness(lvl);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark: theme === 'dark', 
      toggleTheme, 
      setThemeMode,
      brightness, 
      setBrightnessLevel 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

