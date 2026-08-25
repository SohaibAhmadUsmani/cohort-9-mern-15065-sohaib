import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../services/api');

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should render login form elements', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  it('should render signup link', () => {
    renderLogin();
    const link = screen.getByText('Sign up');
    expect(link.getAttribute('href')).toBe('/signup');
  });

  it('should update email and password fields', () => {
    renderLogin();
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should have required attributes on inputs', () => {
    renderLogin();
    expect(screen.getByLabelText('Email').required).toBe(true);
    expect(screen.getByLabelText('Password').required).toBe(true);
  });

  it('should have email type on email input', () => {
    renderLogin();
    expect(screen.getByLabelText('Email').type).toBe('email');
  });

  it('should have password type on password input', () => {
    renderLogin();
    expect(screen.getByLabelText('Password').type).toBe('password');
  });
});
