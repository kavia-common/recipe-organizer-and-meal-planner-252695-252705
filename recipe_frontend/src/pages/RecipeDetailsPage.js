import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, getAuthStatus } from '../services/apiClient';
import { useApp } from '../state/AppContext';

// PUBLIC_INTERFACE
export default function RecipeDetailsPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const { addFavorite, removeFavorite, isFavorite, addGroceryItem } = useApp();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErr('');
    apiClient
      .getRecipeDetails(id)
      .then((data) => {
        if (active) setRecipe(data);
      })
      .catch((e) => {
        if (active) {
          const msg = e?.message || 'Failed to load recipe';
          setErr(msg);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (err) {
    const status = getAuthStatus?.() || {};
    const offlineHint = status.online === false ? ' You appear to be offline.' : '';
    const proxyHint = /CORS/i.test(err) || /Failed to fetch/i.test(err)
      ? (status.corsProxy ? ' Check if the CORS proxy is reachable.' : ' CORS proxy is disabled. Enable or provide a proxy if your environment enforces CORS.')
      : '';
    const devUrl = process.env.NODE_ENV !== 'production'
      ? [
          status.lastProxiedUrl ? `Last proxied URL: ${status.lastProxiedUrl}` : null,
          status.lastFailingUrl ? `Last error URL: ${status.lastFailingUrl}` : null
        ].filter(Boolean).map(s => `[${s}]`).join(' ')
      : '';
    return (
      <div role="alert" style={{ color: '#EF4444' }}>
        <p style={{ margin: 0 }}>{`${err}${offlineHint}${proxyHint}${devUrl ? ' ' + devUrl : ''}`}</p>
      </div>
    );
  }
  if (!recipe) return <p>No recipe found.</p>;

  const onFav = () => {
    isFavorite(recipe.id) ? removeFavorite(recipe.id) : addFavorite(recipe);
  };

  const addIngredientsToGrocery = () => {
    const ingredients = recipe?.extendedIngredients || [];
    ingredients.forEach((ing) => {
      const name = ing?.original || ing?.name;
      if (name) addGroceryItem(name);
    });
  };

  return (
    <article>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>{recipe.title}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onFav}
            style={{
              borderRadius: 10,
              border: '1px solid #F59E0B66',
              padding: '8px 12px',
              background: isFavorite(recipe.id) ? '#F59E0B' : 'transparent',
              color: isFavorite(recipe.id) ? '#111827' : 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            {isFavorite(recipe.id) ? '★ Favorited' : '☆ Favorite'}
          </button>
          <button
            onClick={addIngredientsToGrocery}
            style={{
              borderRadius: 10,
              border: '1px solid #2563EB66',
              padding: '8px 12px',
              background: '#2563EB',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Add ingredients to Grocery
          </button>
        </div>
      </div>

      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 12, marginTop: 12 }}
        />
      )}

      <section style={{ marginTop: 16 }}>
        <h3>Summary</h3>
        <p style={{ opacity: 0.85 }} dangerouslySetInnerHTML={{ __html: recipe.summary || 'Not available' }} />
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Ingredients</h3>
        <ul>
          {(recipe.extendedIngredients || []).map((ing) => (
            <li key={ing.id || ing.name}>{ing.original || ing.name}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Instructions</h3>
        {recipe.instructions ? (
          <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
        ) : (
          <p>Instructions not available.</p>
        )}
      </section>
    </article>
  );
}
