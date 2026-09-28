import React from 'react';
import { useTheme } from '../services/theme.jsx';
import { IconSun, IconMoon } from './icons.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle light/dark theme">
      {theme === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  );
}
