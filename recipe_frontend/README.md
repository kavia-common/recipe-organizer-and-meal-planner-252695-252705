# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## TheMealDB Frontend-only Integration (No API Key)

This app calls TheMealDB API directly from the browser.

Due to CORS restrictions, direct browser calls to TheMealDB can fail. We route requests through a CORS-safe proxy by default.

Environment variables (create `recipe_frontend/.env` from `.env.example`):
- REACT_APP_MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1
- REACT_APP_CORS_PROXY=https://corsproxy.io/?   (default; set to empty string to disable)

Notes:
- No API key is required for TheMealDB.
- CORS Proxy behavior:
  - Default proxy is https://corsproxy.io/?
  - Override with REACT_APP_CORS_PROXY.
  - To disable proxy (e.g., in environments with managed CORS), set REACT_APP_CORS_PROXY="" in `.env`.
- Diagnostics (development only) show:
  - Base URL, CORS proxy, last proxied URL, and last error URL.

Endpoints used:
- GET /search.php?s={query}
- GET /lookup.php?i={id}
- GET /filter.php?c={category}
- GET /filter.php?a={area}
- GET /random.php

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

In CI, run with:
CI=true npm test -- --watchAll=false

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Troubleshooting CORS

- If searches or details fail with "Failed to fetch" or CORS messages:
  - Ensure you are online.
  - Check the diagnostics banner (dev) for the configured CORS proxy and the last proxied URL.
  - Try a different proxy via REACT_APP_CORS_PROXY.
  - To bypass proxy entirely (if your environment injects CORS headers), set `REACT_APP_CORS_PROXY=""`.

## Customization

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

To adjust colors, see CSS variables in `src/App.css`.

## Learn More

- React documentation: https://reactjs.org/
- TheMealDB API: https://www.themealdb.com/api.php
