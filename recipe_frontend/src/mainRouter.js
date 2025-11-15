import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { AppProvider } from './state/AppContext';
import SearchPage from './pages/SearchPage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import MealPlansPage from './pages/MealPlansPage';
import GroceryListPage from './pages/GroceryListPage';

/**
 * PUBLIC_INTERFACE
 * Provides the application router with all routes and global AppProvider.
 */
export default function MainRouter() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <SearchPage /> },
        { path: 'recipe/:id', element: <RecipeDetailsPage /> },
        { path: 'favorites', element: <FavoritesPage /> },
        { path: 'meal-plans', element: <MealPlansPage /> },
        { path: 'grocery-list', element: <GroceryListPage /> }
      ]
    }
  ]);

  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
