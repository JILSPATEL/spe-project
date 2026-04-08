const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Cart {
    // Get cart items for a user
    static async getCartItems(userId) {
        const query = `
      SELECT c.id, c.quantity, c.product_id,
             p.name, p.price, p.category, p.color, p.description, p.image
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;
        const [rows] = await db.execute(query, [userId]);
        return rows;
    }

    // Add item to cart
    static async addItem(userId, productId, quantity = 1) {
        const id = uuidv4();

        // Check if item already exists in cart
        const checkQuery = 'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?';
        const [existing] = await db.execute(checkQuery, [userId, productId]);

        if (existing.length > 0) {
            // Update quantity if item exists
            const newQuantity = existing[0].quantity + quantity;
            const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
            await db.execute(updateQuery, [newQuantity, existing[0].id]);
            return { id: existing[0].id, updated: true };
        } else {
            // Add new item
            const insertQuery = 'INSERT INTO cart (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)';
            await db.execute(insertQuery, [id, userId, productId, quantity]);
            return { id, updated: false };
        }
    }

    // Update cart item quantity
    static async updateQuantity(cartId, quantity) {
        const query = 'UPDATE cart SET quantity = ? WHERE id = ?';
        const [result] = await db.execute(query, [quantity, cartId]);
        return result.affectedRows > 0;
    }

    // Remove item from cart
    static async removeItem(cartId) {
        const query = 'DELETE FROM cart WHERE id = ?';
        const [result] = await db.execute(query, [cartId]);
        return result.affectedRows > 0;
    }

    // Clear user's cart
    static async clearCart(userId) {
        const query = 'DELETE FROM cart WHERE user_id = ?';
        const [result] = await db.execute(query, [userId]);
        return result.affectedRows;
    }

    // Get cart count for user
    static async getCartCount(userId) {
        const query = 'SELECT SUM(quantity) as count FROM cart WHERE user_id = ?';
        const [rows] = await db.execute(query, [userId]);
        return rows[0].count || 0;
    }
}

module.exports = Cart;
