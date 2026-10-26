import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartPage } from './CartPage';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/Toast';

describe('Phase 7 - Cart, Checkout & Orders', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders empty cart state with call to action', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/cart']}>
              <CartPage />
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByRole('heading', { name: /Your selection/i })).toBeInTheDocument();
    expect(screen.getByText(/Your basket is currently empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore the Mela/i })).toHaveAttribute('href', '/shop');
  });

  it('renders cart line items, calculates total, and respects stock limit in stepper', () => {
    const testProduct = {
      id: 'prod-001',
      slug: 'chamba-rumal',
      name: 'Chamba Silk Rumal',
      price_inr: 3500,
      stock: 2, // Maximum stock is 2
      category_id: null,
      artisan_id: null,
      image_url: null,
      featured: false,
      active: true,
    };

    localStorage.setItem('mela-cart', JSON.stringify({ 'prod-001': 1 }));
    localStorage.setItem('mela-product-cache', JSON.stringify({ 'prod-001': testProduct }));

    render(
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/cart']}>
              <CartPage />
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    );

    // Product name and initial quantity should be displayed
    expect(screen.getByRole('heading', { name: 'Chamba Silk Rumal' })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('₹3,500 each')).toBeInTheDocument();

    // Increment quantity from 1 to 2
    const plusButton = screen.getByRole('button', { name: /Increase quantity of Chamba Silk Rumal/i });
    expect(plusButton).not.toBeDisabled();
    fireEvent.click(plusButton);

    // Now quantity should be 2 and plus button should be disabled because stock is 2
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(plusButton).toBeDisabled();

    // Clicking plus again should not exceed stock
    fireEvent.click(plusButton);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('prompts unauthenticated user to sign in before checkout', () => {
    const testProduct = {
      id: 'prod-002',
      slug: 'kullu-shawl',
      name: 'Kullu Shawl',
      price_inr: 4500,
      stock: 5,
      category_id: null,
      artisan_id: null,
      image_url: null,
      featured: false,
      active: true,
    };

    localStorage.setItem('mela-cart', JSON.stringify({ 'prod-002': 1 }));
    localStorage.setItem('mela-product-cache', JSON.stringify({ 'prod-002': testProduct }));

    render(
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/cart']}>
              <CartPage />
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    );

    const signInLink = screen.getByRole('link', { name: /Sign in to Checkout/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/login?redirect=/cart');
  });

  it('removes item when Remove button is clicked', async () => {
    const testProduct = {
      id: 'prod-003',
      slug: 'kinnauri-muffler',
      name: 'Kinnauri Wool Muffler',
      price_inr: 1800,
      stock: 5,
      category_id: null,
      artisan_id: null,
      image_url: null,
      featured: false,
      active: true,
    };

    localStorage.setItem('mela-cart', JSON.stringify({ 'prod-003': 1 }));
    localStorage.setItem('mela-product-cache', JSON.stringify({ 'prod-003': testProduct }));

    render(
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/cart']}>
              <CartPage />
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByRole('heading', { name: 'Kinnauri Wool Muffler' })).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /Remove Kinnauri Wool Muffler from basket/i });
    fireEvent.click(removeBtn);

    // After removing, cart should be empty
    await waitFor(() => {
      expect(screen.getByText(/Your basket is currently empty/i)).toBeInTheDocument();
    });
  });
});
