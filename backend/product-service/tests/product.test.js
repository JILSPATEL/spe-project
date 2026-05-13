// Mock the database BEFORE any require() calls that use it
jest.mock('../config/database', () => ({
    execute: jest.fn()
}));

const request = require('supertest');
const app = require('../server');

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /api/products/health', () => {
    it('should return 200 with status OK', async () => {
        const res = await request(app).get('/api/products/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.message).toMatch(/product-service/i);
    });
});

// ─── Get All Products ─────────────────────────────────────────────────────────
describe('GET /api/products', () => {
    it('should return 200 with an array of products', async () => {
        const db = require('../config/database');
        const mockProducts = [
            { id: 'p1', name: 'Laptop', price: 999.99, category: 'Electronics' },
            { id: 'p2', name: 'Phone', price: 499.99, category: 'Electronics' }
        ];
        db.execute.mockResolvedValueOnce([mockProducts]);

        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

// ─── Search Products ──────────────────────────────────────────────────────────
describe('GET /api/products/search', () => {
    it('should return 400 when query param is missing', async () => {
        const res = await request(app).get('/api/products/search');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/search query is required/i);
    });

    it('should return 200 with results when query is provided', async () => {
        const db = require('../config/database');
        const mockResults = [{ id: 'p1', name: 'Laptop', price: 999.99 }];
        db.execute.mockResolvedValueOnce([mockResults]);

        const res = await request(app).get('/api/products/search?q=laptop');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

// ─── Get Product By ID ────────────────────────────────────────────────────────
describe('GET /api/products/:id', () => {
    it('should return 404 when product does not exist', async () => {
        const db = require('../config/database');
        // findById returns empty, getAvailableInventory not called
        db.execute.mockResolvedValueOnce([[]]); // Product.findById → no rows

        const res = await request(app).get('/api/products/nonexistent-id');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/product not found/i);
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
    it('should return 404 for unregistered routes', async () => {
        const res = await request(app).get('/api/unknown-xyz');
        expect(res.statusCode).toBe(404);
    });
});
