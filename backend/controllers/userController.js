const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );
    res.status(201).json({ message: 'User berhasil ditambahkan.' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id && role && role !== req.user.role) {
      return res.status(400).json({ message: 'Anda tidak bisa mengubah role sendiri.' });
    }

    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (role) { fields.push('role = ?'); values.push(role); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    }

    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'User berhasil diperbarui.' });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email sudah digunakan.' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Anda tidak bisa menghapus akun sendiri.' });
    }

    // Soft delete with email modification to prevent unique constraint issues
    const deleteEmailPrefix = `deleted_${Date.now()}_`;
    const [result] = await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, email = CONCAT(?, email) WHERE id = ?', 
      [deleteEmailPrefix, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan atau sudah dihapus.' });
    }

    res.json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
