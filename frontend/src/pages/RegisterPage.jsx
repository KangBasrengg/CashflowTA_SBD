import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">💰</span>
          <h2>Daftar Akun</h2>
          <p>Buat akun CashFlow baru</p>
        </div>
        {error && (
          <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><User size={16} /> Nama</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap" required />
          </div>
          <div className="form-group">
            <label><Mail size={16} /> Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com" required />
          </div>
          <div className="form-group">
            <label><Lock size={16} /> Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <UserPlus size={18} /> {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="auth-footer">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
