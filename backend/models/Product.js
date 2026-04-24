const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Product {
    // Get all products
    static async findAll(limit = null) {
        let query = `SELECT id, name, price, category, color, description, image, seller_id, 
                     inventory_count, reserved_quantity, created_at, updated_at,
                     (inventory_count - reserved_quantity) as available_inventory 
                     FROM products ORDER BY created_at DESC`;
        if (limit) {
            query += ` LIMIT ${parseInt(limit)}`;
        }
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get products by category
    static async findByCategory(category) {
        const query = `SELECT id, name, price, category, color, description, image, seller_id, 
                       inventory_count, reserved_quantity, created_at, updated_at,
                       (inventory_count - reserved_quantity) as available_inventory 
                       FROM products WHERE category = ? ORDER BY created_at DESC`;
        const [rows] = await db.execute(query, [category]);
        return rows;
    }

    // Get single product by ID
    static async findById(id) {
        const query = `SELECT id, name, price, category, color, description, image, seller_id, 
                       inventory_count, reserved_quantity, created_at, updated_at,
                       (inventory_count - reserved_quantity) as available_inventory 
                       FROM products WHERE id = ?`;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    // Create new product
    static async create(productData) {
        const { name, price, category, color, description, image, seller_id, inventory_count } = productData;
        const id = uuidv4();

        const query = `
      INSERT INTO products (id, name, price, category, color, description, image, seller_id, inventory_count) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await db.execute(query, [id, name, price, category, color, description, image, seller_id, inventory_count || 0]);

        return { id, ...productData };
    }

    // Get products by seller
    static async findBySellerId(sellerId) {
        const query = `SELECT id, name, price, category, color, description, image, seller_id, 
                       inventory_count, reserved_quantity, created_at, updated_at,
                       (inventory_count - reserved_quantity) as available_inventory 
                       FROM products WHERE seller_id = ? ORDER BY created_at DESC`;
        const [rows] = await db.execute(query, [sellerId]);
        return rows;
    }

    // Update product
    static async update(id, productData, sellerId) {
        const { name, price, category, color, description, image, inventory_count } = productData;

        const query = `
      UPDATE products 
      SET name = ?, price = ?, category = ?, color = ?, description = ?, image = ?, inventory_count = ?
      WHERE id = ? AND seller_id = ?
    `;
        const [result] = await db.execute(query, [name, price, category, color, description, image, inventory_count, id, sellerId]);

        return result.affectedRows > 0;
    }

    // Delete product
    static async delete(id, sellerId) {
        const query = 'DELETE FROM products WHERE id = ? AND seller_id = ?';
        const [result] = await db.execute(query, [id, sellerId]);
        return result.affectedRows > 0;
    }

    // Search products
    static async search(searchQuery) {
        const query = `
      SELECT id, name, price, category, color, description, image, seller_id, 
             inventory_count, reserved_quantity, created_at, updated_at,
             (inventory_count - reserved_quantity) as available_inventory 
      FROM products 
      WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
      ORDER BY created_at DESC
    `;
        const searchPattern = `%${searchQuery}%`;
        const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
        return rows;
    }

    // Get trending products
    static async getTrending(limit = 16) {
        const query = `SELECT id, name, price, category, color, description, image, seller_id, 
                       inventory_count, reserved_quantity, created_at, updated_at,
                       (inventory_count - reserved_quantity) as available_inventory 
                       FROM products ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get popular products
    static async getPopular(limit = 3) {
        const query = `SELECT id, name, price, category, color, description, image, seller_id, 
                       inventory_count, reserved_quantity, created_at, updated_at,
                       (inventory_count - reserved_quantity) as available_inventory 
                       FROM products ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get available inventory (total - reserved)
    static async getAvailableInventory(productId) {
        const query = 'SELECT inventory_count, reserved_quantity FROM products WHERE id = ?';
        const [rows] = await db.execute(query, [productId]);
        if (rows.length === 0) return 0;
        return Math.max(0, rows[0].inventory_count - rows[0].reserved_quantity);
    }

    // Reserve inventory (called when adding to cart)
    static async reserveInventory(productId, quantity) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [rows] = await connection.execute(
                'SELECT inventory_count, reserved_quantity FROM products WHERE id = ? FOR UPDATE',
                [productId]
            );

            if (rows.length === 0) {
                await connection.rollback();
                return false;
            }

            const available = rows[0].inventory_count - rows[0].reserved_quantity;
            if (available < quantity) {
                await connection.rollback();
                return false;
            }

            await connection.execute(
                'UPDATE products SET reserved_quantity = reserved_quantity + ? WHERE id = ?',
                [quantity, productId]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Release inventory (called when removing from cart or cancelling order)
    static async releaseInventory(productId, quantity) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await connection.execute(
                'UPDATE products SET reserved_quantity = GREATEST(0, reserved_quantity - ?) WHERE id = ?',
                [quantity, productId]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Deduct inventory (called when order is placed)
    static async deductInventory(productId, quantity) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [rows] = await connection.execute(
                'SELECT inventory_count, reserved_quantity FROM products WHERE id = ? FOR UPDATE',
                [productId]
            );

            if (rows.length === 0) {
                await connection.rollback();
                return false;
            }

            const available = rows[0].inventory_count - rows[0].reserved_quantity;
            if (available < quantity) {
                await connection.rollback();
                return false;
            }

            await connection.execute(
                'UPDATE products SET inventory_count = inventory_count - ?, reserved_quantity = reserved_quantity - ? WHERE id = ?',
                [quantity, quantity, productId]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Restore inventory (called when order is cancelled)
    static async restoreInventory(productId, quantity) {
        const query = 'UPDATE products SET inventory_count = inventory_count + ? WHERE id = ?';
        const [result] = await db.execute(query, [quantity, productId]);
        return result.affectedRows > 0;
    }
}

module.exports = Product;