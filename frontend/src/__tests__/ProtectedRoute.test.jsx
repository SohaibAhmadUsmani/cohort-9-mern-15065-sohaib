import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

jest.mock('../services/api');

const renderWithAuth = (ui) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should redirect to login when not authenticated', async () => {
    api.get.mockRejectedValue(new Error('No token'));
    const { container } = renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(container.textContent).not.toContain('Protected Content');
    });
  });

  it('should render children when authenticated', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { user: { email: 'test@test.com' } } });

    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeTruthy();
    });
  });
});
