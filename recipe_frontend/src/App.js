import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import './App.css';

/**
 * AppShell provides the common layout (top nav) and theme toggle.
 * Includes Ocean Professional theme styling guidance.
 */
function AppShell() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <header
        className="navbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'linear-gradient(90deg, rgba(37,99,235,0.1), rgba(249,250,251,1))',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#2563EB',
                boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800
              }}
              aria-label="Recipe Planner Home"
            >
              R
            </div>
            <strong style={{ fontSize: 18 }}>Recipe Planner</strong>
          </div>
        </Link>
        <nav style={{ display: 'flex', gap: 14 }}>
          <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>
            Search
          </NavLink>
          <NavLink to="/favorites" style={({ isActive }) => navStyle(isActive)}>
            Favorites
          </NavLink>
          <NavLink to="/meal-plans" style={({ isActive }) => navStyle(isActive)}>
            Meal Plans
          </NavLink>
          <NavLink to="/grocery-list" style={({ isActive }) => navStyle(isActive)}>
            Grocery
          </NavLink>
        </nav>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{ backgroundColor: '#2563EB' }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <Outlet />
      </main>
      <footer style={{ padding: 16, textAlign: 'center', opacity: 0.7 }}>
        <small>© {new Date().getFullYear()} Recipe Planner</small>
      </footer>
    </div>
  );
}

function navStyle(isActive) {
  return {
    padding: '8px 12px',
    borderRadius: 10,
    color: isActive ? '#111827' : 'var(--text-primary)',
    background: isActive ? '#F59E0B22' : 'transparent',
    border: isActive ? '1px solid #F59E0B66' : '1px solid transparent',
    textDecoration: 'none',
    transition: 'all .2s ease'
  };
}

// PUBLIC_INTERFACE
function App() {
  /** Wrapper to keep default export named App for CRA, renders AppShell via router in index.js */
  return <AppShell />;
}

export default App;
