import { apiClient, getAuthStatus } from '../services/apiClient';

describe('apiClient hardening - base URL and timeout', () => {
  const ORIGINAL_ENV = process.env;
  let originalFetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV }; // no REACT_APP_MEALDB_BASE_URL set -> default used
    originalFetch = global.fetch;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    global.fetch = originalFetch;
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('resolves default base URL when env is missing', () => {
    const status = getAuthStatus();
    expect(status.baseUrl).toBe('https://www.themealdb.com/api/json/v1/1');
  });

  it('healthCheck handles network error and returns ok=false', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    const res = await apiClient.healthCheck();
    expect(res.ok).toBe(false);
  });

  it('request timeout shows friendly message via searchRecipes with retry exhausted', async () => {
    jest.useFakeTimers();
    // Mock fetch that never resolves to trigger timeout twice
    global.fetch = jest.fn(() => new Promise(() => {}));

    const p = apiClient.searchRecipes('pasta');
    // advance timers enough to trigger both attempts timeouts
    jest.advanceTimersByTime(16000);
    // give the promise microtask a tick
    await Promise.resolve();

    await expect(p).rejects.toThrow(/timed out|Please try again/i);
  });
});
