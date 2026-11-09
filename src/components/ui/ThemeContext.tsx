'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SSR-safe: always start with 'dark' so server and first client render agree.
  // After mount we read localStorage and patch the theme if the user has a
  // saved preference — this avoids the hydration mismatch entirely.
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read the persisted preference on the client side only
    const savedTheme = localStorage.getItem('wealthos_theme') as Theme | null;
    const resolved = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
    setThemeState(resolved);
    document.documentElement.classList.toggle('light', resolved === 'light');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('wealthos_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
};
