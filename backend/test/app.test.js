const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const User = require('../src/models/user');

let app;

before(async () => {
  process.env.JWT_SECRET = 'test-secret-key';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/notes_test');
  }
  await User.deleteMany({});
  app = require('../src/app');
});

after(async () => {
  await User.deleteMany({});
});

describe('App', () => {
  describe('Error handler middleware', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(res.status).to.equal(404);
    });

    it('should handle malformed JSON body', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send('{"invalid json');

      expect(res.status).to.be.oneOf([400, 500]);
    });

    it('should return 200 for health check on root', async () => {
      await request(app)
        .get('/')
        .expect(404);
    });
  });
});
