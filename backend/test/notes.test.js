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

after(async () => {
  await Note.deleteMany({});
  await User.deleteMany({});
});

describe('Notes API', () => {
  describe('POST /api/notes', () => {
    it('should create a new note and return it', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Note', content: '<p>This is a test note</p>' })
        .expect(201);

      expect(res.body.note).to.have.property('_id');
      expect(res.body.note.title).to.equal('Test Note');
      expect(res.body.note.content).to.equal('<p>This is a test note</p>');
      expect(res.body.message).to.equal('Note created successfully');
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

    it('should return 400 if both title and content are missing', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body.message).to.equal('Title and content are required');
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ title: 'Test', content: '<p>Test</p>' })
        .expect(401);

      expect(res.body.message).to.equal('Access Denied');
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', 'Bearer bad-token')
        .send({ title: 'Test', content: '<p>Test</p>' })
        .expect(401);
    });

    it('should create multiple notes for the same user', async () => {
      const res1 = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Note 2', content: '<p>Second note</p>' })
        .expect(201);

      const res2 = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Note 3', content: '<p>Third note</p>' })
        .expect(201);

      expect(res1.body.note._id).to.not.equal(res2.body.note._id);
    });
  });

  describe('GET /api/notes', () => {
    it('should return all notes for authenticated user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.notes).to.be.an('array');
      expect(res.body.notes.length).to.be.at.least(1);
    });

    it('should only return notes belonging to the authenticated user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      res.body.notes.forEach((note) => {
        expect(note).to.have.property('user');
      });
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .get('/api/notes')
        .expect(401);

      expect(res.body.message).to.equal('Access Denied');
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/notes')
        .set('Authorization', 'Bearer expired-token')
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
      expect(res.body.note._id).to.equal(noteId);
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/notes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.message).to.equal('Note not found');
    });

    it('should return 400 for invalid note id format', async () => {
      const res = await request(app)
        .get('/api/notes/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.message).to.equal('Invalid Note ID');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get(`/api/notes/${noteId}`)
        .expect(401);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note successfully', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Note', content: '<p>Updated content</p>' })
        .expect(200);

      expect(res.body.note.title).to.equal('Updated Note');
      expect(res.body.note.content).to.equal('<p>Updated content</p>');
      expect(res.body.message).to.equal('Note updated successfully');
    });

    it('should return 400 if title is missing on update', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '<p>No title</p>' })
        .expect(400);

      expect(res.body.message).to.equal('Title and content are required');
    });

    it('should return 400 if content is missing on update', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'No content' })
        .expect(400);

      expect(res.body.message).to.equal('Title and content are required');
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/notes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', content: '<p>Test</p>' })
        .expect(404);

      expect(res.body.message).to.equal('Note not found');
    });

    it('should return 400 for invalid note id format', async () => {
      const res = await request(app)
        .put('/api/notes/not-a-valid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', content: '<p>Test</p>' })
        .expect(400);

      expect(res.body.message).to.equal('Invalid Note ID');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .put(`/api/notes/${noteId}`)
        .send({ title: 'Test', content: '<p>Test</p>' })
        .expect(401);
    });

    it('should not allow updating another users note', async () => {
      const otherUser = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Other', email: 'other@test.com', password: 'pass123' });

      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${otherUser.body.token}`)
        .send({ title: 'Hacked', content: '<p>Hacked</p>' })
        .expect(404);

      expect(res.body.message).to.equal('Note not found');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note successfully', async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).to.equal('Note deleted successfully');
    });

    it('should return 404 for already deleted note', async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.message).to.equal('Note not found');
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/notes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 400 for invalid note id format', async () => {
      const res = await request(app)
        .delete('/api/notes/bad-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.message).to.equal('Invalid Note ID');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .delete(`/api/notes/${noteId}`)
        .expect(401);
    });

    it('should not allow deleting another users note', async () => {
      const newNote = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Dont Delete', content: '<p>Keep me</p>' });

      const otherUser = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Other2', email: 'other2@test.com', password: 'pass123' });

      const res = await request(app)
        .delete(`/api/notes/${newNote.body.note._id}`)
        .set('Authorization', `Bearer ${otherUser.body.token}`)
        .expect(404);

      expect(res.body.message).to.equal('Note not found');

      const verify = await request(app)
        .get(`/api/notes/${newNote.body.note._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(verify.body.note.title).to.equal('Dont Delete');
    });
  });
});
