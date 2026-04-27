const { pool } = require('../config/db');

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.name as user_name 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.deleted_at IS NULL
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM transactions t 
      WHERE t.deleted_at IS NULL
    `;
    const params = [];
    const countParams = [];

    // Role-based filtering
    if (req.user.role !== 'admin') {
      query += ' AND t.user_id = ?';
      countQuery += ' AND t.user_id = ?';
      params.push(req.user.id);
      countParams.push(req.user.id);
    }

    if (startDate) {
      query += ' AND t.date >= ?';
      countQuery += ' AND t.date >= ?';
      params.push(startDate);
      countParams.push(startDate);
    }

    if (endDate) {
      query += ' AND t.date <= ?';
      countQuery += ' AND t.date <= ?';
      params.push(endDate);
      countParams.push(endDate);
    }

    if (type) {
      query += ' AND t.type = ?';
      countQuery += ' AND t.type = ?';
      params.push(type);
      countParams.push(type);
    }

    if (category) {
      query += ' AND t.category = ?';
      countQuery += ' AND t.category = ?';
      params.push(category);
      countParams.push(category);
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [transactions] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ message: 'Type, amount, category, dan date wajib diisi.' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type harus income atau expense.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount harus lebih dari 0.' });
    }

    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, type, amount, category, description || '', date]
    );

    const [newTransaction] = await pool.query(
      'SELECT t.*, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Transaksi berhasil ditambahkan.',
      transaction: newTransaction[0],
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    // Check ownership and if not deleted
    const [existing] = await pool.query('SELECT * FROM transactions WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan atau sudah dihapus.' });
    }

    if (req.user.role !== 'admin' && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke transaksi ini.' });
    }

    const fields = [];
    const values = [];

    if (type) { fields.push('type = ?'); values.push(type); }
    if (amount) { fields.push('amount = ?'); values.push(amount); }
    if (category) { fields.push('category = ?'); values.push(category); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (date) { fields.push('date = ?'); values.push(date); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    }

    values.push(id);
    await pool.query(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(
      'SELECT t.*, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.id = ?',
      [id]
    );

    res.json({
      message: 'Transaksi berhasil diperbarui.',
      transaction: updated[0],
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership and if not deleted
    const [existing] = await pool.query('SELECT * FROM transactions WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan atau sudah dihapus.' });
    }

    if (req.user.role !== 'admin' && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke transaksi ini.' });
    }

    // Soft delete: set deleted_at to current timestamp
    await pool.query('UPDATE transactions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'Transaksi berhasil dihapus.' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
