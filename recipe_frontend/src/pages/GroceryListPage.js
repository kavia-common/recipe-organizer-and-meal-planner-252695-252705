import React, { useState } from 'react';
import { useApp } from '../state/AppContext';

// PUBLIC_INTERFACE
export default function GroceryListPage() {
  const { groceryItems, addGroceryItem, toggleGroceryItem, removeGroceryItem } = useApp();
  const [text, setText] = useState('');

  const addItem = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addGroceryItem(text.trim());
    setText('');
  };

  return (
    <section>
      <h1 style={{ margin: 0 }}>Grocery List</h1>
      <p style={{ marginTop: 6, opacity: 0.75 }}>
        Track ingredients to buy. Check items off as you shop.
      </p>

      <form onSubmit={addItem} style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add item (e.g., 2x tomatoes)"
          aria-label="Grocery item"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }}
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
          Add
        </button>
      </form>

      <ul style={{ marginTop: 18, listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
        {groceryItems.map((i) => (
          <li
            key={i.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 12
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <input
                type="checkbox"
                checked={i.done}
                onChange={() => toggleGroceryItem(i.id)}
                aria-label={`Mark ${i.text} ${i.done ? 'not done' : 'done'}`}
              />
              <span style={{ textDecoration: i.done ? 'line-through' : 'none', opacity: i.done ? 0.6 : 1 }}>
                {i.text}
              </span>
            </label>
            <button
              onClick={() => removeGroceryItem(i.id)}
              aria-label="Remove item"
              style={{
                borderRadius: 10,
                border: '1px solid #EF444466',
                color: '#EF4444',
                background: 'transparent',
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </li>
        ))}
        {groceryItems.length === 0 && <p>No items yet.</p>}
      </ul>
    </section>
  );
}
