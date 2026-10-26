import React, { useState } from 'react';
import { Media } from '../components/Media';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { Product } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', slug: 'kullu-wool-shawl', name: 'Kullu Wool Shawl', description: 'Traditional Kullu handloom shawl', price_inr: 4800, stock: 5, category_id: 'textiles', artisan_id: 'a1', image_url: null, featured: true, active: true, color_start: '#B96D52', color_end: '#4b3a33' },
  { id: 'p2', slug: 'kinnauri-pattern-stole', name: 'Kinnauri Pattern Stole', description: 'Intricate woven stole from Kalpa', price_inr: 3600, stock: 8, category_id: 'textiles', artisan_id: 'a2', image_url: null, featured: true, active: true, color_start: '#74765B', color_end: '#2c3633' },
  { id: 'p3', slug: 'chamba-rumal-panel', name: 'Chamba Rumal Panel', description: 'Hand embroidered double satin stitch cloth', price_inr: 5200, stock: 2, category_id: 'textiles', artisan_id: 'a3', image_url: null, featured: true, active: true, color_start: '#D8C9B3', color_end: '#B96D52' },
  { id: 'p4', slug: 'deodar-carved-box', name: 'Deodar Carved Box', description: 'Fragrant cedar hand-carved box', price_inr: 2900, stock: 4, category_id: 'woodcraft', artisan_id: 'a4', image_url: null, featured: false, active: true, color_start: '#8C5D4D', color_end: '#282722' },
  { id: 'p5', slug: 'ringal-bamboo-basket', name: 'Ringal Bamboo Basket', description: 'Woven wild mountain bamboo basket', price_inr: 1400, stock: 12, category_id: 'basketry', artisan_id: 'a5', image_url: null, featured: false, active: true, color_start: '#a39a6a', color_end: '#74765B' },
  { id: 'p6', slug: 'hemp-fibre-bag', name: 'Hemp Fibre Bag', description: 'Natural high altitude hemp tote', price_inr: 2200, stock: 6, category_id: 'textiles', artisan_id: 'a6', image_url: null, featured: false, active: true, color_start: '#c9c3b6', color_end: '#74765B' },
  { id: 'p7', slug: 'pahari-wool-cap', name: 'Pahari Wool Cap', description: 'Classic Himachal woolen cap', price_inr: 900, stock: 15, category_id: 'textiles', artisan_id: 'a7', image_url: null, featured: false, active: true, color_start: '#4b5a57', color_end: '#1f2a2e' },
  { id: 'p8', slug: 'walnut-wood-bowl', name: 'Walnut Wood Bowl', description: 'Turned and hand-sanded walnut bowl', price_inr: 2400, stock: 3, category_id: 'woodcraft', artisan_id: 'a8', image_url: null, featured: false, active: true, color_start: '#6b4a3a', color_end: '#282722' },
];

export const ShopPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const filteredProducts = INITIAL_PRODUCTS.filter((p) => {
    if (filter === 'All') return true;
    if (filter === 'Textiles') return p.category_id === 'textiles';
    if (filter === 'Woodcraft') return p.category_id === 'woodcraft';
    if (filter === 'Basketry') return p.category_id === 'basketry';
    return true;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(`${product.name} added to cart`);
    if (quickViewProduct) {
      setQuickViewProduct(null);
    }
  };

  return (
    <div className="page">
      <div className="eyebrow">Shop</div>
      <h1 className="big">Direct from<br />the makers.</h1>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '30px 0' }}>
        {['All', 'Textiles', 'Woodcraft', 'Basketry'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`btn ${filter === cat ? 'fill' : ''}`}
            style={{ padding: '8px 20px', fontSize: '11px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '28px',
        }}
      >
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => setQuickViewProduct(p)}
            className="form-card"
            style={{
              padding: 0,
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Media
              label={p.name}
              colorStart={p.color_start}
              colorEnd={p.color_end}
              aspectRatio="3/4"
            />
            <div style={{ padding: '16px 18px 20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{p.name}</h3>
              <div style={{ fontSize: '12px', opacity: 0.65 }}>Pahadi handcraft</div>
              <div style={{ marginTop: '8px', fontWeight: 500, color: 'var(--terracotta)' }}>
                ₹{p.price_inr.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick view modal */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: 'rgba(20, 19, 16, 0.65)',
            backdropFilter: 'blur(8px)',
            padding: '20px',
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              width: 'min(960px, 100%)',
              maxHeight: '90vh',
              background: 'var(--paper)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <Media
              label="Large view"
              colorStart={quickViewProduct.color_start}
              colorEnd={quickViewProduct.color_end}
              style={{ minHeight: '360px' }}
            />
            <div style={{ padding: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px' }}>
              <div className="eyebrow">{quickViewProduct.category_id}</div>
              <h2 style={{ fontSize: '36px' }}>{quickViewProduct.name}</h2>
              <div style={{ fontSize: '26px', fontWeight: 600, color: 'var(--terracotta)' }}>
                ₹{quickViewProduct.price_inr.toLocaleString('en-IN')}
              </div>
              <p style={{ opacity: 0.8, fontSize: '14px' }}>
                Handmade by regional Pahadi masters. Genuine natural materials and generational techniques.
              </p>
              <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
                <button className="btn fill" onClick={() => handleAddToCart(quickViewProduct)}>
                  Add to cart
                </button>
                <button className="btn" onClick={() => setQuickViewProduct(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
