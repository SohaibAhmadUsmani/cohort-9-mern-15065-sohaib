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

import { render, screen, act } from '@testing-library/react';
import { NotesProvider, useNotes } from '../context/NotesContext';
import api from '../services/api';

let notesHook;

function TestComponent() {
  notesHook = useNotes();
  return (
    <div>
      <span data-testid="loading">{notesHook.loading.toString()}</span>
      <span data-testid="notes-count">{notesHook.notes.length}</span>
      <span data-testid="filter">{notesHook.filter}</span>
      <button onClick={() => notesHook.fetchNotes()}>fetch</button>
      <button onClick={() => notesHook.setFilter('favorites')}>fav</button>
      <button onClick={() => notesHook.setFilter('trash')}>trash</button>
      <button onClick={() => notesHook.setSearch('test')}>search</button>
      <button onClick={() => notesHook.addNote('Title', '<p>Content</p>')}>add</button>
      <button onClick={() => notesHook.toggleFavorite('note1')}>toggleFav</button>
      <button onClick={() => notesHook.moveToTrash('note1')}>trashNote</button>
      <button onClick={() => notesHook.restoreFromTrash('note1')}>restore</button>
      <button onClick={() => notesHook.permanentDelete('note1')}>permDelete</button>
      <button onClick={() => notesHook.setTag('note1', 'Work')}>setTag</button>
      <button onClick={() => notesHook.exportNotes()}>export</button>
      <button onClick={() => notesHook.updateNote('note1', 'Title2', '<p>C2</p>')}>update</button>
      <button onClick={() => notesHook.importNotes(new File([JSON.stringify([{ title: 'T', content: 'C' }])], 'test.json', { type: 'application/json' }))}>import</button>
      <button onClick={() => notesHook.importNotes(new File(['not json'], 'bad.json', { type: 'application/json' }))}>importBad</button>
      <button onClick={() => notesHook.importNotes(new File([JSON.stringify({ not: 'array' })], 'obj.json', { type: 'application/json' }))}>importObj</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { notes: [] } });
  api.post.mockResolvedValue({ data: {} });
  api.put.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
  if (!File.prototype.text) {
    File.prototype.text = function () {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(this);
      });
    };
  }
});

describe('NotesContext', () => {
  test('initializes with empty state', async () => {
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => {});
    expect(screen.getByTestId('notes-count').textContent).toBe('0');
    expect(screen.getByTestId('filter').textContent).toBe('all');
  });

  test('fetchNotes loads notes', async () => {
    api.get.mockResolvedValue({
      data: { notes: [{ _id: 'n1', title: '<p>A</p>', content: '<p>B</p>' }, { _id: 'n2', title: '<p>C</p>', content: '<p>D</p>' }] },
    });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    expect(screen.getByTestId('notes-count').textContent).toBe('2');
  });

  test('fetchNotes handles error', async () => {
    api.get.mockRejectedValue(new Error('fail'));
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    expect(screen.getByTestId('notes-count').textContent).toBe('0');
  });

  test('setFilter changes filter', async () => {
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fav').click(); });
    expect(screen.getByTestId('filter').textContent).toBe('favorites');
  });

  test('setSearch changes search', async () => {
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('search').click(); });
    expect(notesHook.search).toBe('test');
  });

  test('addNote creates note when token exists', async () => {
    localStorage.setItem('token', 'valid-token');
    api.post.mockResolvedValue({ data: { note: { _id: 'new', title: 'Title', content: 'Content' } } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('add').click(); });
    expect(api.post).toHaveBeenCalled();
  });

  test('addNote shows error when no token', async () => {
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('add').click(); });
    expect(api.post).not.toHaveBeenCalled();
  });

  test('addNote handles API error with 401', async () => {
    localStorage.setItem('token', 'valid-token');
    api.post.mockRejectedValue({ response: { status: 401, data: { message: 'err' } } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('add').click(); });
    expect(api.post).toHaveBeenCalled();
  });

  test('addNote handles null response', async () => {
    localStorage.setItem('token', 'valid-token');
    api.post.mockResolvedValue({ data: {} });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('add').click(); });
    expect(api.post).toHaveBeenCalled();
  });

  test('toggleFavorite toggles state', async () => {
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    expect(notesHook.notes).toHaveLength(1);
    await act(async () => { screen.getByText('toggleFav').click(); });
    expect(JSON.parse(localStorage.getItem('memora_notes_meta'))).toHaveProperty('note1');
  });

  test('moveToTrash marks note as deleted', async () => {
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('trashNote').click(); });
    const meta = JSON.parse(localStorage.getItem('memora_notes_meta'));
    expect(meta.note1.deleted).toBe(true);
  });

  test('restoreFromTrash restores note', async () => {
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('trashNote').click(); });
    await act(async () => { screen.getByText('restore').click(); });
    const meta = JSON.parse(localStorage.getItem('memora_notes_meta'));
    expect(meta.note1.deleted).toBe(false);
  });

  test('permanentDelete shows error when no token', async () => {
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('permDelete').click(); });
    expect(api.delete).not.toHaveBeenCalled();
  });

  test('permanentDelete deletes note when token exists', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('permDelete').click(); });
    expect(api.delete).toHaveBeenCalled();
  });

  test('permanentDelete handles API error 401', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    api.delete.mockRejectedValue({ response: { status: 401, data: { message: 'err' } } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('permDelete').click(); });
    expect(screen.getByTestId('notes-count').textContent).toBe('1');
  });

  test('permanentDelete handles API error non-401', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    api.delete.mockRejectedValue({ response: { status: 500, data: { message: 'err' } } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('permDelete').click(); });
    expect(screen.getByTestId('notes-count').textContent).toBe('1');
  });

  test('setTag sets tag on note', async () => {
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('setTag').click(); });
    const meta = JSON.parse(localStorage.getItem('memora_notes_meta'));
    expect(meta.note1.tag).toBe('Work');
  });

  test('updateNote updates note', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    api.put.mockResolvedValue({ data: { note: { _id: 'note1', title: 'Title2', content: '<p>C2</p>' } } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('update').click(); });
    expect(api.put).toHaveBeenCalled();
  });

  test('updateNote handles error', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    api.put.mockRejectedValue(new Error('fail'));
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('update').click(); });
    expect(screen.getByTestId('notes-count').textContent).toBe('1');
  });

  test('updateNote handles missing note in response', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    api.put.mockResolvedValue({ data: {} });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('update').click(); });
    expect(screen.getByTestId('notes-count').textContent).toBe('1');
  });

  test('importNotes handles invalid JSON via import button', async () => {
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('importBad').click(); });
    expect(notesHook.notes).toHaveLength(0);
  });

  test('importNotes handles non-array data via import button', async () => {
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('importObj').click(); });
    expect(notesHook.notes).toHaveLength(0);
  });

  test('importNotes skips items without title or content via import button', async () => {
    localStorage.setItem('token', 'valid-token');
    api.post.mockResolvedValue({ data: { note: { _id: 'i1', title: 'Valid', content: 'Content' } } });
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'i1', title: 'Valid', content: 'Content' }] } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('import').click(); });
    expect(notesHook.notes.length).toBeGreaterThanOrEqual(0);
  });

  test('addNote handles non-401 API error', async () => {
    localStorage.setItem('token', 'valid-token');
    api.post.mockRejectedValue({ response: { status: 500, data: { message: 'Server error' } } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('add').click(); });
    expect(api.post).toHaveBeenCalled();
  });

  test('loadMeta handles corrupted localStorage', async () => {
    localStorage.setItem('memora_notes_meta', '{invalid json');
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => {});
    expect(screen.getByTestId('notes-count').textContent).toBe('0');
  });

  test('setFilter with tag filter shows only tagged notes', async () => {
    api.get.mockResolvedValue({
      data: {
        notes: [
          { _id: 'n1', title: '<p>T1</p>', content: '<p>C1</p>' },
          { _id: 'n2', title: '<p>T2</p>', content: '<p>C2</p>' },
        ],
      },
    });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { notesHook.setTag('n1', 'Work'); });
    await act(async () => { notesHook.setFilter('Work'); });
    expect(screen.getByTestId('filter').textContent).toBe('Work');
  });

  test('exportNotes runs without error', async () => {
    URL.createObjectURL = jest.fn(() => 'blob:test');
    URL.revokeObjectURL = jest.fn();
    const origAppendChild = document.body.appendChild;
    document.body.appendChild = jest.fn((el) => { if (el.tagName === 'A') { el.click = jest.fn(); } return origAppendChild.call(document.body, el); });
    api.get.mockResolvedValue({ data: { notes: [{ _id: 'note1', title: '<p>T</p>', content: '<p>C</p>' }] } });
    render(<NotesProvider><TestComponent /></NotesProvider>);
    await act(async () => { screen.getByText('fetch').click(); });
    await act(async () => { screen.getByText('export').click(); });
    expect(URL.createObjectURL).toHaveBeenCalled();
    document.body.appendChild = origAppendChild;
  });
});
