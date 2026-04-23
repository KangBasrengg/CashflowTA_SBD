import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react';
import { formatRupiah } from '../utils/formatCurrency';

const iconMap = {
  income: <TrendingUp size={24} />,
  expense: <TrendingDown size={24} />,
  balance: <Wallet size={24} />,
  transactions: <ArrowLeftRight size={24} />,
};

export default function DashboardCard({ type, label, value, isCurrency = true }) {
  return (
    <div className={`dashboard-card card-${type}`}>
      <div className="card-icon">{iconMap[type]}</div>
      <div className="card-content">
        <span className="card-label">{label}</span>
        <span className="card-value">{isCurrency ? formatRupiah(value) : value}</span>
      </div>
    </div>
  );
}
