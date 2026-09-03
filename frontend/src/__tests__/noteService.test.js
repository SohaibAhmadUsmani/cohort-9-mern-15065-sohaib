jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { notes: [], note: {} } }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  authConfig: jest.fn(() => ({})),
}));

import noteService from '../services/noteService';
import api from '../services/api';

beforeEach(() => jest.clearAllMocks());

describe('noteService', () => {
  test('getNotes calls GET /notes', async () => {
    api.get.mockResolvedValue({ data: { notes: [{ _id: '1' }] } });
    const result = await noteService.getNotes();
    expect(api.get).toHaveBeenCalledWith('/notes', expect.anything());
    expect(result).toEqual([{ _id: '1' }]);
  });

  test('getNote calls GET /notes/:id', async () => {
    api.get.mockResolvedValue({ data: { note: { _id: '1' } } });
    const result = await noteService.getNote('1');
    expect(api.get).toHaveBeenCalledWith('/notes/1', expect.anything());
    expect(result).toEqual({ _id: '1' });
  });

  test('createNote calls POST /notes', async () => {
    api.post.mockResolvedValue({ data: { note: { _id: '1' } } });
    const result = await noteService.createNote({ title: 'T', content: 'C' });
    expect(api.post).toHaveBeenCalledWith('/notes', { title: 'T', content: 'C' }, expect.anything());
    expect(result).toEqual({ note: { _id: '1' } });
  });

  test('updateNote calls PUT /notes/:id', async () => {
    api.put.mockResolvedValue({ data: { note: { _id: '1' } } });
    const result = await noteService.updateNote('1', { title: 'T' });
    expect(api.put).toHaveBeenCalledWith('/notes/1', { title: 'T' }, expect.anything());
    expect(result).toEqual({ note: { _id: '1' } });
  });

  test('deleteNote calls DELETE /notes/:id', async () => {
    api.delete.mockResolvedValue({ data: { message: 'deleted' } });
    const result = await noteService.deleteNote('1');
    expect(api.delete).toHaveBeenCalledWith('/notes/1', expect.anything());
    expect(result).toEqual({ message: 'deleted' });
  });

  test('generateNote calls POST /ai/generate', async () => {
    api.post.mockResolvedValue({ data: { note: { title: 'AI' } } });
    const result = await noteService.generateNote('write about dogs');
    expect(api.post).toHaveBeenCalledWith('/ai/generate', { prompt: 'write about dogs' }, expect.anything());
    expect(result).toEqual({ note: { title: 'AI' } });
  });
});
