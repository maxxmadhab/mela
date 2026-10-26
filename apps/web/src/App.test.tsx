import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from './App';

describe('MELA Web App - Phase 1 Routing and Layout', () => {
  it('renders the header with brand name and navigation', () => {
    render(<App />);
    const melaElements = screen.getAllByText('MELA');
    expect(melaElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('From the hills, directly to you')).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    expect(within(nav).getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Shop' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Connect' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Cart' })).toBeInTheDocument();
  });

  it('renders our story section and craft chapters', async () => {
    render(<App />);
    expect(screen.getByText('Our story')).toBeInTheDocument();
    expect(screen.getByText(/Made in the hills/i)).toBeInTheDocument();
    expect(screen.getByText('Crafts & raw materials')).toBeInTheDocument();
    const kulluElements = await screen.findAllByText('Kullu Wool');
    expect(kulluElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the footer note for sample content', () => {
    render(<App />);
    expect(screen.getByText(/Sample content — replace with verified maker details/i)).toBeInTheDocument();
  });
});
