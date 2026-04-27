const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Product = require('./Product');

class Cart {
    // Get cart items for a user
    static async getCartItems(userId) {
        const query = `
      SELECT c.id, c.quantity, c.product_id,
             p.name, p.price, p.category, p.color, p.description, p.image,
             p.inventory_count, p.reserved_quantity,
             (p.inventory_count - p.reserved_quantity) as available_inventory
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;
        const [rows] = await db.execute(query, [userId]);
        return rows;
    }

    // Add item to cart
    static async addItem(userId, productId, quantity = 1) {
        const [productRows] = await db.execute(
            'SELECT inventory_count, reserved_quantity FROM products WHERE id = ?',
            [productId]
        );

        if (productRows.length === 0) {
            throw new Error('Product not found');
        }

        const available = productRows[0].inventory_count - productRows[0].reserved_quantity;
        const checkQuery = 'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?';
        const [existing] = await db.execute(checkQuery, [userId, productId]);
        const currentQtyInCart = existing.length > 0 ? existing[0].quantity : 0;
        
        if (available < quantity + currentQtyInCart) {
            throw new Error(`Only ${available} items available in stock`);
        }

        const reserved = await Product.reserveInventory(productId, quantity);
        if (!reserved) {
            throw new Error('Failed to reserve inventory');
        }

        const id = uuidv4();

        if (existing.length > 0) {
            const newQuantity = existing[0].quantity + quantity;
            const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
            await db.execute(updateQuery, [newQuantity, existing[0].id]);
            return { id: existing[0].id, updated: true };
        } else {
            const insertQuery = 'INSERT INTO cart (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)';
            await db.execute(insertQuery, [id, userId, productId, quantity]);
            return { id, updated: false };
        }
    }

    // Update cart item quantity
    static async updateQuantity(cartId, quantity, userId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [cartItems] = await connection.execute(
                'SELECT product_id, quantity FROM cart WHERE id = ? AND user_id = ?',
                [cartId, userId]
            );

            if (cartItems.length === 0) {
                await connection.rollback();
                return false;
            }

            const oldQuantity = cartItems[0].quantity;
            const productId = cartItems[0].product_id;

            const [productRows] = await connection.execute(
                'SELECT inventory_count, reserved_quantity FROM products WHERE id = ?',
                [productId]
            );

            const available = productRows[0].inventory_count - productRows[0].reserved_quantity;
            
            if (available + oldQuantity < quantity) {
                await connection.rollback();
                throw new Error(`Only ${available + oldQuantity} items available in stock`);
            }

            const quantityDiff = quantity - oldQuantity;
            if (quantityDiff > 0) {
                await Product.reserveInventory(productId, quantityDiff);
            } else if (quantityDiff < 0) {
                await Product.releaseInventory(productId, Math.abs(quantityDiff));
            }

            const query = 'UPDATE cart SET quantity = ? WHERE id = ?';
            await connection.execute(query, [quantity, cartId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Remove item from cart
    static async removeItem(cartId, userId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [cartItems] = await connection.execute(
                'SELECT product_id, quantity FROM cart WHERE id = ? AND user_id = ?',
                [cartId, userId]
            );

            if (cartItems.length > 0) {
                await Product.releaseInventory(cartItems[0].product_id, cartItems[0].quantity);
            }

            const query = 'DELETE FROM cart WHERE id = ?';
            const [result] = await connection.execute(query, [cartId]);

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Clear user's cart
    static async clearCart(userId, releaseInventory = true) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            if (releaseInventory) {
                const [cartItems] = await connection.execute(
                    'SELECT product_id, quantity FROM cart WHERE user_id = ?',
                    [userId]
                );

                for (const item of cartItems) {
                    await Product.releaseInventory(item.product_id, item.quantity);
                }
            }

            const query = 'DELETE FROM cart WHERE user_id = ?';
            const [result] = await connection.execute(query, [userId]);

            await connection.commit();
            return result.affectedRows;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get cart count for user
    static async getCartCount(userId) {
        const query = 'SELECT SUM(quantity) as count FROM cart WHERE user_id = ?';
        const [rows] = await db.execute(query, [userId]);
        return rows[0].count || 0;
    }
}

module.exports = Cart;
