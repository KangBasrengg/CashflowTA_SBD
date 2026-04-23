import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import { Plus, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { exportToExcel } from '../utils/exportExcel';
import { CATEGORIES } from '../utils/formatCurrency';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', type: '', category: '' });
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleExport = async () => {
    try {
      const params = { page: 1, limit: 1000000 };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      const res = await api.get('/transactions', { params });
      const data = res.data.transactions.map(t => ({
        Tanggal: new Date(t.date).toLocaleDateString('id-ID'),
        User: t.user_name || '-',
        Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        Kategori: t.category,
        Deskripsi: t.description || '-',
        Jumlah: parseFloat(t.amount)
      }));
      exportToExcel(data, `Transaksi_${new Date().getTime()}`);
    } catch (err) {
      alert('Gagal export data');
    }
  };

  const handleCreate = async (data) => {
    try {
      await api.post('/transactions', data);
      setShowForm(false);
      fetchTransactions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambah transaksi.');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await api.put(`/transactions/${editData.id}`, data);
      setEditData(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengupdate transaksi.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus transaksi.');
    }
  };

  const allCategories = [...CATEGORIES.income, ...CATEGORIES.expense].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Transaksi</h2>
          <p>Kelola semua transaksi keuangan</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button className="btn btn-secondary" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={16} /> Filter
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="filter-bar">
          <input type="date" value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <input type="date" value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">Semua Kategori</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={() => setFilters({ startDate: '', endDate: '', type: '', category: '' })}>
            Reset
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <>
          <TransactionTable
            transactions={transactions}
            onEdit={(t) => setEditData(t)}
            onDelete={handleDelete}
            showUser={user?.role === 'admin'}
          />
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-secondary" disabled={pagination.page <= 1}
                onClick={() => fetchTransactions(pagination.page - 1)}>
                <ChevronLeft size={16} /> Prev
              </button>
              <span>Halaman {pagination.page} dari {pagination.totalPages}</span>
              <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchTransactions(pagination.page + 1)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {showForm && <TransactionForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editData && <TransactionForm onSubmit={handleUpdate} onClose={() => setEditData(null)} initialData={editData} />}
    </div>
  );
}
