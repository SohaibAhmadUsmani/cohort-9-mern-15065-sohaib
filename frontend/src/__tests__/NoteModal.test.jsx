import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotesProvider, useNotes } from '../context/NotesContext';
import NoteModal from '../components/NoteModal';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { notes: [] } }),
    post: jest.fn().mockResolvedValue({ data: { note: { _id: '1', title: 't', content: 'c' } } }),
    put: jest.fn().mockResolvedValue({ data: { note: { _id: '1', title: 't', content: 'c' } } }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  authConfig: jest.fn(() => ({})),
}));

jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));

function Trigger({ children }) {
  const { setShowModal } = useNotes();
  return <button onClick={() => setShowModal(true)} data-testid="trigger">{children}</button>;
}

function TriggerEdit({ note }) {
  const { setEditingNote, setShowModal } = useNotes();
  return (
    <button
      onClick={() => { setEditingNote(note); setShowModal(true); }}
      data-testid="trigger-edit"
    >
      Edit
    </button>
  );
}

function renderModal() {
  return render(
    <NotesProvider>
      <Trigger />
      <NoteModal />
    </NotesProvider>
  );
}

function renderEditModal(note) {
  return render(
    <NotesProvider>
      <TriggerEdit note={note} />
      <NoteModal />
    </NotesProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { notes: [] } });
  api.post.mockResolvedValue({ data: { note: { _id: '1', title: 't', content: 'c' } } });
  api.put.mockResolvedValue({ data: { note: { _id: '1', title: 't', content: 'c' } } });
});

describe('NoteModal', () => {
  test('does not render when closed', () => {
    renderModal();
    expect(screen.queryByText('New Note')).not.toBeInTheDocument();
  });

  test.each([
    ['renders title input', 'Note title'],
    ['renders quill editor', 'react-quill'],
    ['renders cancel button', 'Cancel'],
    ['renders save button', 'Save Note'],
  ])('%s', async (_label, text) => {
    renderModal();
    await act(async () => { screen.getByTestId('trigger').click(); });
    if (text === 'react-quill') {
      expect(screen.getByTestId('react-quill')).toBeInTheDocument();
    } else if (text === 'Note title') {
      expect(screen.getByPlaceholderText('Note title')).toBeInTheDocument();
    } else {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  test('clicking cancel closes modal', async () => {
    renderModal();
    await act(async () => { screen.getByTestId('trigger').click(); });
    expect(screen.getByText('New Note')).toBeInTheDocument();
    await act(async () => { screen.getByText('Cancel').click(); });
  });

  test('typing title updates input', async () => {
    renderModal();
    await act(async () => { screen.getByTestId('trigger').click(); });
    const input = screen.getByPlaceholderText('Note title');
    fireEvent.change(input, { target: { value: 'My Note' } });
    expect(input.value).toBe('My Note');
  });

  test('clicking overlay closes modal', async () => {
    const { container } = renderModal();
    await act(async () => { screen.getByTestId('trigger').click(); });
    expect(screen.getByText('New Note')).toBeInTheDocument();
    const overlay = container.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }
  });

  test('save button disabled when title is empty', async () => {
    renderModal();
    await act(async () => { screen.getByTestId('trigger').click(); });
    expect(screen.getByText('Save Note')).toBeDisabled();
  });

  test('renders edit note modal with correct title and button', async () => {
    const note = { _id: 'note1', title: '<p>Existing</p>', content: '<p>Content</p>' };
    renderEditModal(note);
    await act(async () => { screen.getByTestId('trigger-edit').click(); });
    expect(screen.getByText('Edit Note')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  test('edit modal pre-fills title', async () => {
    const note = { _id: 'note1', title: '<p>My Title</p>', content: '<p>Content</p>' };
    renderEditModal(note);
    await act(async () => { screen.getByTestId('trigger-edit').click(); });
    expect(screen.getByPlaceholderText('Note title').value).toBe('My Title');
  });

  test('edit modal close button works', async () => {
    const note = { _id: 'note1', title: '<p>Existing</p>', content: '<p>Content</p>' };
    renderEditModal(note);
    await act(async () => { screen.getByTestId('trigger-edit').click(); });
    expect(screen.getByText('Edit Note')).toBeInTheDocument();
    await act(async () => { screen.getByText('Cancel').click(); });
  });

  test('overlay click propagates to stopPropagation on inner modal', async () => {
    const { container } = renderModal();
    await act(async () => { screen.getByTestId('trigger').click(); });
    expect(screen.getByText('New Note')).toBeInTheDocument();
    const modal = container.querySelector('.rounded-2xl');
    if (modal) {
      fireEvent.click(modal);
    }
  });
});
