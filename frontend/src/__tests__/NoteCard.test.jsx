import { render, screen, fireEvent } from '@testing-library/react';
import { NotesProvider } from '../context/NotesContext';
import NoteCard from '../components/NoteCard';

jest.mock('../services/api', () => ({
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  authConfig: jest.fn(() => ({})),
}));

const mockNote = {
  _id: 'note123',
  title: '<p>Test Note</p>',
  content: '<p>This is test content</p>',
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-02T10:00:00Z',
};

function renderNoteCard(note = mockNote, index = 0) {
  return render(
    <NotesProvider>
      <NoteCard note={note} index={index} />
    </NotesProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('NoteCard', () => {
  test('renders note title', () => {
    renderNoteCard();
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  test('renders note time', () => {
    renderNoteCard();
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  test('clicking note card triggers selection', () => {
    renderNoteCard();
    const card = screen.getByText('Test Note');
    fireEvent.click(card);
    expect(card).toBeInTheDocument();
  });

  test('renders note with no updatedAt', () => {
    const noteWithoutUpdate = { ...mockNote, updatedAt: undefined };
    renderNoteCard(noteWithoutUpdate);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  test('renders with empty content', () => {
    const noteWithEmpty = { ...mockNote, content: '' };
    renderNoteCard(noteWithEmpty);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });
});
