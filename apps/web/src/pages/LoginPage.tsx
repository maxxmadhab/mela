import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Logged in successfully');
      navigate('/account');
    }, 600);
  };

  const handleGoogleLogin = () => {
    showToast('Redirecting to Google...');
  };

  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '75vh' }}>
      <div className="form-card" style={{ width: 'min(440px, 100%)' }}>
        <div className="eyebrow">Welcome to Mela</div>
        <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Sign in.</h1>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn"
          style={{ width: '100%', marginBottom: '24px', borderColor: 'var(--line)' }}
        >
          Continue with Google
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0',
            opacity: 0.5,
            fontSize: '12px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
          <span>or email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
        </div>

        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn fill" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', opacity: 0.8 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--terracotta)', fontWeight: 500 }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
