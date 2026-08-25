import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../pages/Signup';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../services/api');

const renderSignup = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Signup />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Signup Page', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should render signup form elements', () => {
    renderSignup();
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeTruthy();
    expect(screen.getByLabelText('Name')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: /create account/i })).toBeTruthy();
  });

  it('should render login link', () => {
    renderSignup();
    const link = screen.getByText('Sign in');
    expect(link.getAttribute('href')).toBe('/login');
  });

  it('should update form fields', () => {
    renderSignup();
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(nameInput.value).toBe('Test User');
    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should have required attributes on inputs', () => {
    renderSignup();
    expect(screen.getByLabelText('Name').required).toBe(true);
    expect(screen.getByLabelText('Email').required).toBe(true);
    expect(screen.getByLabelText('Password').required).toBe(true);
  });

  it('should have minLength on password input', () => {
    renderSignup();
    expect(screen.getByLabelText('Password').minLength).toBe(6);
  });
});
