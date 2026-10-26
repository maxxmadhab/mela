import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [error, setError] = useState<string | null>((location.state as any)?.error || null);

  const { signInWithPassword, signOut, fetchProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await signInWithPassword(email, password);
      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data?.user) {
        const profile = await fetchProfile(data.user.id);
        if (profile?.role === 'admin') {
          showToast('Admin authenticated');
          navigate('/admin', { replace: true });
        } else {
          // Reject non-admin, immediately sign out
          await signOut();
          setError('This account is not an admin.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '75vh' }}>
      <div className="form-card rv in" style={{ width: 'min(440px, 100%)' }}>
        <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>Staff Access</div>
        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Admin Login.</h1>
        <p style={{ opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>
          Catalogue management and artisan onboarding.
        </p>

        {error && (
          <div
            className="form-error"
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(185, 109, 82, 0.1)',
              border: '1px solid var(--terracotta)',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

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
              placeholder="admin@mela.example"
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
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="btn fill"
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
