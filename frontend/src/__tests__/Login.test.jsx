import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  authConfig: jest.fn(() => ({})),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('Login', () => {
  test('renders login form with email and password inputs', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders sign in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders welcome back heading', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  test('renders link to signup page', () => {
    renderLogin();
    expect(screen.getByText('Sign up')).toHaveAttribute('href', '/signup');
  });

  test('has required attribute on inputs', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  test('password input has password type', () => {
    renderLogin();
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  test('can type in email field', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    expect(screen.getByLabelText(/email/i).value).toBe('test@test.com');
  });

  test('can type in password field', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByLabelText(/password/i).value).toBe('password123');
  });

  test('form submission calls API', async () => {
    api.post.mockResolvedValue({ data: { token: 'test-token' } });
    api.get.mockResolvedValue({ data: { user: { name: 'Test' } } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await act(async () => {});

    expect(api.post).toHaveBeenCalled();
  });

  test('handles login API error', async () => {
    api.post.mockRejectedValue({ response: { status: 401, data: { message: 'Invalid' } } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await act(async () => {});

    expect(api.post).toHaveBeenCalled();
  });

  test('does not submit with empty fields', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await act(async () => {});
    expect(api.post).not.toHaveBeenCalled();
  });
});
