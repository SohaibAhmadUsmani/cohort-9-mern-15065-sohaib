import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../services/api';

jest.mock('../services/api');

function TestComponent() {
  const { user, loading, login, signup, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <button onClick={() => login('a@b.com', '123456').catch(() => {})}>login</button>
      <button onClick={() => signup('Test', 'a@b.com', '123456').catch(() => {})}>signup</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('AuthContext', () => {
  test('starts with loading true then false when no token', async () => {
    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  test('fetches user profile when token exists', async () => {
    localStorage.setItem('token', 'fake-token');
    api.get.mockResolvedValue({ data: { user: { name: 'Alice' } } });

    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    expect(screen.getByTestId('user').textContent).toBe('Alice');
  });

  test('login stores token and sets user', async () => {
    api.post.mockResolvedValue({ data: { token: 'new-token' } });
    api.get.mockResolvedValue({ data: { user: { name: 'Bob' } } });

    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    await act(async () => {
      screen.getByText('login').click();
    });
    expect(screen.getByTestId('user').textContent).toBe('Bob');
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  test('signup stores token and sets user', async () => {
    api.post.mockResolvedValue({ data: { token: 'signup-token' } });
    api.get.mockResolvedValue({ data: { user: { name: 'Carol' } } });

    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    await act(async () => {
      screen.getByText('signup').click();
    });
    expect(screen.getByTestId('user').textContent).toBe('Carol');
    expect(localStorage.getItem('token')).toBe('signup-token');
  });

  test('logout clears token and user', async () => {
    localStorage.setItem('token', 'some-token');
    api.get.mockResolvedValue({ data: { user: { name: 'Dave' } } });

    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    expect(screen.getByTestId('user').textContent).toBe('Dave');

    await act(async () => {
      screen.getByText('logout').click();
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('clears token on invalid token', async () => {
    localStorage.setItem('token', 'bad-token');
    api.get.mockRejectedValue(new Error('Unauthorized'));

    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('login does not set user on API error', async () => {
    api.get.mockResolvedValue({ data: { user: null } });
    api.post.mockRejectedValue(new Error('Invalid credentials'));

    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });

    await act(async () => {
      screen.getByText('login').click();
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
  });
});
