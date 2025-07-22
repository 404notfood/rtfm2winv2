import React from 'react';
import { useTheme } from '../providers/ThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <div style={{ margin: '1rem 0' }}>
      <label htmlFor="theme-select">Thème&nbsp;: </label>
      <select
        id="theme-select"
        value={currentTheme?.id || ''}
        onChange={e => setTheme(Number(e.target.value))}
      >
        {themes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
