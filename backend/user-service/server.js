const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const routes = require('./routes/authRoutes');
app.use('/api/auth', routes);

// Health check
app.get('/api/auth/health', (req, res) => {
    res.json({ status: 'OK', message: 'user-service is running' });
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
    console.log(`\n🚀 ${'user-service'} is running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/auth/health\n`);
});

module.exports = app;
