import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Media } from '../components/Media';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';

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

export const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  // Load categories and products
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);

        // Fetch categories
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (catData && isMounted) {
          setCategories(catData as Category[]);
        }

        // Fetch products
        let query = supabase
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
            category_id,
            artisan_id,
            category:categories(id, name),
            artisan:artisans(id, name, village, bio)
          `)
          .eq('active', true);

        if (sortOption === 'price_asc') {
          query = query.order('price_inr', { ascending: true });
        } else if (sortOption === 'price_desc') {
          query = query.order('price_inr', { ascending: false });
        } else {
          query = query
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false });
        }

        const { data: prodData, error } = await query;
        if (!error && prodData && isMounted) {
          setProducts(prodData as any);
        }
      } catch (err) {
        console.error('Failed to load catalogue:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [sortOption]);

  // Keyboard accessibility for modal (Esc to close, Trap focus)
  useEffect(() => {
    if (!quickViewProduct) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickViewProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewProduct]);

  // Filter products by selected category
  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.category?.name?.toLowerCase() === activeCategory.toLowerCase();
  });

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    addToCart(product);
    showToast(`${product.name} added to cart`);
    if (quickViewProduct) {
      setQuickViewProduct(null);
    }
  };

  return (
    <div className="page">
      <div className="eyebrow">Shop</div>
      <h1 className="big">
        Direct from<br />
        the makers.
      </h1>

      {/* Filter and Sort Toolbar */}
      <div className="filters-bar">
        <div className="category-filters" role="toolbar" aria-label="Category filters">
          <button
            type="button"
            className={`filter-pill ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => setActiveCategory('All')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-pill ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="shop-sort" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.7, marginRight: '8px' }}>
            Sort:
          </label>
          <select
            id="shop-sort"
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="featured">Featured first</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>
          <div className="eyebrow">Loading catalogue...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.7 }}>
          <p>No pieces found in this category.</p>
        </div>
      ) : (
        <div className="pgrid">
          {filteredProducts.map((product) => {
            const palette = PRODUCT_PALETTES[product.slug] || ['#74765B', '#2c3633'];
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="product-card rv in"
                onClick={() => setQuickViewProduct(product)}
                tabIndex={0}
                role="button"
                aria-label={`View ${product.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setQuickViewProduct(product);
                  }
                }}
              >
                {isOutOfStock && (
                  <span className="out-of-stock-badge">Out of stock</span>
                )}

                <Media
                  src={product.image_url}
                  label={product.name}
                  colorStart={palette[0]}
                  colorEnd={palette[1]}
                  aspectRatio="3/4"
                />

                <div className="card-info">
                  <h3>{product.name}</h3>
                  <div className="byline">
                    by {product.artisan?.name || 'Pahadi Maker'} · {product.artisan?.village || 'Himachal'}
                  </div>
                  <div className="price-tag">
                    ₹{product.price_inr.toLocaleString('en-IN')}
                  </div>
                  <div className="hover-hint">
                    Click for a closer look, then add to cart.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            ref={modalRef}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close details"
            >
              ×
            </button>

            {/* Large Product Media */}
            <Media
              src={quickViewProduct.image_url}
              label={quickViewProduct.name}
              colorStart={PRODUCT_PALETTES[quickViewProduct.slug]?.[0] || '#74765B'}
              colorEnd={PRODUCT_PALETTES[quickViewProduct.slug]?.[1] || '#2c3633'}
              style={{ minHeight: '380px', height: '100%' }}
            />

            {/* Modal Body Info */}
            <div className="modal-body">
              <div className="eyebrow" style={{ marginBottom: 0 }}>
                {quickViewProduct.category?.name || 'Handcraft'} · {quickViewProduct.artisan?.village || 'Himachal'}
              </div>

              <h2 id="modal-product-title" style={{ fontSize: '34px', lineHeight: 1.1 }}>
                {quickViewProduct.name}
              </h2>

              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--terracotta)' }}>
                ₹{quickViewProduct.price_inr.toLocaleString('en-IN')}
              </div>

              <p style={{ opacity: 0.8, fontSize: '14px', lineHeight: 1.6 }}>
                {quickViewProduct.description ||
                  `Handmade by ${quickViewProduct.artisan?.name || 'regional artisans'}. Pure native materials shaped through generational hill traditions.`}
              </p>

              <div style={{ fontSize: '13px', opacity: 0.7 }}>
                <strong>Maker:</strong> {quickViewProduct.artisan?.name} ({quickViewProduct.artisan?.village})
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn fill"
                  disabled={quickViewProduct.stock <= 0}
                  onClick={() => handleAddToCart(quickViewProduct)}
                >
                  {quickViewProduct.stock <= 0 ? 'Out of stock' : 'Add to cart'}
                </button>

                <Link
                  to={`/shop/${quickViewProduct.slug}`}
                  className="btn"
                  onClick={() => setQuickViewProduct(null)}
                >
                  View full story
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
