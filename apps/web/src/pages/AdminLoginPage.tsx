import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      // In Phase 1 scaffold, mock admin check
      if (email.includes('admin')) {
        showToast('Admin authenticated');
        navigate('/admin');
      } else {
        setError('This account is not an admin.');
      }
    }, 600);
  };

  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '75vh' }}>
      <div className="form-card" style={{ width: 'min(440px, 100%)' }}>
        <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>Staff Access</div>
        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Admin Login.</h1>
        <p style={{ opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>
          Catalogue management and artisan onboarding.
        </p>

        {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <label htmlFor="adm-email">Admin Email</label>
            <input
              id="adm-email"
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="adm-password">Password</label>
            <input
              id="adm-password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn fill" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
