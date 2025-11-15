const DEFAULT_TIMEOUT_MS = 15000;

/**
 * PUBLIC_INTERFACE
 * Resolve API base URL from env var REACT_APP_API_BASE_URL.
 * - If not set, default to '/api' (works when frontend is reverse-proxying to backend).
 * - Trims trailing slashes to avoid double slashes in requests.
 */
function getBaseUrl() {
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  const base = envUrl && envUrl.trim().length > 0 ? envUrl.trim() : '/api';
  // Normalize: remove trailing slash to keep request() concatenation clean
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

/**
 * Make a JSON request with timeout and consistent error handling.
 * - Parses JSON responses when possible
 * - Surfaces backend configuration errors clearly (e.g., missing Spoonacular API key)
 */
async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const url = `${getBaseUrl()}${path}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal,
      ...options
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      // Prefer structured error messages from backend
      let msg = res.statusText || 'Request failed';
      if (isJson && body) {
        // Common FastAPI patterns: {detail: "..."} or {error: {...}} or {message: "..."}
        if (typeof body.detail === 'string') msg = body.detail;
        else if (Array.isArray(body.detail)) msg = body.detail.map((d) => d.msg || d).join(', ');
        else if (body.message) msg = body.message;
        else if (body.error && (body.error.message || body.error.code)) {
          msg = body.error.message || `Error: ${body.error.code}`;
        }
      } else if (typeof body === 'string' && body.trim()) {
        msg = body.trim();
      }

      // Friendly hint for common configuration error from backend
      if (msg && /spoonacular/i.test(msg) && /api key|apikey|configuration/i.test(msg)) {
        msg = `Backend configuration error: ${msg}. Please set the Spoonacular API key on the server.`;
      }

      throw new Error(msg || 'Request failed');
    }
    return body;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// PUBLIC_INTERFACE
export const apiClient = {
  /** Search recipes via backend proxy to Spoonacular or internal search */
  async searchRecipes(query) {
    const q = encodeURIComponent(query || '');
    return request(`/recipes/search?q=${q}`);
  },

  /** Fetch recipe details by id */
  async getRecipeDetails(id) {
    return request(`/recipes/${encodeURIComponent(id)}/details`);
  },

  /** Fetch nutrition for a recipe by id */
  async getNutrition(id) {
    return request(`/recipes/${encodeURIComponent(id)}/nutrition`);
  },

  /** Generate a meal plan for given params (e.g., targetCalories, diet) */
  async generateMealPlan(params = {}) {
    return request(`/mealplan/generate`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  /** Get aggregate nutrition for a provided meal plan object */
  async getMealPlanNutrition(mealPlan = {}) {
    return request(`/mealplan/nutrition`, {
      method: 'POST',
      body: JSON.stringify(mealPlan)
    });
  },

  /** Generate grocery list from a provided meal plan object */
  async getGroceryList(mealPlan = {}) {
    return request(`/mealplan/grocery-list`, {
      method: 'POST',
      body: JSON.stringify(mealPlan)
    });
  }
};
