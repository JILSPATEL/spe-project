const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/auth');
const sellerAuthMiddleware = require('../middleware/sellerAuth');
const { body, validationResult } = require('express-validator');

// Create new order
router.post(
    '/',
    authMiddleware,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('address').trim().notEmpty().withMessage('Address is required'),
        body('pincode').isNumeric().withMessage('Valid pincode is required'),
        body('contact').trim().notEmpty().withMessage('Contact is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const userId = req.user.id;
            const { name, email, address, pincode, contact } = req.body;

            // Get cart items
            const cartItems = await Cart.getCartItems(userId);

            if (cartItems.length === 0) {
                return res.status(400).json({ message: 'Cart is empty' });
            }

            // Calculate total
            const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Create order
            const orderData = {
                userId,
                name,
                email,
                address,
                pincode,
                contact,
                totalPrice,
                items: cartItems,
            };

            const { orderId } = await Order.create(orderData);

            // Clear cart
            await Cart.clearCart(userId);

            res.status(201).json({
                message: 'Order placed successfully',
                orderId,
            });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({ message: 'Server error creating order' });
        }
    }
);

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.getByUser(userId);
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// Get single order details
router.get('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.getById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order belongs to user
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error fetching order' });
    }
});

// Get seller's orders
router.get('/seller/all', sellerAuthMiddleware, async (req, res) => {
    try {
        const orders = await Order.findBySellerId(req.seller.id);
        res.json(orders);
    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// Update order status (seller only)
router.put('/:orderId/status', sellerAuthMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updated = await Order.updateStatus(orderId, status);

        if (!updated) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error updating order' });
    }
});

// Cancel order (user only)
router.put('/:orderId/cancel', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.getById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user_id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (['Delivered', 'Cancelled'].includes(order.order_status)) {
            return res.status(400).json({ message: 'Order cannot be cancelled' });
        }

        const updated = await Order.updateStatus(orderId, 'Cancelled');

        if (updated) {
            res.json({ message: 'Order cancelled successfully' });
        } else {
            res.status(500).json({ message: 'Failed to cancel order' });
        }
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Server error cancelling order' });
    }
});

module.exports = router;
