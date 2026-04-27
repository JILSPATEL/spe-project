const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Seller = require('../models/Seller');

// Seller Registration
router.post('/signup',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password } = req.body;

            // Check if seller already exists
            const existingSeller = await Seller.findByEmail(email);
            if (existingSeller) {
                return res.status(400).json({ message: 'Seller already exists with this email' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create seller
            const seller = await Seller.create({
                name,
                email,
                password: hashedPassword
            });

            // Generate JWT token
            const token = jwt.sign(
                { id: seller.id, email: seller.email, type: 'seller' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'Seller registered successfully',
                seller: { id: seller.id, name: seller.name, email: seller.email },
                token
            });
        } catch (error) {
            console.error('Seller signup error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
);

// Seller Login
router.post('/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find seller
            const seller = await Seller.findByEmail(email);
            if (!seller) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, seller.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: seller.id, email: seller.email, type: 'seller' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login successful',
                seller: { id: seller.id, name: seller.name, email: seller.email },
                token
            });
        } catch (error) {
            console.error('Seller login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

module.exports = router;
