import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotesProvider } from '../context/NotesContext';
import Scribby from '../components/Scribby';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { notes: [] } }),
    post: jest.fn().mockResolvedValue({ data: { note: { _id: '1', title: 'Generated', content: 'Generated content' } } }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  authConfig: jest.fn(() => ({})),
}));

jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { notes: [] } });
});

describe('Scribby', () => {
  test('renders nothing when closed', () => {
    render(
      <NotesProvider>
        <Scribby open={false} setOpen={() => {}} />
      </NotesProvider>
    );
    expect(screen.queryByText('Scribby')).not.toBeInTheDocument();
  });

  test('renders when open', () => {
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={() => {}} />
      </NotesProvider>
    );
    expect(screen.getByText('Scribby')).toBeInTheDocument();
    expect(screen.getByText('AI-powered note generator')).toBeInTheDocument();
  });

  test('renders prompt textarea', () => {
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={() => {}} />
      </NotesProvider>
    );
    expect(screen.getByPlaceholderText(/Tell me what you'd like/)).toBeInTheDocument();
  });

  test('renders all suggestions', () => {
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={() => {}} />
      </NotesProvider>
    );
    expect(screen.getByText('Explain JavaScript closures')).toBeInTheDocument();
    expect(screen.getByText('Summarize React hooks')).toBeInTheDocument();
    expect(screen.getByText('Create notes about databases')).toBeInTheDocument();
    expect(screen.getByText('How does Node.js event loop work?')).toBeInTheDocument();
  });

  test('renders generate button', () => {
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={() => {}} />
      </NotesProvider>
    );
    expect(screen.getByRole('button', { name: /Generate Note/i })).toBeInTheDocument();
  });

  test('generate button is disabled when prompt is empty', () => {
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={() => {}} />
      </NotesProvider>
    );
    expect(screen.getByRole('button', { name: /Generate Note/i })).toBeDisabled();
  });

  test('clicking suggestion fills prompt', () => {
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={() => {}} />
      </NotesProvider>
    );
    fireEvent.click(screen.getByText('Explain JavaScript closures'));
    expect(screen.getByPlaceholderText(/Tell me what you'd like/).value).toBe('Explain JavaScript closures');
  });

  test('generate button enabled after typing', () => {
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={() => {}} />
      </NotesProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(/Tell me what you'd like/), { target: { value: 'test prompt' } });
    expect(screen.getByRole('button', { name: /Generate Note/i })).not.toBeDisabled();
  });

  test('close button calls setOpen', () => {
    const setOpen = jest.fn();
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={setOpen} />
      </NotesProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  test('clicking overlay calls setOpen', () => {
    const setOpen = jest.fn();
    const { container } = render(
      <NotesProvider>
        <Scribby open={true} setOpen={setOpen} />
      </NotesProvider>
    );
    const overlay = container.querySelector('.fixed.inset-0');
    if (overlay) fireEvent.click(overlay);
    expect(setOpen).toHaveBeenCalled();
  });

  test('successful generate closes modal', async () => {
    const setOpen = jest.fn();
    api.post.mockResolvedValueOnce({ data: { note: { title: 'T', content: 'C' } } });
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={setOpen} />
      </NotesProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(/Tell me what you'd like/), { target: { value: 'test prompt' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Note/i }));
    await act(async () => {});
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  test('failed generate shows error toast', async () => {
    const setOpen = jest.fn();
    api.post.mockRejectedValueOnce(new Error('fail'));
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={setOpen} />
      </NotesProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(/Tell me what you'd like/), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Note/i }));
    await act(async () => {});
    const toast = require('react-hot-toast').default;
    expect(toast.error).toHaveBeenCalledWith('Failed to generate note');
  });

  test('overlay click not blocked when generating finishes', async () => {
    const setOpen = jest.fn();
    let resolvePost;
    api.post.mockReturnValueOnce(new Promise((r) => { resolvePost = r; }));
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={setOpen} />
      </NotesProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(/Tell me what you'd like/), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Note/i }));
    if (resolvePost) await act(async () => { resolvePost({ data: { note: { title: 'T', content: 'C' } } }); });
    expect(setOpen).toHaveBeenCalled();
  });

  test('generating state shows spinner', async () => {
    let resolvePost;
    api.post.mockReturnValueOnce(new Promise((r) => { resolvePost = r; }));
    render(
      <NotesProvider>
        <Scribby open={true} setOpen={() => {}} />
      </NotesProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(/Tell me what you'd like/), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Note/i }));
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    if (resolvePost) await act(async () => { resolvePost({ data: { note: { title: 'T', content: 'C' } } }); });
  });
});
