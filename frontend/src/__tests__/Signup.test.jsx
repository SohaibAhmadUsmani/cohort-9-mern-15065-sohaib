import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../pages/Signup';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../services/api', () => ({
  default: { get: jest.fn(), post: jest.fn() },
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
});
