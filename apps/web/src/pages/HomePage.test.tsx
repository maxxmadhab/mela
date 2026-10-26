import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';

describe('Phase 5 - Home Page Experience & Craft Chapters', () => {
  it('renders landing intro on first session visit and transitions on Enter mela click', async () => {
    sessionStorage.clear();
    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    );

    const enterButton = screen.getByRole('button', { name: /Enter mela/i });
    expect(enterButton).toBeInTheDocument();
    expect(screen.getByText(/Himachal Pradesh · Direct from the hills/i)).toBeInTheDocument();

    fireEvent.click(enterButton);
    expect(sessionStorage.getItem('mela-entered')).toBe('true');
  });

  it('renders Our Story section with three stats and 4 mosaic images', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Our story')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('middlemen')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('maker-led')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('hill community')).toBeInTheDocument();

    expect(screen.getByText('Artisan portrait')).toBeInTheDocument();
    expect(screen.getByText('Loom')).toBeInTheDocument();
    expect(screen.getByText('Village')).toBeInTheDocument();
    expect(screen.getByText('Raw wool')).toBeInTheDocument();
  });

  it('renders Crafts & Raw Materials header and closing CTA to shop', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Crafts & raw materials')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /The hands and/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Meet the makers/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Visit the shop/i })).toBeInTheDocument();
  });
});
