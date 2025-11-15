import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
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
          const lower = String(msg).toLowerCase();
          const authHint = (lower.includes('not authorized') || lower.includes('unauthorized') || lower.includes('forbidden'))
            ? ' Tip: Check your REACT_APP_SPOONACULAR_API_KEY or account usage/limits.'
            : '';
          setErr(`${msg}${authHint}`);
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
    return (
      <div role="alert" style={{ color: '#EF4444' }}>
        <p style={{ margin: 0 }}>{err}</p>
        <p style={{ marginTop: 6 }}>
          Learn more about Spoonacular authentication:&nbsp;
          <a href="https://spoonacular.com/food-api/console#Authentication" target="_blank" rel="noreferrer">Auth docs</a>
        </p>
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
        <p style={{ opacity: 0.85 }} dangerouslySetInnerHTML={{ __html: recipe.summary || 'N/A' }} />
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
