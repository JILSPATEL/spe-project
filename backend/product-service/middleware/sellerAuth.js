const jwt = require('jsonwebtoken');

const sellerAuthMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user is a seller
        if (decoded.type !== 'seller') {
            return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
        }

        req.seller = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = sellerAuthMiddleware;
