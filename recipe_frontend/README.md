# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Spoonacular Frontend-only Integration

This app calls the Spoonacular API directly from the browser.

Required environment variables (create `recipe_frontend/.env` from `.env.example`):
- REACT_APP_SPOONACULAR_API_KEY=<your key>
- REACT_APP_SPOONACULAR_BASE_URL=https://api.spoonacular.com (optional)

Security note:
- Client-side API keys are visible to users. Configure domain restrictions in your Spoonacular account, use rate limiting/monitoring, and consider a backend proxy for production environments handling sensitive logic.

Primary endpoints used:
- GET /recipes/complexSearch
- GET /recipes/{id}/information
- GET /recipes/{id}/nutritionWidget.json
- GET /mealplanner/generate

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

## Customization

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

To adjust colors, see CSS variables in `src/App.css`.

## Learn More

- React documentation: https://reactjs.org/
- Spoonacular Food API: https://spoonacular.com/food-api
