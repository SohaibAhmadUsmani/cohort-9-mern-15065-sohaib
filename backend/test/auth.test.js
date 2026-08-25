const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const User = require('../src/models/user');

let app, token;

before(async () => {
  process.env.JWT_SECRET = 'test-secret-key';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/notes_test');
  }
  await User.deleteMany({});
  app = require('../src/app');
});

describe('Auth API', () => {
  const testUser = { name: 'Test User', email: 'test@example.com', password: 'password123' };

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(res.body).to.have.property('token');
      expect(res.body.message).to.equal('User Created Successfully');
    });

    it('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Test' })
        .expect(400);

      expect(res.body.message).to.equal('All fields are required');
    });

    it('should return 400 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(400);

      expect(res.body.message).to.equal('User Already Exists');
    });

    it('should return 400 for invalid field types', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 123, email: 'test2@test.com', password: 'pass' })
        .expect(400);

      expect(res.body.message).to.equal('Invalid field types');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body).to.have.property('token');
      expect(res.body.message).to.equal('User Logged In Successfully');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).to.equal('Invalid Credentials');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);

      expect(res.body.message).to.equal('Email and password are required');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' })
        .expect(401);

      expect(res.body.message).to.equal('Invalid Credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    before(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      token = res.body.token;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.user).to.have.property('email', testUser.email);
      expect(res.body.user).to.not.have.property('password');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
