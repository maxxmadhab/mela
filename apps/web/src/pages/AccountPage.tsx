import React from 'react';
import { Link } from 'react-router-dom';

export const AccountPage: React.FC = () => {
  return (
    <div className="page">
      <div className="eyebrow">My Account</div>
      <h1 className="big">Profile &amp; Orders.</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '5vw', marginTop: '40px' }}>
        <div className="form-card">
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Personal Details</h2>
          <p style={{ opacity: 0.8, fontSize: '14px', marginBottom: '24px' }}>
            Manage your buyer profile, shipping details, and credentials.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn">Sign In / Switch</Link>
          </div>
        </div>

        <div className="form-card">
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Order History</h2>
          <p style={{ opacity: 0.7, fontSize: '14px' }}>
            No past orders yet. Browse authentic pieces directly from Pahadi makers.
          </p>
          <div style={{ marginTop: '24px' }}>
            <Link to="/shop" className="btn fill">Explore Shop</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
