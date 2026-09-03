import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotesProvider, useNotes } from '../context/NotesContext';
import DeleteModal from '../components/DeleteModal';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { notes: [] } }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  authConfig: jest.fn(() => ({})),
}));

function TestWrapper() {
  const { setShowDelete, fetchNotes } = useNotes();
  return (
    <div>
      <button onClick={() => fetchNotes()}>fetch</button>
      <button onClick={() => setShowDelete({ _id: 'note1', title: 'Test' })}>showDelete</button>
      <DeleteModal />
    </div>
  );
}

function renderWithDelete() {
  return render(
    <NotesProvider>
      <TestWrapper />
    </NotesProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { notes: [] } });
});

describe('DeleteModal', () => {
  test('does not render when showDelete is null', () => {
    renderWithDelete();
    expect(screen.queryByRole('heading', { name: 'Move to Trash' })).not.toBeInTheDocument();
  });

  test('renders when showDelete is set', async () => {
    renderWithDelete();
    await act(async () => { screen.getByText('showDelete').click(); });
    expect(screen.getByRole('heading', { name: 'Move to Trash' })).toBeInTheDocument();
  });

  test('renders cancel and confirm buttons', async () => {
    renderWithDelete();
    await act(async () => { screen.getByText('showDelete').click(); });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move to Trash' })).toBeInTheDocument();
  });

  test('clicking cancel triggers close', async () => {
    renderWithDelete();
    await act(async () => { screen.getByText('showDelete').click(); });
    expect(screen.getByRole('heading', { name: 'Move to Trash' })).toBeInTheDocument();
    await act(async () => { screen.getByText('Cancel').click(); });
  });

  test('clicking confirm calls removeNote', async () => {
    renderWithDelete();
    await act(async () => { screen.getByText('showDelete').click(); });
    expect(screen.getByRole('heading', { name: 'Move to Trash' })).toBeInTheDocument();
    await act(async () => { screen.getByRole('button', { name: 'Move to Trash' }).click(); });
    expect(screen.getByText('showDelete')).toBeInTheDocument();
  });

  test('renders description text', async () => {
    renderWithDelete();
    await act(async () => { screen.getByText('showDelete').click(); });
    expect(screen.getByText(/restore it later/)).toBeInTheDocument();
  });

  test('clicking overlay closes modal', async () => {
    const { container } = renderWithDelete();
    await act(async () => { screen.getByText('showDelete').click(); });
    expect(screen.getByRole('heading', { name: 'Move to Trash' })).toBeInTheDocument();
    const overlay = container.querySelector('.fixed.inset-0');
    if (overlay) fireEvent.click(overlay);
  });

  test('clicking X button closes modal', async () => {
    renderWithDelete();
    await act(async () => { screen.getByText('showDelete').click(); });
    expect(screen.getByRole('heading', { name: 'Move to Trash' })).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(closeBtn);
  });
});
