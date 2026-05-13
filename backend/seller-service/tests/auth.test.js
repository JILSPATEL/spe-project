// Mock the database BEFORE any require() calls that use it
jest.mock('../config/database', () => ({
    execute: jest.fn()
}));

const request = require('supertest');
const app = require('../server');

// ─── Health Check ────────────────────────────────────────────────────────────
describe('GET /api/seller-auth/health', () => {
    it('should return 200 with status OK', async () => {
        const res = await request(app).get('/api/seller-auth/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.message).toMatch(/seller-service/i);
    });
});

// ─── Signup Validation ────────────────────────────────────────────────────────
describe('POST /api/seller-auth/signup - validation', () => {
    it('should return 400 when name is missing', async () => {
        const res = await request(app)
            .post('/api/seller-auth/signup')
            .send({ email: 'seller@example.com', password: 'password123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when email is invalid', async () => {
        const res = await request(app)
            .post('/api/seller-auth/signup')
            .send({ name: 'Test Seller', email: 'not-an-email', password: 'password123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when password is too short', async () => {
        const res = await request(app)
            .post('/api/seller-auth/signup')
            .send({ name: 'Test Seller', email: 'seller@example.com', password: '123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});

// ─── Login Validation ─────────────────────────────────────────────────────────
describe('POST /api/seller-auth/login - validation', () => {
    it('should return 400 when email is invalid', async () => {
        const res = await request(app)
            .post('/api/seller-auth/login')
            .send({ email: 'bad-email', password: 'password123' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/seller-auth/login')
            .send({ email: 'seller@example.com' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should return 401 when seller does not exist', async () => {
        const db = require('../config/database');
        db.execute.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post('/api/seller-auth/login')
            .send({ email: 'nonexistent@example.com', password: 'password123' });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/invalid email or password/i);
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
    it('should return 404 for unregistered routes', async () => {
        const res = await request(app).get('/api/seller-auth/unknown-route-xyz');
        expect(res.statusCode).toBe(404);
    });
});
