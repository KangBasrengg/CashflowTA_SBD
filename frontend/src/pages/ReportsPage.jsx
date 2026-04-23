import { useState } from 'react';
import api from '../utils/api';
import { formatRupiah, MONTHS } from '../utils/formatCurrency';
import { FileBarChart, Search, Download } from 'lucide-react';
import { exportToExcel } from '../utils/exportExcel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/reports/monthly', { params: { year, month } });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = report?.dailyData?.map((d) => ({
    name: new Date(d.date).getDate().toString(),
    Pemasukan: parseFloat(d.income),
    Pengeluaran: parseFloat(d.expense),
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">Tanggal {label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {formatRupiah(p.value)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    if (!report) return;
    const data = report.categoryTotals.map(c => ({
      Kategori: c.category,
      Tipe: c.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      'Jumlah Transaksi': c.count,
      Total: parseFloat(c.total)
    }));
    exportToExcel(data, `Laporan_${MONTHS[month - 1]}_${year}`);
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Laporan Bulanan</h2>
          <p>Rekap keuangan per bulan</p>
        </div>
      </div>

      <div className="filter-bar">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
          <Search size={16} /> {loading ? 'Memuat...' : 'Tampilkan'}
        </button>
        {report && (
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
        )}
      </div>

      {report && (
        <>
          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="dashboard-card card-income">
              <div className="card-content">
                <span className="card-label">Pemasukan</span>
                <span className="card-value">{formatRupiah(report.summary.totalIncome)}</span>
              </div>
            </div>
            <div className="dashboard-card card-expense">
              <div className="card-content">
                <span className="card-label">Pengeluaran</span>
                <span className="card-value">{formatRupiah(report.summary.totalExpense)}</span>
              </div>
            </div>
            <div className="dashboard-card card-balance">
              <div className="card-content">
                <span className="card-label">Saldo Bulan Ini</span>
                <span className="card-value">{formatRupiah(report.summary.balance)}</span>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Grafik Harian — {MONTHS[month - 1]} {year}</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {report.categoryTotals?.length > 0 && (
            <div className="section">
              <h3>Breakdown per Kategori</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Kategori</th><th>Tipe</th><th>Jumlah Transaksi</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {report.categoryTotals.map((c, i) => (
                      <tr key={i}>
                        <td>{c.category}</td>
                        <td><span className={`badge badge-${c.type}`}>{c.type === 'income' ? 'Masuk' : 'Keluar'}</span></td>
                        <td>{c.count}</td>
                        <td className={`amount-cell ${c.type}`}>{formatRupiah(parseFloat(c.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!report && !loading && (
        <div className="empty-state">
          <FileBarChart size={48} />
          <p>Pilih bulan dan tahun, lalu klik "Tampilkan" untuk melihat laporan.</p>
        </div>
      )}
    </div>
  );
}
