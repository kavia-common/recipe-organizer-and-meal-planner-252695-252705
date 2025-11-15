import React, { useState } from 'react';
import { useApp } from '../state/AppContext';

// PUBLIC_INTERFACE
export default function MealPlansPage() {
  const { mealPlans, addMealPlan, removeMealPlan } = useApp();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const createPlan = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    addMealPlan({
      title: title.trim(),
      items: [{ date, recipe: { id: `custom_${Date.now()}`, title: title.trim() } }]
    });
    setTitle('');
    setDate('');
  };

  return (
    <section>
      <h1 style={{ margin: 0 }}>Meal Plans</h1>
      <p style={{ marginTop: 6, opacity: 0.75 }}>Organize your upcoming meals.</p>

      <form onSubmit={createPlan} style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meal plan title"
          aria-label="Meal plan title"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Meal date"
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
        />
        <button
          type="submit"
          style={{
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          Add plan
        </button>
      </form>

      <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
        {mealPlans.map((p) => (
          <div
            key={p.id}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{p.title}</strong>
              <button
                onClick={() => removeMealPlan(p.id)}
                aria-label="Delete meal plan"
                style={{
                  borderRadius: 10,
                  border: '1px solid #EF444466',
                  color: '#EF4444',
                  background: 'transparent',
                  padding: '6px 10px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
            <ul style={{ marginTop: 10 }}>
              {(p.items || []).map((it, idx) => (
                <li key={idx}>
                  {it.date} — {it.recipe?.title || 'Recipe'}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {mealPlans.length === 0 && <p>No meal plans yet.</p>}
      </div>
    </section>
  );
}
