const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
});

async function initDatabase() {
  // Create database if not exists
  const tempPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false },
  });

  await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await tempPool.end();

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      INDEX idx_email (email),
      INDEX idx_role (role)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type ENUM('income', 'expense') NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_type (type),
      INDEX idx_date (date)
    )
  `);

  // Seed admin if not exists
  const [admins] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@gmail.com']);
  if (admins.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Administrator', 'admin@gmail.com', hashedPassword, 'admin']
    );
    console.log('✅ Admin default berhasil dibuat (admin@gmail.com / admin123)');
  }

  console.log('✅ Database berhasil diinisialisasi');
}

module.exports = { pool, initDatabase };
