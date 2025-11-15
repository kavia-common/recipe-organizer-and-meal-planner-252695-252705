# recipe-organizer-and-meal-planner-252695-252705

Environment configuration

- Frontend (React) — Frontend-only Spoonacular integration:
  - The React app now calls Spoonacular directly from the browser.
  - Configure the following env vars in recipe_frontend/.env:
    - REACT_APP_SPOONACULAR_API_KEY=<your key>
    - REACT_APP_SPOONACULAR_BASE_URL=https://api.spoonacular.com (optional; defaults to this)
  - Copy recipe_frontend/.env.example to recipe_frontend/.env and adjust as needed.
  - Warning: Using a public API key in client-side code exposes it to end users. Apply domain restrictions and monitor usage.

- Backend (FastAPI):
  - Previously used as a proxy. The frontend no longer relies on it for search/details/nutrition/meal plan generation.

Endpoints used by the frontend (Spoonacular):
  GET  /recipes/complexSearch?query=...
  GET  /recipes/{id}/information
  GET  /recipes/{id}/nutritionWidget.json
  GET  /mealplanner/generate?timeFrame=...

Error handling
- The UI surfaces clear messages for rate-limit (429) and quota (402) responses from Spoonacular, as well as timeout errors.