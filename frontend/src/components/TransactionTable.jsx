import { Edit3, Trash2 } from 'lucide-react';
import { formatRupiah } from '../utils/formatCurrency';

export default function TransactionTable({ transactions, onEdit, onDelete, showUser = false }) {
  if (!transactions || transactions.length === 0) {
    return <div className="empty-state">Belum ada transaksi.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            {showUser && <th>User</th>}
            <th>Tipe</th>
            <th>Kategori</th>
            <th>Deskripsi</th>
            <th>Jumlah</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.date).toLocaleDateString('id-ID')}</td>
              {showUser && <td>{t.user_name}</td>}
              <td>
                <span className={`badge badge-${t.type}`}>
                  {t.type === 'income' ? 'Masuk' : 'Keluar'}
                </span>
              </td>
              <td>{t.category}</td>
              <td className="desc-cell">{t.description || '-'}</td>
              <td className={`amount-cell ${t.type}`}>
                {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
              </td>
              <td>
                <div className="action-btns">
                  <button className="btn-icon btn-edit" onClick={() => onEdit(t)} title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => onDelete(t.id)} title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
