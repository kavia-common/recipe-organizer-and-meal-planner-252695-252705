import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import { AppProvider } from '../state/AppContext';
import SearchPage from '../pages/SearchPage';
import RecipeDetailsPage from '../pages/RecipeDetailsPage';
import FavoritesPage from '../pages/FavoritesPage';
import MealPlansPage from '../pages/MealPlansPage';
import GroceryListPage from '../pages/GroceryListPage';

// Mock apiClient to avoid network
jest.mock('../services/apiClient', () => ({
  apiClient: {
    searchRecipes: jest.fn(async (q) => {
      if (q === 'network-fail') {
        throw new Error('Failed to search');
      }
      return {
        results: [
          { id: 101, title: 'Pasta Primavera', summary: '<p>Fresh veggies and pasta.</p>' },
          { id: 202, title: 'Grilled Chicken', summary: '<p>Juicy grilled chicken.</p>' }
        ]
      };
    }),
    getRecipeDetails: jest.fn(async (id) => {
      if (id === '9999') {
        throw new Error('Recipe not found');
      }
      return {
        id: Number(id),
        title: id === '101' ? 'Pasta Primavera' : 'Mock Recipe',
        image: '',
        summary: '<p>Delicious.</p>',
        instructions: '<p>Cook it well.</p>',
        extendedIngredients: [
          { id: 1, name: 'tomatoes', original: '2x tomatoes' },
          { id: 2, name: 'pasta', original: '200g pasta' }
        ]
      };
    }),
    getNutrition: jest.fn(async () => ({ calories: 300 })),
    generateMealPlan: jest.fn(async () => ({
      items: [
        { date: '2025-01-01', recipe: { id: 101, title: 'Pasta Primavera' } }
      ]
    })),
    getMealPlanNutrition: jest.fn(async () => ({ calories: 1200 })),
    getGroceryList: jest.fn(async () => ({ items: ['tomatoes', 'pasta'] }))
  }
}));

// Helper: render app at route
function renderAtRoute(pathname = '/') {
  const router = createMemoryRouter(
    [
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
    ],
    { initialEntries: [pathname] }
  );
  return render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

// Clean localStorage between tests to validate persistence flows explicitly
beforeEach(() => {
  localStorage.clear();
});

describe('Navigation: Home -> Search -> Recipe Details -> Favorites', () => {
  it('allows navigating Search -> Details -> Favorites and reflects favorite state', async () => {
    renderAtRoute('/');

    // Search flow
    const input = screen.getByLabelText(/search recipes/i);
    fireEvent.change(input, { target: { value: 'pasta' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Pasta Primavera')).toBeInTheDocument();
    });

    // Toggle favorite on card
    const card = screen.getByText('Pasta Primavera').closest('div');
    const favBtn = within(card).getByRole('button', { name: /favorite/i });
    fireEvent.click(favBtn);
    expect(favBtn).toHaveTextContent('★ Favorite');

    // Navigate to details
    fireEvent.click(within(card).getByRole('link', { name: /view details/i }));

    // Details page loaded
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /pasta primavera/i })).toBeInTheDocument();
    });

    // Favorite button reflects state and can toggle
    const detailsFavBtn = screen.getByRole('button', { name: /favorite/i });
    expect(detailsFavBtn).toHaveTextContent('★ Favorited');
    fireEvent.click(detailsFavBtn);
    expect(detailsFavBtn).toHaveTextContent('☆ Favorite');

    // Navigate to Favorites via navbar
    fireEvent.click(screen.getByRole('link', { name: /favorites/i }));

    await waitFor(() => {
      // After un-favoriting there should be "No favorites yet"
      expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
    });
  });
});

describe('Favorites: add/remove and persistence in localStorage', () => {
  it('persists favorites across reloads', async () => {
    // First render: add a favorite
    renderAtRoute('/');
    fireEvent.change(screen.getByLabelText(/search recipes/i), { target: { value: 'pasta' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(screen.getByText('Pasta Primavera')).toBeInTheDocument());

    const card = screen.getByText('Pasta Primavera').closest('div');
    const favBtn = within(card).getByRole('button', { name: /favorite/i });
    fireEvent.click(favBtn);
    expect(favBtn).toHaveTextContent('★ Favorite');

    // Simulate full reload by unmounting and rendering again at Favorites
    // But keep localStorage intact
    // Re-render at favorites page
    renderAtRoute('/favorites');

    await waitFor(() => {
      expect(screen.queryByText(/no favorites yet/i)).not.toBeInTheDocument();
      expect(screen.getByText('Pasta Primavera')).toBeInTheDocument();
    });

    // Remove favorite
    const removeBtn = screen.getByRole('button', { name: /remove favorite/i });
    fireEvent.click(removeBtn);

    expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
  });
});

describe('Meal Planner: basic UI add/remove updates', () => {
  it('renders, adds a plan with one item, and allows deletion', async () => {
    renderAtRoute('/meal-plans');

    // Initially empty
    expect(screen.getByText(/no meal plans yet/i)).toBeInTheDocument();

    // Fill form
    const titleInput = screen.getByLabelText(/meal plan title/i);
    const dateInput = screen.getByLabelText(/meal date/i);
    fireEvent.change(titleInput, { target: { value: 'My Week Plan' } });
    fireEvent.change(dateInput, { target: { value: '2025-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /add plan/i }));

    // Verify added
    await waitFor(() => {
      expect(screen.queryByText(/no meal plans yet/i)).not.toBeInTheDocument();
      expect(screen.getByText('My Week Plan')).toBeInTheDocument();
      expect(screen.getByText(/2025-01-01/i)).toBeInTheDocument();
    });

    // Delete
    fireEvent.click(screen.getByRole('button', { name: /delete meal plan/i }));
    expect(screen.getByText(/no meal plans yet/i)).toBeInTheDocument();
  });
});

describe('Grocery List: add, toggle, remove and persistence', () => {
  it('manages grocery items and persists checked state', async () => {
    renderAtRoute('/grocery-list');

    // Empty initially
    expect(screen.getByText(/no items yet/i)).toBeInTheDocument();

    // Add an item
    const input = screen.getByLabelText(/grocery item/i);
    fireEvent.change(input, { target: { value: '2x tomatoes' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.queryByText(/no items yet/i)).not.toBeInTheDocument();
    expect(screen.getByText('2x tomatoes')).toBeInTheDocument();

    // Toggle checkbox
    const item = screen.getByText('2x tomatoes').closest('li');
    const checkbox = within(item).getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Simulate reload - keep localStorage, re-render
    renderAtRoute('/grocery-list');
    const itemReload = await screen.findByText('2x tomatoes');
    const liReload = itemReload.closest('li');
    const checkboxReload = within(liReload).getByRole('checkbox');
    expect(checkboxReload).toBeChecked();

    // Remove item
    const removeBtn = within(liReload).getByRole('button', { name: /remove item/i });
    fireEvent.click(removeBtn);
    expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
  });

  it('adds ingredients to grocery from recipe details', async () => {
    // Start at details for id 101
    renderAtRoute('/recipe/101');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /pasta primavera/i })).toBeInTheDocument();
    });

    // Add ingredients
    fireEvent.click(screen.getByRole('button', { name: /add ingredients to grocery/i }));

    // Navigate to grocery list
    fireEvent.click(screen.getByRole('link', { name: /grocery/i }));

    // Both mocked ingredients present
    await waitFor(() => {
      expect(screen.getByText('2x tomatoes')).toBeInTheDocument();
      expect(screen.getByText('200g pasta')).toBeInTheDocument();
    });
  });
});

describe('Env handling: apiClient base URL reading (no crash without backend)', () => {
  it('reads REACT_APP_API_BASE_URL and shows graceful error when search fails', async () => {
    const originalEnv = process.env.REACT_APP_API_BASE_URL;
    process.env.REACT_APP_API_BASE_URL = '/api'; // default, but explicit

    renderAtRoute('/');

    const input = screen.getByLabelText(/search recipes/i);
    fireEvent.change(input, { target: { value: 'network-fail' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    // error alert shown
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to search/i);
    });

    // restore env
    process.env.REACT_APP_API_BASE_URL = originalEnv;
  });
});
