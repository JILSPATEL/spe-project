const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/auth');

// Get user's cart items
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await Cart.getCartItems(userId);
        res.json(cartItems);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Server error fetching cart' });
    }
});

// Add item to cart
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const result = await Cart.addItem(userId, productId, quantity || 1);
        res.status(201).json({
            message: result.updated ? 'Cart updated' : 'Item added to cart',
            cartItemId: result.id
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error adding to cart' });
    }
});

// Update cart item quantity
router.put('/:cartId', authMiddleware, async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Valid quantity is required' });
        }

        const updated = await Cart.updateQuantity(cartId, quantity);
        if (!updated) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({ message: 'Cart updated successfully' });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Server error updating cart' });
    }
});

// Remove item from cart
router.delete('/:cartId', authMiddleware, async (req, res) => {
    try {
        const { cartId } = req.params;
        const removed = await Cart.removeItem(cartId);

        if (!removed) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Server error removing item' });
    }
});

// Clear cart
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Cart.clearCart(userId);
        res.json({ message: 'Cart cleared', itemsRemoved: count });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Server error clearing cart' });
    }
});

// Get cart count
router.get('/count', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Cart.getCartCount(userId);
        res.json({ count });
    } catch (error) {
        console.error('Get cart count error:', error);
        res.status(500).json({ message: 'Server error getting cart count' });
    }
});

module.exports = router;
