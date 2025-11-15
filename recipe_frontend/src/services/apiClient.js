const DEFAULT_TIMEOUT_MS = 15000;
const MAX_AUTH_RETRY = 1;

/**
 * PUBLIC_INTERFACE
 * Resolve Spoonacular base URL and API key from env vars:
 * - REACT_APP_SPOONACULAR_BASE_URL (default https://api.spoonacular.com)
 * - REACT_APP_SPOONACULAR_API_KEY (required for real calls)
 * Trims trailing slashes to avoid double slashes.
 */
function getSpoonacularConfig() {
  const base = (process.env.REACT_APP_SPOONACULAR_BASE_URL || 'https://api.spoonacular.com').trim();
  const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
  const apiKey = (process.env.REACT_APP_SPOONACULAR_API_KEY || '').trim();
  return { baseUrl, apiKey };
}

/**
 * PUBLIC_INTERFACE
 * Returns non-secret diagnostics about auth config for use in UI.
 * - hasKey: boolean (true if key string is non-empty)
 * - baseUrl: resolved base URL
 */
// PUBLIC_INTERFACE
export function getAuthStatus() {
  const { baseUrl, apiKey } = getSpoonacularConfig();
  return {
    hasKey: Boolean(apiKey),
    baseUrl
  };
}

/**
 * Build a URL with query params including apiKey injection.
 * Never logs or hardcodes secrets; reads from env at build time.
 */
function buildUrl(path, params = {}) {
  const { baseUrl, apiKey } = getSpoonacularConfig();
  const url = new URL(`${baseUrl}${path}`);
  const qp = new URLSearchParams(params);
  if (apiKey) {
    qp.set('apiKey', apiKey); // per Spoonacular spec supports apiKey as query param
  }
  // Append query params
  qp.forEach((v, k) => url.searchParams.set(k, v));
  return url.toString();
}

/**
 * Normalize Spoonacular errors and provide friendly messages including 401/403/402/429 handling.
 * Adds guidance link for auth-related statuses.
 */
function normalizeError(res, body, isJson) {
  let msg = res.statusText || 'Request failed';
  if (res.status === 401 || res.status === 403) {
    msg =
      'You are not authorized. Please verify your Spoonacular API key or account permissions. ' +
      'See docs: https://spoonacular.com/food-api/console#Authentication';
  } else if (res.status === 429) {
    msg = 'Rate limit exceeded. Please wait a moment and try again.';
  } else if (res.status === 402) {
    msg = 'API quota exceeded or plan limit reached.';
  } else if (isJson && body) {
    if (typeof body.message === 'string') msg = body.message;
    else if (typeof body.status === 'string') msg = body.status;
  } else if (typeof body === 'string' && body.trim()) {
    msg = body.trim();
  }
  return msg;
}

/**
 * Make a JSON request with timeout and consistent error handling against Spoonacular.
 * Includes optional single retry on 401/403 to guard against transient issues.
 */
async function requestJson(path, { method = 'GET', params = {}, headers = {}, body } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const doFetch = async () => {
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = normalizeError(res, data, isJson);
      const err = new Error(msg || 'Request failed');
      err.status = res.status;
      err.response = res;
      throw err;
    }
    return data;
  };

  try {
    try {
      return await doFetch();
    } catch (e) {
      // Optional retry for 401/403 once
      if ((e.status === 401 || e.status === 403) && MAX_AUTH_RETRY > 0) {
        return await doFetch();
      }
      throw e;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    // If API key is missing, give a clearer client-side hint
    const { apiKey } = getSpoonacularConfig();
    if (!apiKey) {
      throw new Error(
        'Missing REACT_APP_SPOONACULAR_API_KEY. Set it in recipe_frontend/.env. ' +
          'See https://spoonacular.com/food-api/console#Authentication'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Map client-facing parameters to Spoonacular endpoints.
 * Docs: https://spoonacular.com/food-api
 */
function mapSearchParams(query, options = {}) {
  const p = {
    query: String(query || '').trim(),
    number: options.number || 10,
    addRecipeInformation: 'true' // to include summary/title/images in one call
  };
  if (options.diet) p.diet = options.diet;
  if (options.cuisine) p.cuisine = options.cuisine;
  if (options.intolerances) p.intolerances = options.intolerances;
  return p;
}

function mapMealPlanParams(options = {}) {
  const p = {
    timeFrame: options.timeFrame || 'day'
  };
  if (options.targetCalories) p.targetCalories = options.targetCalories;
  if (options.diet) p.diet = options.diet;
  if (options.exclude) p.exclude = options.exclude; // comma-separated
  return p;
}

// PUBLIC_INTERFACE
export const apiClient = {
  /**
   * Search recipes using Spoonacular complexSearch.
   * Returns Spoonacular payload { results: [...], offset, number, totalResults }
   */
  async searchRecipes(query, options = {}) {
    const params = mapSearchParams(query, options);
    return requestJson('/recipes/complexSearch', { params });
  },

  /**
   * Get detailed recipe information by ID.
   * includeNutrition=false by default to keep payload smaller.
   */
  async getRecipeDetails(id, includeNutrition = false) {
    const safeId = encodeURIComponent(id);
    return requestJson(`/recipes/${safeId}/information`, {
      params: includeNutrition ? { includeNutrition: 'true' } : {}
    });
  },

  /**
   * Get nutrition widget JSON for a recipe ID.
   * Endpoint: /recipes/{id}/nutritionWidget.json
   */
  async getNutrition(id) {
    const safeId = encodeURIComponent(id);
    return requestJson(`/recipes/${safeId}/nutritionWidget.json`);
  },

  /**
   * Generate a meal plan using Spoonacular mealplanner generate endpoint.
   * Options: { timeFrame: 'day'|'week', targetCalories?, diet?, exclude? }
   */
  async generateMealPlan(options = {}) {
    const params = mapMealPlanParams(options);
    return requestJson('/mealplanner/generate', { params });
  },

  /**
   * Client-only helpers retained for UI compatibility.
   * Since Spoonacular does not provide "aggregate meal plan nutrition" or "grocery list" from arbitrary items
   * via a single endpoint without user account context, these are left as client utilities or future work.
   * Here we provide no-op implementations returning derived placeholders to avoid breaking UI.
   */
  async getMealPlanNutrition(mealPlan = {}) {
    // Derive a simple placeholder: sum of calories if present
    try {
      const items = mealPlan?.items || [];
      const totalCalories = items.reduce((acc, it) => acc + (it.nutrition?.calories || 0), 0);
      return { calories: totalCalories };
    } catch {
      return { calories: 0 };
    }
  },

  async getGroceryList(mealPlan = {}) {
    // Derive basic list from items' ingredients if present
    const items = mealPlan?.items || [];
    const list = [];
    items.forEach((it) => {
      const ings = it.recipe?.extendedIngredients || [];
      ings.forEach((ing) => {
        const name = ing.original || ing.name;
        if (name) list.push(name);
      });
    });
    return { items: list };
  }
};
