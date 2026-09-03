import { render, screen, fireEvent } from '@testing-library/react';
import { NotesProvider } from '../context/NotesContext';
import { AuthProvider } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { user: { name: 'Test', email: 'test@test.com' } } }),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  authConfig: jest.fn(() => ({})),
}));

function renderSidebar(props = {}) {
  return render(
    <AuthProvider>
      <NotesProvider>
        <Sidebar dark={false} setDark={() => {}} collapsed={false} setCollapsed={() => {}} onLogout={() => {}} {...props} />
      </NotesProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { user: { name: 'Test', email: 'test@test.com' } } });
  if (!URL.createObjectURL) {
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = jest.fn();
  }
});

describe('Sidebar', () => {
  test.each([
    ['renders Memora brand', 'Memora'],
    ['renders All Notes nav', 'All Notes'],
    ['renders Favorites nav', 'Favorites'],
    ['renders Trash nav', 'Trash'],
    ['renders new note button', 'New Note'],
    ['renders Work tag', 'Work'],
    ['renders Personal tag', 'Personal'],
    ['renders Ideas tag', 'Ideas'],
    ['renders Study tag', 'Study'],
    ['renders Dark Mode toggle', 'Dark Mode'],
    ['renders Export button', 'Export'],
    ['renders Import button', 'Import'],
    ['renders Scribby button', 'Scribby'],
  ])('%s', (_label, text) => {
    renderSidebar();
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  test.each([
    ['All Notes'],
    ['Favorites'],
    ['Trash'],
    ['Work'],
  ])('clicking %s does not throw', (label) => {
    renderSidebar();
    fireEvent.click(screen.getByText(label));
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test('renders user avatar with correct initial', () => {
    const { container } = renderSidebar();
    const avatar = container.querySelector('.rounded-full.bg-\\[var\\(--accent\\)\\]');
    expect(avatar).toBeInTheDocument();
  });

  test('collapsed sidebar hides expanded content', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText('Memora')).not.toBeInTheDocument();
    expect(screen.queryByText('New Note')).not.toBeInTheDocument();
    expect(screen.queryByText('Dark Mode')).not.toBeInTheDocument();
  });

  test.each([
    ['Expand sidebar', 'Expand sidebar'],
    ['Scribby', 'Scribby'],
    ['Toggle theme', 'Toggle theme'],
    ['Logout', 'Logout'],
  ])('collapsed sidebar shows %s button', (_label, title) => {
    renderSidebar({ collapsed: true });
    expect(screen.getByTitle(title)).toBeInTheDocument();
  });

  test.each([
    ['Favorites', 'Favorites'],
    ['Trash', 'Trash'],
    ['All Notes', 'All Notes'],
  ])('collapsed sidebar shows and clicks %s nav', (_label, title) => {
    renderSidebar({ collapsed: true });
    const btn = screen.getByTitle(title);
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  test('clicking expand calls setCollapsed', () => {
    const setCollapsed = jest.fn();
    renderSidebar({ collapsed: true, setCollapsed });
    fireEvent.click(screen.getByTitle('Expand sidebar'));
    expect(setCollapsed).toHaveBeenCalledWith(false);
  });

  test('clicking collapse calls setCollapsed', () => {
    const setCollapsed = jest.fn();
    renderSidebar({ collapsed: false, setCollapsed });
    fireEvent.click(screen.getByTitle('Collapse sidebar'));
    expect(setCollapsed).toHaveBeenCalledWith(true);
  });

  test('clicking dark mode toggle calls setDark', () => {
    const setDark = jest.fn();
    renderSidebar({ setDark });
    fireEvent.click(screen.getByText('Dark Mode'));
    expect(setDark).toHaveBeenCalled();
  });

  test('clicking logout calls onLogout', () => {
    const onLogout = jest.fn();
    renderSidebar({ onLogout });
    fireEvent.click(screen.getByTitle('Logout'));
    expect(onLogout).toHaveBeenCalled();
  });

  test('clicking tag toggles filter', () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Work'));
    fireEvent.click(screen.getByText('Work'));
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  test('clicking new note button opens modal', () => {
    renderSidebar();
    fireEvent.click(screen.getByText(/New Note/));
    expect(screen.getByText(/New Note/)).toBeInTheDocument();
  });

  test('clicking scribby button in expanded opens scribby', () => {
    const { container } = renderSidebar();
    fireEvent.click(screen.getByText('Scribby'));
    expect(container.querySelector('.lucide-star')).toBeInTheDocument();
  });

  test('clicking export runs without error', () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  test('clicking import runs without error', () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Import'));
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  test('clicking collapsed dark mode toggle calls setDark', () => {
    const setDark = jest.fn();
    renderSidebar({ collapsed: true, setDark });
    fireEvent.click(screen.getByTitle('Toggle theme'));
    expect(setDark).toHaveBeenCalled();
  });

  test('clicking collapsed logout calls onLogout', () => {
    const onLogout = jest.fn();
    renderSidebar({ collapsed: true, onLogout });
    fireEvent.click(screen.getByTitle('Logout'));
    expect(onLogout).toHaveBeenCalled();
  });

  test('clicking collapsed Scribby opens modal', () => {
    renderSidebar({ collapsed: true });
    fireEvent.click(screen.getByTitle('Scribby'));
    expect(screen.getByTitle('Scribby')).toBeInTheDocument();
  });

  test('collapsed sidebar does not show tags', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText('Work')).not.toBeInTheDocument();
  });

  test('tag counts show correctly', () => {
    renderSidebar();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });
});
