import { apiClient } from '../services/apiClient';

// Ensure environment variable for test
const ORIGINAL_ENV = process.env;

describe('apiClient - auth append and errors', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, REACT_APP_SPOONACULAR_API_KEY: 'test-key', REACT_APP_SPOONACULAR_BASE_URL: 'https://api.spoonacular.com' };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('appends apiKey query param to search requests', async () => {
    // Arrange mock fetch to capture URL
    global.fetch.mockImplementation(async (url) => {
      const u = new URL(url);
      const key = u.searchParams.get('apiKey');
      // Return minimal ok response
      return {
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ results: [], echoedKey: key })
      };
    });

    // Act
    const result = await apiClient.searchRecipes('pasta');

    // Assert
    expect(result.echoedKey).toBe('test-key');
    expect(global.fetch).toHaveBeenCalled();
    const calledUrl = new URL(global.fetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('apiKey')).toBe('test-key');
  });

  it('provides friendly message for 401', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Unauthorized' })
    });

    await expect(apiClient.searchRecipes('pasta')).rejects.toThrow(/not authorized/i);
  });
});
