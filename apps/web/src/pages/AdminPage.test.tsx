import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminPage } from './AdminPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/Toast';

describe('Phase 8 - Admin Catalogue Management UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock global fetch for admin lists
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it('renders Admin Portal with management tabs and search toolbar', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <AdminPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByText(/Administrator Portal/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Catalogue & Crafts/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /^products$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^categories$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^artisans$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^crafts$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^orders$/i })).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/Search products.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Add New product/i })).toBeInTheDocument();
  });

  it('switches tabs and opens modal dialog on "+ Add New" click', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <AdminPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    // Click CATEGORIES tab
    const categoriesTab = screen.getByRole('button', { name: /^categories$/i });
    fireEvent.click(categoriesTab);

    expect(screen.getByPlaceholderText(/Search categories.../i)).toBeInTheDocument();
    const addCategoryBtn = screen.getByRole('button', { name: /\+ Add New Category/i });
    expect(addCategoryBtn).toBeInTheDocument();

    // Open modal
    fireEvent.click(addCategoryBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Add New Category/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Category Name/i)).toBeInTheDocument();

    // Close modal via Cancel button
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
