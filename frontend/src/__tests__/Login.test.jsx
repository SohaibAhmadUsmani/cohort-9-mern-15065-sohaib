import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../services/api', () => ({
  default: { get: jest.fn(), post: jest.fn() },
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
});
