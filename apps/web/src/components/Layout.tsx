import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useCart } from '../context/CartContext';

export const Layout: React.FC = () => {
  const { cartCount } = useCart();

  return (
    <>
      <Header cartCount={cartCount} />
      <main id="app">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
