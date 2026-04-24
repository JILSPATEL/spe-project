const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Product = require('./Product');

class Order {
    // Create new order
    static async create(orderData) {
        const { userId, name, email, address, pincode, contact, totalPrice, items } = orderData;
        const orderId = uuidv4();

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            for (const item of items) {
                const deducted = await Product.deductInventory(item.product_id, item.quantity);
                if (!deducted) {
                    throw new Error(`Insufficient inventory for product: ${item.name}`);
                }
            }

            const orderQuery = `
          INSERT INTO orders (id, user_id, name, email, address, pincode, contact, total_price, order_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `;
            await connection.execute(orderQuery, [orderId, userId, name, email, address, pincode, contact, totalPrice]);

            for (const item of items) {
                const itemId = uuidv4();
                const itemQuery = `
            INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
                await connection.execute(itemQuery, [itemId, orderId, item.product_id, item.name, item.price, item.quantity]);
            }

            await connection.commit();
            return { orderId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get orders by user
    static async getByUser(userId) {
        const query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
        const [orders] = await db.execute(query, [userId]);

        for (const order of orders) {
            const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ?';
            const [items] = await db.execute(itemsQuery, [order.id]);
            order.items = items;
        }

        return orders;
    }

    // Get orders containing seller's products
    static async findBySellerId(sellerId) {
        const query = `
            SELECT DISTINCT o.*, u.name as user_name
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE p.seller_id = ?
            ORDER BY o.created_at DESC
        `;
        const [orders] = await db.execute(query, [sellerId]);

        // For each order, only return items belonging to this seller
        for (const order of orders) {
            const itemsQuery = `
                SELECT oi.* 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ? AND p.seller_id = ?
            `;
            const [items] = await db.execute(itemsQuery, [order.id, sellerId]);
            order.items = items;

            // Recalculate total for just this seller's items (optional, but good for display)
            // order.seller_total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        return orders;
    }

    // Get order by ID with items
    static async getById(orderId) {
        const orderQuery = 'SELECT * FROM orders WHERE id = ?';
        const [orderRows] = await db.execute(orderQuery, [orderId]);

        if (orderRows.length === 0) {
            return null;
        }

        const order = orderRows[0];

        // Get order items
        const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ?';
        const [items] = await db.execute(itemsQuery, [orderId]);

        order.items = items;
        return order;
    }

    // Update order status
    static async updateStatus(orderId, status) {
        const query = 'UPDATE orders SET order_status = ? WHERE id = ?';
        const [result] = await db.execute(query, [status, orderId]);
        return result.affectedRows > 0;
    }

    // Cancel order and restore inventory
    static async cancelOrder(orderId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [orderRows] = await connection.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
            if (orderRows.length === 0) {
                await connection.rollback();
                return false;
            }

            const order = orderRows[0];
            if (['Delivered', 'Cancelled'].includes(order.order_status)) {
                await connection.rollback();
                return false;
            }

            const [items] = await connection.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

            for (const item of items) {
                await Product.restoreInventory(item.product_id, item.quantity);
            }

            await connection.execute('UPDATE orders SET order_status = ? WHERE id = ?', ['Cancelled', orderId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get order items
    static async getOrderItems(orderId) {
        const query = 'SELECT * FROM order_items WHERE order_id = ?';
        const [rows] = await db.execute(query, [orderId]);
        return rows;
    }
}

module.exports = Order;
