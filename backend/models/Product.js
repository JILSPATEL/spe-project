const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Product {
    // Get all products
    static async findAll(limit = null) {
        let query = 'SELECT * FROM products ORDER BY created_at DESC';
        if (limit) {
            query += ` LIMIT ${parseInt(limit)}`;
        }
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get products by category
    static async findByCategory(category) {
        const query = 'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC';
        const [rows] = await db.execute(query, [category]);
        return rows;
    }

    // Get single product by ID
    static async findById(id) {
        const query = 'SELECT * FROM products WHERE id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    // Create new product
    static async create(productData) {
        const { name, price, category, color, description, image, seller_id } = productData;
        const id = uuidv4();

        const query = `
      INSERT INTO products (id, name, price, category, color, description, image, seller_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await db.execute(query, [id, name, price, category, color, description, image, seller_id]);

        return { id, ...productData };
    }

    // Get products by seller
    static async findBySellerId(sellerId) {
        const query = 'SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC';
        const [rows] = await db.execute(query, [sellerId]);
        return rows;
    }

    // Update product
    static async update(id, productData, sellerId) {
        const { name, price, category, color, description, image } = productData;

        const query = `
      UPDATE products 
      SET name = ?, price = ?, category = ?, color = ?, description = ?, image = ?
      WHERE id = ? AND seller_id = ?
    `;
        const [result] = await db.execute(query, [name, price, category, color, description, image, id, sellerId]);

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
      SELECT * FROM products 
      WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
      ORDER BY created_at DESC
    `;
        const searchPattern = `%${searchQuery}%`;
        const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
        return rows;
    }

    // Get trending products
    static async getTrending(limit = 16) {
        const query = `SELECT * FROM products ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get popular products
    static async getPopular(limit = 3) {
        // For now, just return recent products
        // In a real app, this would be based on sales/views
        const query = `SELECT * FROM products ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
        const [rows] = await db.execute(query);
        return rows;
    }
}

module.exports = Product;
