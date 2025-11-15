# recipe-organizer-and-meal-planner-252695-252705

Environment configuration

- Frontend (React) — Frontend-only TheMealDB integration (no API key required):
  - The React app calls TheMealDB from the browser through a CORS-safe proxy by default.
  - Env vars in recipe_frontend/.env:
    - REACT_APP_MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1 (defaults to this)
    - REACT_APP_CORS_PROXY=https://corsproxy.io/? (defaults to this; set to empty string to disable proxy)
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
- If requests fail due to CORS or proxy health, the UI suggests checking the configured CORS proxy and shows the last proxied URL in development.