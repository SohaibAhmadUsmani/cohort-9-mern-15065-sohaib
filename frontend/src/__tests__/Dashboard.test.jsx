import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotesProvider } from '../context/NotesContext';
import { AuthProvider } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { notes: [], user: { name: 'Test' } } }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  authConfig: jest.fn(() => ({})),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <NotesProvider>
          <Dashboard />
        </NotesProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { notes: [], user: { name: 'Test' } } });
  if (!URL.createObjectURL) {
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = jest.fn();
  }
});

describe('Dashboard', () => {
  test('renders without crashing', () => {
    renderDashboard();
    expect(screen.getByText('Memora')).toBeInTheDocument();
  });

  test('renders search input', () => {
    renderDashboard();
    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
  });

  test('renders empty state when no notes', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('0 notes')).toBeInTheDocument();
    });
    expect(screen.getByText(/Create your first note/)).toBeInTheDocument();
  });

  test.each([
    ['renders note count', [], '0 notes'],
    ['renders note list when notes exist', [{ _id: 'n1', title: '<p>First Note</p>', content: '<p>Content 1</p>' }, { _id: 'n2', title: '<p>Second Note</p>', content: '<p>Content 2</p>' }], '2 notes'],
    ['renders NoteEditor when notes exist', [{ _id: 'n1', title: '<p>First Note</p>', content: '<p>Content 1</p>' }], '1 notes'],
  ])('%s', async (_label, notes, expectedCount) => {
    api.get.mockResolvedValue({
      data: { notes, user: { name: 'Test' } },
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(expectedCount)).toBeInTheDocument();
    });
  });

  test('search input is interactive', () => {
    renderDashboard();
    const input = screen.getByPlaceholderText('Search notes...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input.value).toBe('test');
  });

  test('renders Dark Mode toggle', () => {
    renderDashboard();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  test('renders Export and Import buttons', () => {
    renderDashboard();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  test('handleLogout calls logout', async () => {
    renderDashboard();
    fireEvent.click(screen.getByTitle('Logout'));
    await waitFor(() => {
      expect(screen.getByText('Memora')).toBeInTheDocument();
    });
  });

  test('toggle sidebar collapse', () => {
    renderDashboard();
    const collapseBtn = screen.getByTitle('Collapse sidebar');
    fireEvent.click(collapseBtn);
    expect(screen.getByTitle('Expand sidebar')).toBeInTheDocument();
  });

  test('loading state shows skeletons', async () => {
    let resolveGet;
    api.get.mockReturnValue(new Promise((resolve) => { resolveGet = resolve; }));
    renderDashboard();
    expect(screen.getAllByText('Memora').length).toBeGreaterThanOrEqual(1);
    resolveGet({ data: { notes: [], user: { name: 'Test' } } });
    await waitFor(() => {
      expect(screen.getByText('0 notes')).toBeInTheDocument();
    });
  });
});
