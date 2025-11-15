const DEFAULT_TIMEOUT_MS = 15000;

/**
 * PUBLIC_INTERFACE
 * Resolve TheMealDB base URL from env vars:
 * - REACT_APP_MEALDB_BASE_URL (default https://www.themealdb.com/api/json/v1/1)
 * Trims trailing slashes to avoid double slashes.
 */
function getMealDbConfig() {
  const base =
    (process.env.REACT_APP_MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1/1').trim();
  const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
  return { baseUrl };
}

/**
 * PUBLIC_INTERFACE
 * Returns non-secret diagnostics about API config for use in UI.
 * - hasKey: always false (no key needed)
 * - baseUrl: resolved base URL
 */
// PUBLIC_INTERFACE
export function getAuthStatus() {
  const { baseUrl } = getMealDbConfig();
  return {
    hasKey: false,
    baseUrl
  };
}

/**
 * Build a URL with query params for TheMealDB (no auth required).
 */
function buildUrl(path, params = {}) {
  const { baseUrl } = getMealDbConfig();
  const url = new URL(`${baseUrl}${path}`);
  const qp = new URLSearchParams(params);
  qp.forEach((v, k) => url.searchParams.set(k, v));
  return url.toString();
}

/**
 * Normalize errors for TheMealDB simple JSON API.
 */
function normalizeError(res, body, isJson) {
  let msg = res.statusText || 'Request failed';
  if (isJson && body) {
    if (typeof body.error === 'string') msg = body.error;
    if (body.meals === null) {
      // TheMealDB returns { meals: null } for "no results" with 200 OK.
      msg = 'No results found';
    }
  } else if (typeof body === 'string' && body.trim()) {
    msg = body.trim();
  }
  return msg;
}

/**
 * Perform fetch with timeout; adapt to TheMealDB responses.
 */
async function requestJson(path, { method = 'GET', params = {}, headers = {}, body } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
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
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Helpers to map TheMealDB structure to our app's internal recipe shape
 * Our app expects:
 * - { id, title, image, summary?, instructions?, extendedIngredients? }
 */
function mapMealToRecipe(meal) {
  if (!meal) return null;
  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb || '',
    summary: meal.strCategory ? `Category: ${meal.strCategory}` : '',
    instructions: (meal.strInstructions && `<p>${meal.strInstructions.replace(/\n/g, '<br/>')}</p>`) || '',
    extendedIngredients: extractIngredients(meal)
  };
}

/**
 * Extract ingredient/measure pairs from TheMealDB detail object
 * Fields: strIngredient1..20, strMeasure1..20
 */
function extractIngredients(meal) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const ing = (meal[`strIngredient${i}`] || '').trim();
    const meas = (meal[`strMeasure${i}`] || '').trim();
    if (ing) {
      out.push({
        id: `${meal.idMeal}_${i}`,
        name: ing,
        original: [meas, ing].filter(Boolean).join(' ').trim()
      });
    }
  }
  return out;
}

// PUBLIC_INTERFACE
export const apiClient = {
  /**
   * Search meals by name using TheMealDB: /search.php?s={query}
   * Returns { results: [mapped recipes] }
   */
  async searchRecipes(query) {
    const q = String(query || '').trim();
    const data = await requestJson('/search.php', { params: { s: q } });
    const meals = Array.isArray(data?.meals) ? data.meals : [];
    const results = meals.map(mapMealToRecipe);
    return { results };
  },

  /**
   * Get meal details by ID: /lookup.php?i={id}
   * Returns mapped recipe object
   */
  async getRecipeDetails(id) {
    const data = await requestJson('/lookup.php', { params: { i: id } });
    const meal = Array.isArray(data?.meals) ? data.meals[0] : null;
    if (!meal) {
      throw new Error('Recipe not found');
    }
    return mapMealToRecipe(meal);
  },

  /**
   * There is no nutrition in TheMealDB; return placeholder.
   */
  async getNutrition() {
    return { calories: null, note: 'Nutrition not available for this source.' };
  },

  /**
   * Random meal: /random.php
   * Returns mapped recipe
   */
  async getRandomRecipe() {
    const data = await requestJson('/random.php');
    const meal = Array.isArray(data?.meals) ? data.meals[0] : null;
    if (!meal) throw new Error('No meal found');
    return mapMealToRecipe(meal);
  },

  /**
   * Filter by category: /filter.php?c={category}
   * Note: filter returns reduced fields (idMeal, strMeal, strMealThumb) without instructions/ingredients.
   * We map to our recipe shape with minimal fields.
   */
  async listByCategory(category) {
    const data = await requestJson('/filter.php', { params: { c: category } });
    const meals = Array.isArray(data?.meals) ? data.meals : [];
    return meals.map((m) => ({
      id: m.idMeal,
      title: m.strMeal,
      image: m.strMealThumb || '',
      summary: '',
      instructions: '',
      extendedIngredients: []
    }));
  },

  /**
   * Filter by area: /filter.php?a={area}
   */
  async listByArea(area) {
    const data = await requestJson('/filter.php', { params: { a: area } });
    const meals = Array.isArray(data?.meals) ? data.meals : [];
    return meals.map((m) => ({
      id: m.idMeal,
      title: m.strMeal,
      image: m.strMealThumb || '',
      summary: '',
      instructions: '',
      extendedIngredients: []
    }));
  },

  /**
   * Client-side helpers for meal plan and grocery list generation remain.
   */
  async generateMealPlan() {
    // Client-side: generate a simple plan with one random meal
    const meal = await this.getRandomRecipe();
    return { items: [{ date: new Date().toISOString().slice(0, 10), recipe: meal }] };
  },

  async getMealPlanNutrition(mealPlan = {}) {
    // Not available; return placeholder
    return { calories: null, note: 'Nutrition not available' };
    // Keep shape compatible with callers.
  },

  async getGroceryList(mealPlan = {}) {
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
