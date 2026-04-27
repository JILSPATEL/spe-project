const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

const services = {
    '/api/auth': process.env.USER_SERVICE_URL || 'http://user-service:5001',
    '/api/seller-auth': process.env.SELLER_SERVICE_URL || 'http://seller-service:5002',
    '/api/products': process.env.PRODUCT_SERVICE_URL || 'http://product-service:5003',
    '/api/cart': process.env.CART_SERVICE_URL || 'http://cart-service:5004',
    '/api/orders': process.env.ORDER_SERVICE_URL || 'http://order-service:5005'
};

Object.entries(services).forEach(([route, target]) => {
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => path, // keep the same path
        onError: (err, req, res) => {
            console.error(`Proxy error for ${route}:`, err);
            res.status(502).json({ message: 'Service unavailable' });
        }
    }));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API Gateway is running' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 API Gateway is running on port ${PORT}\n`);
});
