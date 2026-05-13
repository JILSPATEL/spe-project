// Mock the database BEFORE any require() calls that use it
jest.mock('../config/database', () => ({
    execute: jest.fn()
}));

const request = require('supertest');
const app = require('../server');

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /api/orders/health', () => {
    it('should return 200 with status OK', async () => {
        const res = await request(app).get('/api/orders/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.message).toMatch(/order-service/i);
    });
});

// ─── Create Order — Auth Required ─────────────────────────────────────────────
describe('POST /api/orders - auth middleware', () => {
    it('should return 401 when no authorization token is provided', async () => {
        const res = await request(app)
            .post('/api/orders')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                address: '123 Test St',
                pincode: '380001',
                contact: '9876543210'
            });
        expect(res.statusCode).toBe(401);
    });
});

// ─── Get My Orders — Auth Required ────────────────────────────────────────────
describe('GET /api/orders/my-orders - auth middleware', () => {
    it('should return 401 when no authorization token is provided', async () => {
        const res = await request(app).get('/api/orders/my-orders');
        expect(res.statusCode).toBe(401);
    });
});

// ─── Create Order Validation ──────────────────────────────────────────────────
describe('POST /api/orders - input validation', () => {
    it('should return 400 when required fields are missing (validation)', async () => {
        // We need a valid JWT to get past auth — use env JWT_SECRET
        const jwt = require('jsonwebtoken');
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
        const token = jwt.sign(
            { id: 'user-1', email: 'test@example.com', type: 'user' },
            process.env.JWT_SECRET
        );

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({}); // missing all required fields

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
    it('should return 404 for unregistered routes', async () => {
        const res = await request(app).get('/api/unknown-xyz');
        expect(res.statusCode).toBe(404);
    });
});
