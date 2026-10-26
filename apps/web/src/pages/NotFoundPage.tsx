import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="page" style={{ textAlign: 'center', minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div>
        <div className="eyebrow">404</div>
        <h1 className="big" style={{ marginBottom: '18px' }}>Page not found.</h1>
        <p style={{ opacity: 0.75, marginBottom: '32px' }}>
          The path you took into the hills does not exist or has moved.
        </p>
        <Link to="/" className="btn fill">
          Return home
        </Link>
      </div>
    </div>
  );
};
