import { apiClient } from '../services/apiClient';

const ORIGINAL_ENV = process.env;

describe('apiClient - TheMealDB basics', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, REACT_APP_MEALDB_BASE_URL: 'https://www.themealdb.com/api/json/v1/1' };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('calls search endpoint without apiKey and maps meals to results', async () => {
    global.fetch.mockImplementation(async (url) => {
      const u = new URL(url);
      expect(u.pathname.endsWith('/search.php')).toBe(true);
      expect(u.searchParams.get('s')).toBe('pasta');
      expect(u.searchParams.get('apiKey')).toBeNull(); // no key
      return {
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          meals: [
            { idMeal: '101', strMeal: 'Pasta Primavera', strMealThumb: 'img' }
          ]
        })
      };
    });

    const result = await apiClient.searchRecipes('pasta');
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results[0].id).toBe('101');
    expect(result.results[0].title).toBe('Pasta Primavera');
  });

  it('handles no results (meals: null) gracefully', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ meals: null })
    });
    const result = await apiClient.searchRecipes('xyz-not-found');
    expect(result.results).toEqual([]);
  });
});
