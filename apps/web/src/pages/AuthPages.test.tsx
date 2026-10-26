import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminPage } from './AdminPage';
import { AdminRoute } from '../components/RoleGuard';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/Toast';

describe('Phase 3 - Web Authentication Pages & Role Guards', () => {
  it('renders LoginPage with Google and Email fields', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByRole('heading', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('renders SignupPage with name, email, password and confirm password', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/signup']}>
            <SignupPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByRole('heading', { name: /Create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  it('renders AdminLoginPage with email/password and no Google button', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin/login']}>
            <AdminLoginPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByRole('heading', { name: /Admin Login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Admin Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.queryByText(/Continue with Google/i)).not.toBeInTheDocument();
  });

  it('blocks unauthenticated user from accessing /admin and redirects to /admin/login', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    // Initial state without admin credentials should redirect or render AdminLoginPage
    expect(await screen.findByRole('heading', { name: /Admin Login/i })).toBeInTheDocument();
  });
});
