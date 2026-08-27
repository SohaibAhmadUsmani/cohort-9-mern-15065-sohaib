const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const Note = require('../src/models/note');
const User = require('../src/models/user');

let app, token, noteId;

before(async () => {
  process.env.JWT_SECRET = 'test-secret-key';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/notes_test');
  }
  await Note.deleteMany({});
  await User.deleteMany({});
  app = require('../src/app');

  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Note Tester', email: 'note@test.com', password: 'password123' });
  token = res.body.token;
});

describe('Notes API', () => {
  describe('POST /api/notes', () => {
    it('should create a new note', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Note', content: '<p>This is a test note</p>' })
        .expect(201);

      expect(res.body.note).to.have.property('_id');
      expect(res.body.note.title).to.equal('Test Note');
      noteId = res.body.note._id;
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '<p>No title</p>' })
        .expect(400);

      expect(res.body.message).to.equal('Title and content are required');
    });

    it('should return 400 if content is missing', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'No Content' })
        .expect(400);

      expect(res.body.message).to.equal('Title and content are required');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/notes')
        .send({ title: 'Test', content: '<p>Test</p>' })
        .expect(401);
    });
  });

  describe('GET /api/notes', () => {
    it('should return all notes for authenticated user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.notes).to.be.an('array');
      expect(res.body.notes.length).to.be.greaterThan(0);
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/notes')
        .expect(401);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should return a single note by id', async () => {
      const res = await request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.note.title).to.equal('Test Note');
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/notes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 400 for invalid note id', async () => {
      await request(app)
        .get('/api/notes/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Note', content: '<p>Updated content</p>' })
        .expect(200);

      expect(res.body.note.title).to.equal('Updated Note');
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/notes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', content: '<p>Test</p>' })
        .expect(404);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).to.equal('Note deleted successfully');
    });

    it('should return 404 for already deleted note', async () => {
      await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
