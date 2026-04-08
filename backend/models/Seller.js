const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Seller {
    // Create new seller
    static async create(sellerData) {
        const { name, email, password } = sellerData;
        const id = uuidv4();

        const query = 'INSERT INTO sellers (id, name, email, password) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(query, [id, name, email, password]);

        return { id, name, email };
    }

    // Find seller by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM sellers WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    }

    // Find seller by ID
    static async findById(id) {
        const query = 'SELECT id, name, email, created_at FROM sellers WHERE id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    // Check if email exists
    static async emailExists(email) {
        const query = 'SELECT id FROM sellers WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows.length > 0;
    }
}

module.exports = Seller;
