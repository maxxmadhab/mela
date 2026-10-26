import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Media } from '../components/Media';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

const PRODUCT_PALETTES: Record<string, [string, string]> = {
  'kullu-wool-shawl': ['#B96D52', '#4b3a33'],
  'kinnauri-pattern-stole': ['#74765B', '#2c3633'],
  'chamba-rumal-panel': ['#D8C9B3', '#B96D52'],
  'deodar-carved-box': ['#8C5D4D', '#282722'],
  'ringal-bamboo-basket': ['#a39a6a', '#74765B'],
  'hemp-fibre-bag': ['#c9c3b6', '#74765B'],
  'pahari-wool-cap': ['#4b5a57', '#1f2a2e'],
  'walnut-wood-bowl': ['#6b4a3a', '#282722'],
};

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!slug) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            slug,
            name,
            description,
            price_inr,
            stock,
            image_url,
            featured,
            active,
            category:categories (id, name),
            artisan:artisans (id, name, village, bio, portrait_url)
          `)
          .eq('slug', slug)
          .eq('active', true)
          .maybeSingle();

        if (!error && data && isMounted) {
          setProduct(data as any);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product);
    showToast(`${product.name} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="eyebrow">Loading piece...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="eyebrow">Not found</div>
        <h1 className="big" style={{ marginBottom: '20px' }}>Piece not found.</h1>
        <p style={{ opacity: 0.75, marginBottom: '30px' }}>
          This handcrafted item is no longer active or the URL has changed.
        </p>
        <Link to="/shop" className="btn fill">
          Return to Shop
        </Link>
      </div>
    );
  }

  const palette = (slug && PRODUCT_PALETTES[slug]) || ['#74765B', '#2c3633'];

  return (
    <div className="page">
      <Link
        to="/shop"
        className="eyebrow"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}
      >
        ← Back to Shop
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '6vw',
          alignItems: 'center',
        }}
      >
        <Media
          src={product.image_url}
          label={product.name}
          colorStart={palette[0]}
          colorEnd={palette[1]}
          aspectRatio="4/5"
          style={{ borderRadius: '4px', maxHeight: '70vh' }}
        />

        <div className="rv in">
          <div className="eyebrow">
            {product.category?.name || 'Himachal Craft'} · {product.artisan?.village || 'Pahadi Maker'}
          </div>

          <h1 className="big" style={{ fontSize: 'clamp(36px, 5vw, 60px)', marginBottom: '16px' }}>
            {product.name}
          </h1>

          <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--terracotta)', marginBottom: '24px' }}>
            ₹{product.price_inr.toLocaleString('en-IN')}
          </div>

          <p style={{ opacity: 0.85, fontSize: '15px', lineHeight: 1.6, maxWidth: '520px', marginBottom: '28px' }}>
            {product.description ||
              `Handmade with traditional regional heritage by ${product.artisan?.name || 'local artisans'}. Built directly using generational hill craft techniques.`}
          </p>

          {product.artisan && (
            <div
              style={{
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                padding: '20px 0',
                marginBottom: '32px',
                maxWidth: '520px',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--olive)', marginBottom: '6px' }}>
                About the Maker
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>
                {product.artisan.name} · {product.artisan.village}
              </div>
              {product.artisan.bio && (
                <div style={{ opacity: 0.75, fontSize: '13px', marginTop: '6px' }}>
                  {product.artisan.bio}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn fill"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              {product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
            </button>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>
              {product.stock > 0 ? `${product.stock} available directly from maker` : 'Currently unavailable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
