import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const AccountPage: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out');
    navigate('/');
  };

  return (
    <div className="page">
      <div className="eyebrow">My Account</div>
      <h1 className="big">Profile &amp; Orders.</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '5vw',
          marginTop: '40px',
        }}
      >
        <div className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px' }}>Personal Details</h2>
            {role && (
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  border: '1px solid var(--line)',
                  borderRadius: '99px',
                  padding: '4px 10px',
                  backgroundColor: role === 'admin' ? 'var(--terracotta)' : 'transparent',
                  color: role === 'admin' ? '#fff' : 'inherit',
                  fontWeight: 500,
                }}
              >
                {role}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '16px', fontSize: '14px' }}>
            <div style={{ opacity: 0.6, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '4px' }}>
              Name
            </div>
            <div>{profile?.full_name || user?.user_metadata?.full_name || 'Buyer'}</div>
          </div>

          <div style={{ marginBottom: '24px', fontSize: '14px' }}>
            <div style={{ opacity: 0.6, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '4px' }}>
              Email
            </div>
            <div>{user?.email || 'No email associated'}</div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <button className="btn" onClick={handleSignOut}>
              Sign out
            </button>
            {role === 'admin' && (
              <Link to="/admin" className="btn fill">
                Admin Console
              </Link>
            )}
          </div>
        </div>

        <div className="form-card">
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Order History</h2>
          <p style={{ opacity: 0.7, fontSize: '14px' }}>
            No past orders recorded. Browse authentic pieces directly from Pahadi makers.
          </p>
          <div style={{ marginTop: '24px' }}>
            <Link to="/shop" className="btn fill">
              Explore Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
