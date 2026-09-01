import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

jest.mock('../services/api');

function ProtectedPage() {
  return <div>Protected Content</div>;
}

function LoginPage() {
  return <div>Login Page</div>;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('redirects to login when not authenticated', async () => {
    api.get.mockRejectedValue(new Error('No token'));

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/protected" element={<ProtectedRoute><ProtectedPage /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await screen.findByText('Login Page');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('renders children when authenticated', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { user: { name: 'Test' } } });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/protected" element={<ProtectedRoute><ProtectedPage /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await screen.findByText('Protected Content');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
