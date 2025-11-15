const DEFAULT_TIMEOUT_MS = 15000;

function getBaseUrl() {
  // PUBLIC_INTERFACE
  /** Returns API base URL from env or defaults to relative path. */
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  return envUrl && envUrl.trim().length > 0 ? envUrl : '/api';
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal,
      ...options
    });

    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      // Avoid leaking sensitive info, standardize error
      const msg = typeof body === 'object' && body && body.detail ? body.detail : res.statusText;
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
    return request(`/recipes/${encodeURIComponent(id)}`);
  },

  /** Placeholder for nutrition endpoint if available later */
  async getNutrition(id) {
    return request(`/recipes/${encodeURIComponent(id)}/nutrition`);
  }
};
