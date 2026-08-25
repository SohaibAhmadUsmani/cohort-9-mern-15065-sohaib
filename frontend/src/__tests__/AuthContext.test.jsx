import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../services/api';

jest.mock('../services/api');

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should start with no user when no token', async () => {
    api.get.mockRejectedValue(new Error('No token'));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should load user from token on mount', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { user: { email: 'test@test.com', name: 'Test' } } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.user).toEqual({ email: 'test@test.com', name: 'Test' });
    expect(result.current.loading).toBe(false);
  });

  it('should clear user if token is invalid', async () => {
    localStorage.setItem('token', 'invalid-token');
    api.get.mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should login and set user', async () => {
    api.get.mockResolvedValue({ data: { user: { email: 'login@test.com', name: 'Login User' } } });
    api.post.mockResolvedValue({ data: { token: 'new-token' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('login@test.com', 'password123');
    });

    expect(result.current.user).toEqual({ email: 'login@test.com', name: 'Login User' });
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('should signup and set user', async () => {
    api.get.mockResolvedValue({ data: { user: { email: 'signup@test.com', name: 'Signup User' } } });
    api.post.mockResolvedValue({ data: { token: 'signup-token' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup('Signup User', 'signup@test.com', 'password123');
    });

    expect(result.current.user).toEqual({ email: 'signup@test.com', name: 'Signup User' });
    expect(localStorage.getItem('token')).toBe('signup-token');
  });

  it('should logout and clear user', async () => {
    localStorage.setItem('token', 'some-token');
    api.get.mockResolvedValue({ data: { user: { email: 'test@test.com' } } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
