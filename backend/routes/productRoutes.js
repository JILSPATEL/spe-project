const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const sellerAuth = require('../middleware/sellerAuth');

// Get all products
router.get('/', async (req, res) => {
    try {
        const limit = req.query._limit ? parseInt(req.query._limit) : null;
        const products = await Product.findAll(limit);
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// Get seller's products
router.get('/my-products', sellerAuth, async (req, res) => {
    try {
        const products = await Product.findBySellerId(req.seller.id);
        res.json(products);
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({ message: 'Server error fetching your products' });
    }
});

// Get trending products
router.get('/trending', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 16;
        const products = await Product.getTrending(limit);
        res.json(products);
    } catch (error) {
        console.error('Get trending products error:', error);
        res.status(500).json({ message: 'Server error fetching trending products' });
    }
});

// Get popular products
router.get('/popular', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 3;
        const products = await Product.getPopular(limit);
        res.json(products);
    } catch (error) {
        console.error('Get popular products error:', error);
        res.status(500).json({ message: 'Server error fetching popular products' });
    }
});

// Search products
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const products = await Product.search(q);
        res.json(products);
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ message: 'Server error searching products' });
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.findByCategory(category);
        res.json(products);
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ message: 'Server error fetching products by category' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

// Add new product (seller only)
router.post('/',
    sellerAuth,
    [
        body('name').trim().notEmpty().withMessage('Product name is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('category').notEmpty().withMessage('Category is required'),
        body('description').trim().notEmpty().withMessage('Description is required')
    ],
    async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const productData = {
                ...req.body,
                seller_id: req.seller.id
            };

            const product = await Product.create(productData);
            res.status(201).json({
                message: 'Product added successfully',
                product
            });
        } catch (error) {
            console.error('Add product error:', error);
            res.status(500).json({ message: 'Server error adding product' });
        }
    }
);

// Update product (seller only)
router.put('/:id',
    sellerAuth,
    [
        body('name').trim().notEmpty().withMessage('Product name is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('category').notEmpty().withMessage('Category is required'),
        body('description').trim().notEmpty().withMessage('Description is required')
    ],
    async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const updated = await Product.update(req.params.id, req.body, req.seller.id);
            if (!updated) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product updated successfully' });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ message: 'Server error updating product' });
        }
    }
);

// Delete product (seller only)
router.delete('/:id', sellerAuth, async (req, res) => {
    try {
        const deleted = await Product.delete(req.params.id, req.seller.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
});

module.exports = router;
