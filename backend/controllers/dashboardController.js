const { pool } = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userFilter = isAdmin ? '' : 'WHERE user_id = ?';
    const params = isAdmin ? [] : [req.user.id];

    // Total income
    const [incomeResult] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions ${userFilter} ${userFilter ? 'AND' : 'WHERE'} type = 'income' AND deleted_at IS NULL`,
      params
    );

    // Total expense
    const [expenseResult] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions ${userFilter} ${userFilter ? 'AND' : 'WHERE'} type = 'expense' AND deleted_at IS NULL`,
      params
    );

    // Recent transactions
    const [recentTransactions] = await pool.query(
      `SELECT t.*, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id ${userFilter ? 'WHERE t.user_id = ? AND t.deleted_at IS NULL' : 'WHERE t.deleted_at IS NULL'} ORDER BY t.date DESC, t.created_at DESC LIMIT 5`,
      params
    );

    // Transaction count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM transactions ${userFilter} ${userFilter ? 'AND' : 'WHERE'} deleted_at IS NULL`,
      params
    );

    const totalIncome = parseFloat(incomeResult[0].total);
    const totalExpense = parseFloat(expenseResult[0].total);

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalTransactions: countResult[0].total,
      recentTransactions,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.getChartData = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userFilter = isAdmin ? '' : 'AND user_id = ?';
    const params = isAdmin ? [] : [req.user.id];

    // Monthly data for the last 12 months
    const [monthlyData] = await pool.query(
      `SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND deleted_at IS NULL ${userFilter}
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC`,
      params
    );

    // Category breakdown
    const [categoryData] = await pool.query(
      `SELECT 
        category,
        type,
        SUM(amount) as total
      FROM transactions 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND deleted_at IS NULL ${userFilter}
      GROUP BY category, type
      ORDER BY total DESC`,
      params
    );

    res.json({ monthlyData, categoryData });
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const isAdmin = req.user.role === 'admin';
    const userFilter = isAdmin ? '' : 'AND t.user_id = ?';
    const params = [];

    if (!year || !month) {
      return res.status(400).json({ message: 'Parameter year dan month wajib diisi.' });
    }

    params.push(parseInt(year), parseInt(month));
    if (!isAdmin) params.push(req.user.id);

    // Daily breakdown for the month
    const [dailyData] = await pool.query(
      `SELECT 
        DATE_FORMAT(t.date, '%Y-%m-%d') as date,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as expense
      FROM transactions t
      WHERE YEAR(t.date) = ? AND MONTH(t.date) = ? AND t.deleted_at IS NULL ${userFilter}
      GROUP BY DATE_FORMAT(t.date, '%Y-%m-%d')
      ORDER BY date ASC`,
      params
    );

    // Category totals for the month
    const params2 = [parseInt(year), parseInt(month)];
    if (!isAdmin) params2.push(req.user.id);

    const [categoryTotals] = await pool.query(
      `SELECT 
        t.category,
        t.type,
        SUM(t.amount) as total,
        COUNT(*) as count
      FROM transactions t
      WHERE YEAR(t.date) = ? AND MONTH(t.date) = ? AND t.deleted_at IS NULL ${userFilter}
      GROUP BY t.category, t.type
      ORDER BY total DESC`,
      params2
    );

    // Monthly summary
    const params3 = [parseInt(year), parseInt(month)];
    if (!isAdmin) params3.push(req.user.id);

    const [summary] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as totalExpense,
        COUNT(*) as totalTransactions
      FROM transactions t
      WHERE YEAR(t.date) = ? AND MONTH(t.date) = ? AND t.deleted_at IS NULL ${userFilter}`,
      params3
    );

    res.json({
      summary: {
        ...summary[0],
        totalIncome: parseFloat(summary[0].totalIncome),
        totalExpense: parseFloat(summary[0].totalExpense),
        balance: parseFloat(summary[0].totalIncome) - parseFloat(summary[0].totalExpense),
      },
      dailyData,
      categoryTotals,
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
