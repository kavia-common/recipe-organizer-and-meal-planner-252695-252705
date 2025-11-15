# recipe-organizer-and-meal-planner-252695-252705

Environment configuration

- Frontend (React):
  - Uses REACT_APP_API_BASE_URL to reach the backend API.
  - Default is /api which works when the frontend proxies requests to the backend or when the backend is mounted under /api.
  - Copy recipe_frontend/.env.example to recipe_frontend/.env and adjust as needed.

- Backend (FastAPI):
  - Reads SPOONACULAR_API_KEY from environment. This must be set for recipe search/details/nutrition and meal plan endpoints to function.
  - Copy recipe_backend/.env.example to recipe_backend/.env and set SPOONACULAR_API_KEY.

Endpoints expected by the frontend API client:
  GET  /recipes/search?q=...
  GET  /recipes/{id}/details
  GET  /recipes/{id}/nutrition
  POST /mealplan/generate
  POST /mealplan/nutrition
  POST /mealplan/grocery-list

Error handling
- If the backend returns a configuration error (e.g., missing Spoonacular API key), the UI will display a clear message prompting to configure the server.