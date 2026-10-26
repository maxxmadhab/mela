import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div>
        <span>MELA · Himachal Pradesh · Direct from the hills</span>
      </div>
      <div>
        <span>Sample content — replace with verified maker details</span>
      </div>
      <div style={{ display: 'flex', gap: '18px' }}>
        <a href="mailto:hello@mela.example">hello@mela.example</a>
        <Link to="/account">Account</Link>
        <Link to="/admin/login">Admin</Link>
      </div>
    </footer>
  );
};
