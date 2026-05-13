const request = require('supertest');
const app = require('../server');

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
    it('should return 200 with status OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.message).toMatch(/api gateway/i);
    });
});

// ─── Proxy Routes Are Mounted ─────────────────────────────────────────────────
// The gateway proxies to downstream services. In unit tests without those
// services running, the proxy will throw a 502 (target unreachable).
// This confirms the routes are mounted and handled (not a 404).
describe('Proxy routes - mounted check', () => {
    it('/api/auth/* should be proxied (not return 404)', async () => {
        const res = await request(app).get('/api/auth/health');
        // 502 = proxy mounted but target down (expected in unit test)
        // Anything except 404 confirms the route is registered
        expect(res.statusCode).not.toBe(404);
    });

    it('/api/products/* should be proxied (not return 404)', async () => {
        const res = await request(app).get('/api/products/');
        expect(res.statusCode).not.toBe(404);
    });

    it('/api/cart/* should be proxied (not return 404)', async () => {
        const res = await request(app).get('/api/cart/');
        expect(res.statusCode).not.toBe(404);
    });

    it('/api/orders/* should be proxied (not return 404)', async () => {
        const res = await request(app).get('/api/orders/');
        expect(res.statusCode).not.toBe(404);
    });
});
