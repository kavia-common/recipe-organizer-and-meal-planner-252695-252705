import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LS_KEYS = {
  favorites: 'app_favorites_v1',
  mealPlans: 'app_meal_plans_v1',
  grocery: 'app_grocery_v1'
};

const AppContext = createContext(null);

/**
 * Safely parse JSON from localStorage, returning a fallback on failure.
 */
function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// PUBLIC_INTERFACE
export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState(() => safeRead(LS_KEYS.favorites, []));
  const [mealPlans, setMealPlans] = useState(() => safeRead(LS_KEYS.mealPlans, []));
  const [groceryItems, setGroceryItems] = useState(() => safeRead(LS_KEYS.grocery, []));

  useEffect(() => safeWrite(LS_KEYS.favorites, favorites), [favorites]);
  useEffect(() => safeWrite(LS_KEYS.mealPlans, mealPlans), [mealPlans]);
  useEffect(() => safeWrite(LS_KEYS.grocery, groceryItems), [groceryItems]);

  // PUBLIC_INTERFACE
  const addFavorite = useCallback((recipe) => {
    setFavorites((prev) => (prev.find((r) => r.id === recipe.id) ? prev : [...prev, recipe]));
  }, []);

  // PUBLIC_INTERFACE
  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // PUBLIC_INTERFACE
  const isFavorite = useCallback((id) => {
    return favorites.some((r) => r.id === id);
  }, [favorites]);

  // PUBLIC_INTERFACE
  const addMealPlan = useCallback((plan) => {
    // plan: { id, title, items: [{recipe, date}] }
    setMealPlans((prev) => [...prev, { ...plan, id: plan.id || `plan_${Date.now()}` }]);
  }, []);

  // PUBLIC_INTERFACE
  const removeMealPlan = useCallback((id) => {
    setMealPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // PUBLIC_INTERFACE
  const addGroceryItem = useCallback((text) => {
    if (!text || !text.trim()) return;
    setGroceryItems((prev) => [...prev, { id: `item_${Date.now()}`, text: text.trim(), done: false }]);
  }, []);

  // PUBLIC_INTERFACE
  const toggleGroceryItem = useCallback((id) => {
    setGroceryItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  }, []);

  // PUBLIC_INTERFACE
  const removeGroceryItem = useCallback((id) => {
    setGroceryItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      mealPlans,
      addMealPlan,
      removeMealPlan,
      groceryItems,
      addGroceryItem,
      toggleGroceryItem,
      removeGroceryItem
    }),
    [
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      mealPlans,
      addMealPlan,
      removeMealPlan,
      groceryItems,
      addGroceryItem,
      toggleGroceryItem,
      removeGroceryItem
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// PUBLIC_INTERFACE
export function useApp() {
  /** Hook to access global app state and actions. */
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
