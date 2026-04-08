const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based pool
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check your database credentials.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Please create the database first.');
    }
  } else {
    console.log('✓ MySQL Database connected successfully');
    connection.release();
  }
});

module.exports = promisePool;
