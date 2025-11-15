import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

function RecipeCard({ recipe, onFavToggle, isFav }) {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <strong style={{ fontSize: 16 }}>{recipe.title || 'Untitled Recipe'}</strong>
        <button
          onClick={onFavToggle}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            border: '1px solid #F59E0B66',
            borderRadius: 10,
            padding: '6px 10px',
            background: isFav ? '#F59E0B' : 'transparent',
            color: isFav ? '#111827' : 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          {isFav ? '★ Favorite' : '☆ Favorite'}
        </button>
      </div>
      <div style={{ fontSize: 14, opacity: 0.8, minHeight: 34 }}>
        {recipe.summary ? stripHtml(recipe.summary).slice(0, 120) + '…' : 'No description'}
      </div>
      <Link
        to={`/recipe/${recipe.id}`}
        style={{
          alignSelf: 'flex-start',
          color: '#2563EB',
          textDecoration: 'none',
          fontWeight: 600
        }}
      >
        View details →
      </Link>
    </div>
  );
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

// PUBLIC_INTERFACE
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { addFavorite, removeFavorite, isFavorite } = useApp();

  useEffect(() => {
    // load default popular results if backend decides so (optional)
    // No automatic call to prevent unnecessary 404s if endpoint isn't present yet.
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await apiClient.searchRecipes(query.trim());
      // Expect either { results: [...] } or array
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setRecipes(list);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to search');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 style={{ margin: 0, fontSize: 28 }}>Find recipes</h1>
      <p style={{ marginTop: 6, opacity: 0.75 }}>
        Search for dishes and add them to your favorites or meal plans.
      </p>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes (e.g., pasta, salad)"
          aria-label="Search recipes"
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid var(--border-color)'
          }}
        />
        <button
          type="submit"
          className="btn"
          style={{
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '10px 16px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </form>

      {loading && <p style={{ marginTop: 16 }}>Loading…</p>}
      {errorMsg && (
        <p role="alert" style={{ marginTop: 16, color: '#EF4444' }}>
          {errorMsg}
        </p>
      )}

      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14
        }}
      >
        {recipes.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            isFav={isFavorite(r.id)}
            onFavToggle={() => (isFavorite(r.id) ? removeFavorite(r.id) : addFavorite(r))}
          />
        ))}
      </div>
    </section>
  );
}
