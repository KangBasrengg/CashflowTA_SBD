import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DashboardCard from '../components/DashboardCard';
import TransactionTable from '../components/TransactionTable';
import { formatRupiah, MONTHS } from '../utils/formatCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, chartRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/dashboard/chart'),
      ]);
      setDashboard(dashRes.data);
      const formatted = chartRes.data.monthlyData.map((d) => {
        const [y, m] = d.month.split('-');
        return {
          name: MONTHS[parseInt(m) - 1]?.substring(0, 3) || d.month,
          Pemasukan: parseFloat(d.income),
          Pengeluaran: parseFloat(d.expense),
        };
      });
      setChartData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {formatRupiah(p.value)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>{user?.role === 'admin' ? 'Overview semua data keuangan' : 'Ringkasan keuangan Anda'}</p>
      </div>

      <div className="cards-grid">
        <DashboardCard type="income" label="Total Pemasukan" value={dashboard?.totalIncome || 0} />
        <DashboardCard type="expense" label="Total Pengeluaran" value={dashboard?.totalExpense || 0} />
        <DashboardCard type="balance" label="Saldo" value={dashboard?.balance || 0} />
        <DashboardCard type="transactions" label="Total Transaksi" value={dashboard?.totalTransactions || 0} isCurrency={false} />
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <h3>Arus Kas Bulanan</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Transaksi Terakhir</h3>
        <TransactionTable
          transactions={dashboard?.recentTransactions || []}
          onEdit={() => {}}
          onDelete={() => {}}
          showUser={user?.role === 'admin'}
        />
      </div>
    </div>
  );
}
