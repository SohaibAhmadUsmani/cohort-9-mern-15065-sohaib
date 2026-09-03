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

after(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  const validUser = { name: 'Test User', email: 'test@example.com', password: 'password123' };

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(validUser)
        .expect(201);

      expect(res.body).to.have.property('token');
      expect(res.body.message).to.equal('User Created Successfully');
    });

    it('should return 400 when all fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({})
        .expect(400);

      expect(res.body.message).to.equal('All fields are required');
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'noname@test.com', password: 'pass123' })
        .expect(400);

      expect(res.body.message).to.equal('All fields are required');
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'No Email', password: 'pass123' })
        .expect(400);

      expect(res.body.message).to.equal('All fields are required');
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'No Pass', email: 'nopass@test.com' })
        .expect(400);

      expect(res.body.message).to.equal('All fields are required');
    });

    it('should return 400 for invalid field types', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 123, email: 'test2@test.com', password: 'pass' })
        .expect(400);

      expect(res.body.message).to.equal('Invalid field types');
    });

    it('should return 400 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(validUser)
        .expect(400);

      expect(res.body.message).to.equal('User Already Exists');
    });

    it('should return 400 when password exceeds 72 bytes', async () => {
      const longPassword = 'a'.repeat(73);
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Long Pass', email: 'longpass@test.com', password: longPassword })
        .expect(400);

      expect(res.body.message).to.equal('Password must be at most 72 bytes');
    });

    it('should lowercase and trim email before saving', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Trim Test', email: '  TRIM@test.com  ', password: 'pass123' })
        .expect(201);

      const user = await User.findOne({ email: 'trim@test.com' });
      expect(user).to.not.be.null;
      expect(user.email).to.equal('trim@test.com');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(res.body).to.have.property('token');
      expect(res.body.message).to.equal('User Logged In Successfully');
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);

      expect(res.body.message).to.equal('Email and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(res.body.message).to.equal('Email and password are required');
    });

    it('should return 400 when both fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(res.body.message).to.equal('Email and password are required');
    });

    it('should return 400 for invalid field types', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 123, password: 456 })
        .expect(400);

      expect(res.body.message).to.equal('Invalid field types');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).to.equal('Invalid Credentials');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' })
        .expect(401);

      expect(res.body.message).to.equal('Invalid Credentials');
    });

    it('should lowercase email before lookup', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'TEST@EXAMPLE.COM', password: validUser.password })
        .expect(200);

      expect(res.body).to.have.property('token');
    });
  });

  describe('GET /api/auth/me', () => {
    before(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });
      token = res.body.token;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.user).to.have.property('email', validUser.email);
      expect(res.body.user).to.not.have.property('password');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.message).to.equal('Access Denied');
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.message).to.equal('Invalid Token');
    });

    it('should return 401 with malformed header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'NotBearer sometoken')
        .expect(401);
      expect(res.body.message).to.equal('Invalid Token');
    });

    it('should return 401 when user is deleted after token issued', async () => {
      const tempUser = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Temp', email: 'temp@test.com', password: 'pass123' });

      const tempToken = tempUser.body.token;

      await User.deleteOne({ email: 'temp@test.com' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tempToken}`)
        .expect(401);

      expect(res.body.message).to.equal('Invalid Token');
    });
  });
});
