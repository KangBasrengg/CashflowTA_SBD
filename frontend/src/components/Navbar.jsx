import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, User } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="btn-icon sidebar-toggle" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <h1 className="navbar-brand" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
          <span className="brand-icon">💰</span> CashFlow
        </h1>
      </div>
      <div className="navbar-right">
        <div className="user-info">
          <div className="user-avatar">
            <User size={16} />
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className={`user-role role-${user?.role}`}>{user?.role}</span>
          </div>
        </div>
        <button className="btn-icon btn-logout" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
