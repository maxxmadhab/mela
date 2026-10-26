import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUpWithPassword, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await signUpWithPassword(email, password, fullName);
      if (signUpError) {
        setError(signUpError.message);
      } else {
        if (data.session) {
          showToast('Account created successfully');
          navigate('/account');
        } else {
          showToast('Account created! Please check your email to confirm.');
          navigate('/login');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: googleError } = await signInWithGoogle();
      if (googleError) {
        setError(googleError.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize Google signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '75vh' }}>
      <div className="form-card rv in" style={{ width: 'min(440px, 100%)' }}>
        <div className="eyebrow">Join Mela</div>
        <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Create an account.</h1>

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

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="btn"
          style={{ width: '100%', marginBottom: '24px', borderColor: 'var(--line)' }}
          disabled={loading}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            style={{ marginRight: '10px', verticalAlign: 'middle' }}
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign up with Google
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
          <span>or details</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              className="form-control"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              className="form-control"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="btn fill"
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', opacity: 0.8 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--terracotta)', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
