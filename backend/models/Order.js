const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Order {
    // Create new order
    static async create(orderData) {
        const { userId, name, email, address, pincode, contact, totalPrice, items } = orderData;
        const orderId = uuidv4();

        // Insert order
        const orderQuery = `
      INSERT INTO orders (id, user_id, name, email, address, pincode, contact, total_price, order_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `;
        await db.execute(orderQuery, [orderId, userId, name, email, address, pincode, contact, totalPrice]);

        // Insert order items
        for (const item of items) {
            const itemId = uuidv4();
            const itemQuery = `
        INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
            await db.execute(itemQuery, [itemId, orderId, item.product_id, item.name, item.price, item.quantity]);
        }

        return { orderId };
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

    // Get order items
    static async getOrderItems(orderId) {
        const query = 'SELECT * FROM order_items WHERE order_id = ?';
        const [rows] = await db.execute(query, [orderId]);
        return rows;
    }
}

module.exports = Order;
