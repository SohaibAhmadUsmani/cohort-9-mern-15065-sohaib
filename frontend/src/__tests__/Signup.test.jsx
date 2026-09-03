import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../pages/Signup';
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

function renderSignup() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Signup />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('Signup', () => {
  test('renders signup form with name, email, and password', () => {
    renderSignup();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders create account button', () => {
    renderSignup();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('renders create account heading', () => {
    renderSignup();
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
  });

  test('renders link to login page', () => {
    renderSignup();
    expect(screen.getByText('Sign in')).toHaveAttribute('href', '/login');
  });

  test('password has minLength of 6', () => {
    renderSignup();
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('minLength', '6');
  });

  test('can type in name field', () => {
    renderSignup();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    expect(screen.getByLabelText(/name/i).value).toBe('John');
  });

  test('can type in email field', () => {
    renderSignup();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    expect(screen.getByLabelText(/email/i).value).toBe('test@test.com');
  });

  test('form submission calls API', async () => {
    api.post.mockResolvedValue({ data: { token: 'signup-token' } });
    api.get.mockResolvedValue({ data: { user: { name: 'John' } } });
    renderSignup();

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await act(async () => {});

    expect(api.post).toHaveBeenCalled();
  });

  test('handles signup API error', async () => {
    api.post.mockRejectedValue({ response: { status: 400, data: { message: 'User exists' } } });
    renderSignup();

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await act(async () => {});

    expect(api.post).toHaveBeenCalled();
  });
});
