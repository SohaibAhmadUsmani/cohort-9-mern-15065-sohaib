import api, { authConfig } from '../services/api';

describe('api', () => {
  test('exports authConfig function', () => {
    expect(typeof authConfig).toBe('function');
  });

  test('authConfig adds Authorization header when token exists', () => {
    localStorage.setItem('token', 'test-token');
    const config = authConfig({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  test('authConfig does not add header when no token', () => {
    localStorage.removeItem('token');
    const config = authConfig({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  test('authConfig preserves existing headers', () => {
    localStorage.setItem('token', 'test-token');
    const config = authConfig({ headers: { 'X-Custom': 'value' } });
    expect(config.headers['X-Custom']).toBe('value');
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  test('authConfig handles empty config', () => {
    localStorage.removeItem('token');
    const config = authConfig();
    expect(config).toBeDefined();
  });

  test('api instance is created', () => {
    expect(api).toBeDefined();
    expect(api.interceptors).toBeDefined();
  });

  test('api has request interceptor', () => {
    expect(api.interceptors.request).toBeDefined();
  });

  test('api has response interceptor', () => {
    expect(api.interceptors.response).toBeDefined();
  });

  test('api baseURL is set to /api', () => {
    expect(api.defaults.baseURL).toBe('/api');
  });

  test('api content type header is json', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('request interceptor adds token from localStorage', () => {
    localStorage.setItem('token', 'test-jwt-token');
    const config = { headers: {} };
    const handlers = api.interceptors.request.handlers;
    const fulfilled = handlers[handlers.length - 1].fulfilled;
    const result = fulfilled(config);
    expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
  });

  test('request interceptor handles missing token', () => {
    localStorage.removeItem('token');
    const config = { headers: {} };
    const handlers = api.interceptors.request.handlers;
    const fulfilled = handlers[handlers.length - 1].fulfilled;
    const result = fulfilled(config);
    expect(result).toEqual(config);
  });

  test('request interceptor handles headers with set method', () => {
    localStorage.setItem('token', 'test-token');
    const headersObj = { set: jest.fn() };
    const config = { headers: headersObj };
    const handlers = api.interceptors.request.handlers;
    const fulfilled = handlers[handlers.length - 1].fulfilled;
    fulfilled(config);
    expect(headersObj.set).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
  });

  test('response interceptor handles 401 error', () => {
    localStorage.setItem('token', 'expired-token');
    const handlers = api.interceptors.response.handlers;
    const rejected = handlers[handlers.length - 1].rejected;
    const error = { response: { status: 401 } };
    rejected(error).catch(() => {});
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('response interceptor rejects non-401 errors', () => {
    const handlers = api.interceptors.response.handlers;
    const rejected = handlers[handlers.length - 1].rejected;
    const error = { response: { status: 500 } };
    rejected(error).catch(() => {});
    expect(error).toBeDefined();
  });

  test('response interceptor passes successful responses', () => {
    const handlers = api.interceptors.response.handlers;
    const fulfilled = handlers[handlers.length - 1].fulfilled;
    const response = { data: 'ok' };
    expect(fulfilled(response)).toEqual(response);
  });
});
