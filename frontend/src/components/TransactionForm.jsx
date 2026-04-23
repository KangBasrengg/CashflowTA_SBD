import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '../utils/formatCurrency';

export default function TransactionForm({ onSubmit, onClose, initialData = null }) {
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type,
        amount: initialData.amount,
        category: initialData.category,
        description: initialData.description || '',
        date: initialData.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;
    onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  const categories = CATEGORIES[form.type] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Tipe</label>
            <div className="type-toggle">
              <button type="button" className={`type-btn ${form.type === 'income' ? 'active income' : ''}`}
                onClick={() => setForm({ ...form, type: 'income', category: '' })}>
                Pemasukan
              </button>
              <button type="button" className={`type-btn ${form.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setForm({ ...form, type: 'expense', category: '' })}>
                Pengeluaran
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Jumlah (Rp)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0" min="1" required />
          </div>
          <div className="form-group">
            <label>Kategori</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              <option value="">Pilih Kategori</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tanggal</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Keterangan (opsional)" rows={3} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
