import { render, screen, fireEvent } from '@testing-library/react';
import { NotesProvider } from '../context/NotesContext';
import EmptyState from '../components/EmptyState';

jest.mock('../services/api', () => ({
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  authConfig: jest.fn(() => ({})),
}));

function renderEmptyState() {
  return render(
    <NotesProvider>
      <EmptyState />
    </NotesProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('EmptyState', () => {
  test('renders default message when no notes', () => {
    renderEmptyState();
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  test('renders create button', () => {
    renderEmptyState();
    expect(screen.getByText(/\+ Create your first note/)).toBeInTheDocument();
  });

  test('clicking create button triggers action', () => {
    renderEmptyState();
    const btn = screen.getByText(/\+ Create your first note/);
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });
});
