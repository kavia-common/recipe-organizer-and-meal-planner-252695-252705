import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

// PUBLIC_INTERFACE
export default function FavoritesPage() {
  const { favorites, removeFavorite } = useApp();

  return (
    <section>
      <h1 style={{ margin: 0 }}>Favorites</h1>
      <p style={{ marginTop: 6, opacity: 0.75 }}>Your saved recipes.</p>

      {favorites.length === 0 && <p>No favorites yet. Go to Search and add some!</p>}

      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14
        }}
      >
        {favorites.map((r) => (
          <div
            key={r.id}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <strong>{r.title}</strong>
              <button
                onClick={() => removeFavorite(r.id)}
                aria-label="Remove favorite"
                style={{
                  border: '1px solid #EF444466',
                  borderRadius: 10,
                  padding: '6px 10px',
                  background: 'transparent',
                  color: '#EF4444',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
            <Link to={`/recipe/${r.id}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
              View details →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
