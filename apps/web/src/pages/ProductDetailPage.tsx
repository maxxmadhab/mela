import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Media } from '../components/Media';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const sampleProduct = {
    id: slug || 'p1',
    slug: slug || 'sample',
    name: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Artisan Piece',
    description: 'Generational craftsmanship directly from Himachal Pradesh valleys.',
    price_inr: 3600,
    stock: 5,
    category_id: 'textiles',
    artisan_id: 'a1',
    image_url: null,
    featured: true,
    active: true,
  };

  const handleAddToCart = () => {
    addToCart(sampleProduct);
    showToast(`${sampleProduct.name} added to cart`);
  };

  return (
    <div className="page">
      <Link to="/shop" className="eyebrow" style={{ display: 'inline-block', marginBottom: '24px' }}>
        ← Back to Shop
      </Link>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '6vw', alignItems: 'center' }}>
        <Media label={sampleProduct.name} aspectRatio="4/5" style={{ borderRadius: '4px' }} />
        <div>
          <div className="eyebrow">Pahadi Craft</div>
          <h1 className="big" style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginBottom: '16px' }}>
            {sampleProduct.name}
          </h1>
          <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--terracotta)', marginBottom: '20px' }}>
            ₹{sampleProduct.price_inr.toLocaleString('en-IN')}
          </div>
          <p style={{ opacity: 0.8, maxWidth: '480px', marginBottom: '32px' }}>
            {sampleProduct.description}
          </p>
          <button className="btn fill" onClick={handleAddToCart}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};
