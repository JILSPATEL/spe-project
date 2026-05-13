// Mock the database BEFORE any require() calls that use it
jest.mock('../config/database', () => ({
    execute: jest.fn()
}));

const request = require('supertest');
const app = require('../server');

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /api/cart/health', () => {
    it('should return 200 with status OK', async () => {
        const res = await request(app).get('/api/cart/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.message).toMatch(/cart-service/i);
    });
});

// ─── Add To Cart — Auth Required ──────────────────────────────────────────────
describe('POST /api/cart - auth middleware', () => {
    it('should return 401 when no authorization token is provided', async () => {
        const res = await request(app)
            .post('/api/cart')
            .send({ productId: 'p1', quantity: 2 });
        expect(res.statusCode).toBe(401);
    });
});

// ─── Get Cart — Auth Required ─────────────────────────────────────────────────
describe('GET /api/cart - auth middleware', () => {
    it('should return 401 when no authorization token is provided', async () => {
        const res = await request(app).get('/api/cart');
        expect(res.statusCode).toBe(401);
    });
});

// ─── Update Cart — Auth Required ──────────────────────────────────────────────
describe('PUT /api/cart/:cartId - auth middleware', () => {
    it('should return 401 when no authorization token is provided', async () => {
        const res = await request(app)
            .put('/api/cart/some-cart-id')
            .send({ quantity: 3 });
        expect(res.statusCode).toBe(401);
    });
});

// ─── Delete Cart Item — Auth Required ────────────────────────────────────────
describe('DELETE /api/cart/:cartId - auth middleware', () => {
    it('should return 401 when no authorization token is provided', async () => {
        const res = await request(app).delete('/api/cart/some-cart-id');
        expect(res.statusCode).toBe(401);
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
    it('should return 404 for unregistered routes', async () => {
        const res = await request(app).get('/api/unknown-xyz');
        expect(res.statusCode).toBe(404);
    });
});
