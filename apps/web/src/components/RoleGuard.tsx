import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="eyebrow">Loading session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>Verifying credentials...</div>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return <Navigate to="/admin/login" state={{ error: 'Admin access required. Please sign in with an admin account.' }} replace />;
  }

  return <>{children}</>;
};
