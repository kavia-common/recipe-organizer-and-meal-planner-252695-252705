# recipe-organizer-and-meal-planner-252695-252705

Environment configuration

- Frontend (React) — Frontend-only TheMealDB integration (no API key required):
  - The React app calls TheMealDB directly from the browser.
  - Optional env var in recipe_frontend/.env:
    - REACT_APP_MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1 (defaults to this)
  - Copy recipe_frontend/.env.example to recipe_frontend/.env and adjust as needed.

- Backend (FastAPI):
  - Previously used as a proxy. The frontend does not rely on it for search/details/nutrition.

Endpoints used by the frontend (TheMealDB):
  GET  /search.php?s={query}
  GET  /lookup.php?i={id}
  GET  /filter.php?c={category}
  GET  /filter.php?a={area}
  GET  /random.php

Error handling
- The UI surfaces clear messages for timeouts and "no results" (TheMealDB returns {meals: null}).