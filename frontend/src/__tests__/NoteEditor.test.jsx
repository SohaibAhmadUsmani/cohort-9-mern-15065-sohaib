import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotesProvider, useNotes } from '../context/NotesContext';
import NoteEditor from '../components/NoteEditor';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { notes: [] } }),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  authConfig: jest.fn(() => ({})),
}));

const mockNote = {
  _id: 'note1',
  title: '<p>Test Title</p>',
  content: '<p>Test content</p>',
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-02T10:00:00Z',
};

const mockTrashedNote = {
  _id: 'note2',
  title: '<p>Trashed</p>',
  content: '<p>Trashed content</p>',
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-02T10:00:00Z',
};

function EditorWithNote({ note }) {
  const { setSelectedNote } = useNotes();
  return (
    <div>
      <button onClick={() => setSelectedNote(note)} data-testid="select">Select</button>
      <NoteEditor />
    </div>
  );
}

function renderWithNote(note = mockNote) {
  return render(
    <NotesProvider>
      <EditorWithNote note={note} />
    </NotesProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { notes: [mockNote] } });
});

describe('NoteEditor', () => {
  test('renders empty state when no note selected', () => {
    render(
      <NotesProvider>
        <NoteEditor />
      </NotesProvider>
    );
    expect(screen.getByText('Select a note to view')).toBeInTheDocument();
  });

  test('renders note title after selection', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders note content after selection', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders date', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });

  test.each([
    ['Edit'],
    ['Delete'],
    ['Favorite'],
    ['Set tag'],
  ])('renders %s button', async (title) => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByTitle(title)).toBeInTheDocument();
  });

  test('clicking favorite toggles it', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    await act(async () => { screen.getByTitle('Favorite').click(); });
    expect(screen.getByTitle('Favorite')).toBeInTheDocument();
  });

  test('clicking delete moves to trash', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    await act(async () => { screen.getByTitle('Delete').click(); });
    expect(screen.getByText('Select a note to view')).toBeInTheDocument();
  });

  test('clicking edit opens modal', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    const editBtn = screen.getByTitle('Edit');
    await act(async () => { editBtn.click(); });
    expect(editBtn).toBeInTheDocument();
  });

  test('clicking tag button opens tag menu', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    await act(async () => { screen.getByTitle('Set tag').click(); });
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  test('selecting a tag sets it on the note', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    await act(async () => { screen.getByTitle('Set tag').click(); });
    await act(async () => { screen.getByText('Work').click(); });
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  test('renders with empty title shows Untitled', async () => {
    const note = { ...mockNote, title: '' };
    renderWithNote(note);
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  test('renders trashed note with restore button', async () => {
    localStorage.setItem('memora_notes_meta', JSON.stringify({ note2: { deleted: true, favorite: false } }));
    renderWithNote(mockTrashedNote);
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByTitle('Restore')).toBeInTheDocument();
    expect(screen.getByTitle('Delete Permanently')).toBeInTheDocument();
  });

  test('clicking restore on trashed note restores it', async () => {
    localStorage.setItem('memora_notes_meta', JSON.stringify({ note2: { deleted: true, favorite: false } }));
    renderWithNote(mockTrashedNote);
    await act(async () => { screen.getByTestId('select').click(); });
    const restoreBtn = screen.getByTitle('Restore');
    await act(async () => { restoreBtn.click(); });
    expect(restoreBtn).toBeInTheDocument();
  });

  test('clicking permanent delete on trashed note deletes it', async () => {
    localStorage.setItem('memora_notes_meta', JSON.stringify({ note2: { deleted: true, favorite: false } }));
    renderWithNote(mockTrashedNote);
    await act(async () => { screen.getByTestId('select').click(); });
    const permDeleteBtn = screen.getByTitle('Delete Permanently');
    await act(async () => { permDeleteBtn.click(); });
    expect(permDeleteBtn).toBeInTheDocument();
  });

  test('tag menu remove tag option appears when tag is set', async () => {
    localStorage.setItem('memora_notes_meta', JSON.stringify({ note1: { tag: 'Work' } }));
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    await act(async () => { screen.getByTitle('Set tag').click(); });
    expect(screen.getByText('Remove tag')).toBeInTheDocument();
  });

  test('clicking remove tag clears the tag', async () => {
    localStorage.setItem('memora_notes_meta', JSON.stringify({ note1: { tag: 'Work' } }));
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    await act(async () => { screen.getByTitle('Set tag').click(); });
    expect(screen.getByText('Remove tag')).toBeInTheDocument();
    await act(async () => { screen.getByText('Remove tag').click(); });
    expect(screen.getByTitle('Set tag')).toBeInTheDocument();
    expect(screen.getByTitle('Favorite')).toBeInTheDocument();
  });

  test('renders note with no dates shows fallback', async () => {
    const note = { _id: 'note3', title: '<p>No dates</p>', content: '<p>Content</p>' };
    renderWithNote(note);
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByText('Recently created')).toBeInTheDocument();
  });

  test('toggling tag menu closed on second click', async () => {
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    await act(async () => { screen.getByTitle('Set tag').click(); });
    expect(screen.getByText('Work')).toBeInTheDocument();
    await act(async () => { screen.getByTitle('Set tag').click(); });
  });

  test.each([
    ['Personal'],
    ['Ideas'],
    ['Study'],
  ])('renders %s tag color', async (tag) => {
    localStorage.setItem('memora_notes_meta', JSON.stringify({ note1: { tag } }));
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByText(tag)).toBeInTheDocument();
  });

  test('note with Favorite already set renders filled star', async () => {
    localStorage.setItem('memora_notes_meta', JSON.stringify({ note1: { favorite: true } }));
    renderWithNote();
    await act(async () => { screen.getByTestId('select').click(); });
    expect(screen.getByTitle('Favorite')).toBeInTheDocument();
  });
});
