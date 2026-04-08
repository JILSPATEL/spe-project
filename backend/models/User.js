const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class User {
    // Create new user
    static async create(userData) {
        const { name, email, password } = userData;
        const id = uuidv4();

        const query = 'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(query, [id, name, email, password]);

        return { id, name, email };
    }

    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const query = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    // Check if email exists
    static async emailExists(email) {
        const query = 'SELECT id FROM users WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows.length > 0;
    }
}

module.exports = User;
