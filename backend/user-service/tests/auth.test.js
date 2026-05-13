// Mock the database BEFORE any require() calls that use it
jest.mock('../config/database', () => ({
    execute: jest.fn()
}));

const request = require('supertest');
const app = require('../server');

// ─── Health Check ────────────────────────────────────────────────────────────
describe('GET /api/auth/health', () => {
    it('should return 200 with status OK', async () => {
        const res = await request(app).get('/api/auth/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.message).toMatch(/user-service/i);
    });
});

// ─── Signup Validation ────────────────────────────────────────────────────────
describe('POST /api/auth/signup - validation', () => {
    it('should return 400 when name is missing', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'test@example.com', password: 'password123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when email is invalid', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Test User', email: 'not-an-email', password: 'password123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when password is too short', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Test User', email: 'test@example.com', password: '123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});

// ─── Login Validation ─────────────────────────────────────────────────────────
describe('POST /api/auth/login - validation', () => {
    it('should return 400 when email is invalid', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bad-email', password: 'password123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should return 401 when user does not exist', async () => {
        // Mock User.findByEmail to return null (user not found)
        const db = require('../config/database');
        db.execute.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nonexistent@example.com', password: 'password123' });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/invalid email or password/i);
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
    it('should return 404 for unregistered routes', async () => {
        const res = await request(app).get('/api/auth/unknown-route-xyz');
        expect(res.statusCode).toBe(404);
    });
});
