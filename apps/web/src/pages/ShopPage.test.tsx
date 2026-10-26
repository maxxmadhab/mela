import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShopPage } from './ShopPage';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../components/Toast';

describe('Phase 6 - Shop Catalogue & Quick View Modal', () => {
  it('renders Shop page with category filter toolbar and sort dropdown', async () => {
    render(
      <ToastProvider>
        <CartProvider>
          <MemoryRouter initialEntries={['/shop']}>
            <ShopPage />
          </MemoryRouter>
        </CartProvider>
      </ToastProvider>
    );

    expect(screen.getByRole('heading', { name: /Direct from/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort:/i)).toBeInTheDocument();
  });

  it('renders products and opens quick-view modal on card click', async () => {
    render(
      <ToastProvider>
        <CartProvider>
          <MemoryRouter initialEntries={['/shop']}>
            <ShopPage />
          </MemoryRouter>
        </CartProvider>
      </ToastProvider>
    );

    // Wait for card heading to load
    const productHeading = await screen.findByRole('heading', { name: 'Kullu Wool Shawl' });
    expect(productHeading).toBeInTheDocument();

    // Click the product card
    const card = productHeading.closest('.product-card');
    expect(card).toBeInTheDocument();
    fireEvent.click(card!);

    // Modal dialog should appear with Add to cart button
    const modalDialog = await screen.findByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();

    // Close on Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes quick-view modal on close button click', async () => {
    render(
      <ToastProvider>
        <CartProvider>
          <MemoryRouter initialEntries={['/shop']}>
            <ShopPage />
          </MemoryRouter>
        </CartProvider>
      </ToastProvider>
    );

    const productHeading = await screen.findByRole('heading', { name: 'Kinnauri Pattern Stole' });
    const card = productHeading.closest('.product-card');
    fireEvent.click(card!);

    const closeBtn = await screen.findByRole('button', { name: /Close details/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
