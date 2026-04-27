const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const routes = require('./routes/productRoutes');
app.use('/api/products', routes);

// Health check
app.get('/api/products/health', (req, res) => {
    res.json({ status: 'OK', message: 'product-service is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 ${'product-service'} is running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/products/health\n`);
});

module.exports = app;
