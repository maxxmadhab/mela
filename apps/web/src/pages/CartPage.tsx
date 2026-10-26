import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Media } from '../components/Media';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Order } from '../types';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, profile, session } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Pre-populate name when user is authenticated
  useEffect(() => {
    if (user && !checkoutData.name) {
      setCheckoutData((prev) => ({
        ...prev,
        name: profile?.full_name || (user.user_metadata?.full_name as string) || '',
      }));
    }
  }, [user, profile]);

  // Handle escape key to close checkout modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCheckout) {
        setShowCheckout(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCheckout]);

  const total = items.reduce((sum, item) => sum + item.product.price_inr * item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) {
      navigate('/login?redirect=/cart');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        customer_name: checkoutData.name.trim(),
        phone: checkoutData.phone.trim(),
        address: checkoutData.address.trim(),
        items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to place order.');
      }

      setConfirmedOrder(data.order);
      clearCart();
      setShowCheckout(false);
      showToast('Order confirmed! The artisans have been notified.');
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="eyebrow">Pahadi Basket</div>
      <h1 className="big">Your selection.</h1>

      {confirmedOrder ? (
        <div style={{ marginTop: '48px', maxWidth: '600px' }}>
          <div
            className="eyebrow"
            style={{
              color: 'var(--olive)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>●</span> Confirmed Order #{confirmedOrder.id.slice(0, 8).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '36px', marginBottom: '16px', marginTop: '8px' }}>
            Direct order received.
          </h2>
          <p style={{ opacity: 0.85, fontSize: '16px', lineHeight: 1.6, marginBottom: '20px' }}>
            Dhanyawad, <strong>{confirmedOrder.customer_name}</strong>! Your purchase has been
            relayed directly to the village artisan clusters in Himachal Pradesh. We have reserved
            your pieces.
          </p>

          <div
            style={{
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: '4px',
              padding: '20px',
              marginBottom: '28px',
            }}
          >
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '4px' }}>Dispatch Details</div>
            <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>
              Shipping to: {confirmedOrder.address}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Phone updates: {confirmedOrder.phone}
            </div>
            <div
              style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px dashed var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '14px' }}>Total Amount Paid</span>
              <strong style={{ color: 'var(--terracotta)', fontSize: '16px' }}>
                ₹{confirmedOrder.total_inr.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/account" className="btn fill">
              View order in Account
            </Link>
            <Link to="/shop" className="btn">
              Continue exploring
            </Link>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div style={{ marginTop: '56px', maxWidth: '520px' }}>
          <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '12px', lineHeight: 1.5 }}>
            Your basket is currently empty.
          </p>
          <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
            Browse authentic handspun pashmina shawls, cast brass thals, and pine needle basketry
            crafted by verified Himalayan artisans.
          </p>
          <Link to="/shop" className="btn fill">
            Explore the Mela
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginTop: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'start',
          }}
        >
          {/* Cart items list */}
          <div>
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {items.map(({ product, quantity }) => {
                const maxStock = product.stock ?? 999;
                const isAtMaxStock = quantity >= maxStock;

                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr auto',
                      gap: '20px',
                      alignItems: 'center',
                      padding: '24px 0',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    <Link
                      to={`/shop/${product.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Media
                        label={product.name}
                        aspectRatio="3/4"
                        colorStart={product.color_start}
                        colorEnd={product.color_end}
                        style={{ borderRadius: '2px' }}
                      />
                    </Link>

                    <div>
                      <Link
                        to={`/shop/${product.slug}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 500,
                            marginBottom: '4px',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      <div style={{ opacity: 0.65, fontSize: '13px', marginBottom: '10px' }}>
                        {product.artisan?.name
                          ? `Crafted by ${product.artisan.name}`
                          : 'Direct from maker'}
                      </div>

                      {product.stock <= 3 && product.stock > 0 && (
                        <div
                          style={{
                            color: 'var(--terracotta)',
                            fontSize: '12px',
                            fontWeight: 500,
                            marginBottom: '10px',
                          }}
                        >
                          Only {product.stock} left in Himachal inventory
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Stepper */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid var(--line)',
                            borderRadius: '99px',
                            padding: '2px 8px',
                            backgroundColor: 'var(--paper)',
                          }}
                        >
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${product.name}`}
                            onClick={() => updateQuantity(product.id, -1)}
                            style={{
                              padding: '2px 8px',
                              fontWeight: 600,
                              fontSize: '15px',
                              color: 'inherit',
                            }}
                          >
                            −
                          </button>
                          <span
                            aria-live="polite"
                            style={{
                              padding: '0 8px',
                              fontSize: '14px',
                              minWidth: '24px',
                              textAlign: 'center',
                            }}
                          >
                            {quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${product.name}`}
                            onClick={() => updateQuantity(product.id, 1)}
                            disabled={isAtMaxStock}
                            style={{
                              padding: '2px 8px',
                              fontWeight: 600,
                              fontSize: '15px',
                              color: isAtMaxStock ? 'var(--line)' : 'inherit',
                              cursor: isAtMaxStock ? 'not-allowed' : 'pointer',
                            }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          aria-label={`Remove ${product.name} from basket`}
                          style={{
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            opacity: 0.6,
                            textDecoration: 'underline',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'var(--terracotta)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ₹{(product.price_inr * quantity).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                        ₹{product.price_inr.toLocaleString('en-IN')} each
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '24px' }}>
              <Link
                to="/shop"
                style={{
                  fontSize: '14px',
                  color: 'var(--olive)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ← Continue shopping
              </Link>
            </div>
          </div>

          {/* Order Summary & Checkout Card */}
          <div
            className="form-card"
            style={{
              position: 'sticky',
              top: '100px',
              padding: '32px',
              backgroundColor: 'var(--paper)',
              borderRadius: '4px',
            }}
          >
            <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
              Summary
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Order Total</h2>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--line)',
                fontSize: '15px',
              }}
            >
              <span style={{ opacity: 0.8 }}>Subtotal</span>
              <span style={{ fontWeight: 500 }}>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: '1px solid var(--line)',
                fontSize: '15px',
              }}
            >
              <span style={{ opacity: 0.8 }}>Delivery from Himachal</span>
              <span style={{ color: 'var(--olive)', fontWeight: 500 }}>Complimentary</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '20px 0',
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--terracotta)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <p
              style={{
                fontSize: '12px',
                opacity: 0.65,
                lineHeight: 1.5,
                marginBottom: '24px',
              }}
            >
              100% of product proceeds go directly to the artisan. Zero platform commissions.
            </p>

            {user ? (
              <button
                type="button"
                className="btn fill"
                onClick={() => setShowCheckout(true)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div>
                <Link
                  to="/login?redirect=/cart"
                  className="btn fill"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }}
                >
                  Sign in to Checkout
                </Link>
                <div style={{ textAlign: 'center', fontSize: '13px', opacity: 0.7 }}>
                  New customer?{' '}
                  <Link
                    to="/signup?redirect=/cart"
                    style={{ color: 'var(--terracotta)', fontWeight: 500 }}
                  >
                    Create account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Direct Checkout"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: 'rgba(20, 19, 16, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '20px',
          }}
          onClick={() => setShowCheckout(false)}
        >
          <form
            onSubmit={handleCheckoutSubmit}
            onClick={(e) => e.stopPropagation()}
            className="form-card"
            style={{ width: 'min(540px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
                Direct Maker Checkout
              </div>
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                aria-label="Close checkout modal"
                style={{ fontSize: '20px', opacity: 0.6, cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>Delivery Details</h2>
            <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '24px' }}>
              Your order will be dispatched straight from the artisan's workshop in Himachal Pradesh.
            </p>

            {submitError && (
              <div
                role="alert"
                style={{
                  backgroundColor: 'rgba(184, 80, 56, 0.1)',
                  color: 'var(--terracotta)',
                  border: '1px solid var(--terracotta)',
                  padding: '12px 16px',
                  borderRadius: '3px',
                  fontSize: '14px',
                  marginBottom: '20px',
                }}
              >
                {submitError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="checkout-name">Recipient Full Name</label>
              <input
                id="checkout-name"
                className="form-control"
                required
                minLength={2}
                placeholder="e.g. Anandita Sen"
                value={checkoutData.name}
                onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="checkout-phone">Phone Number (for courier tracking)</label>
              <input
                id="checkout-phone"
                type="tel"
                className="form-control"
                required
                minLength={8}
                placeholder="e.g. 9816012345"
                value={checkoutData.phone}
                onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="checkout-address">Complete Delivery Address</label>
              <textarea
                id="checkout-address"
                className="form-control"
                rows={3}
                required
                minLength={10}
                placeholder="House/Apartment, Street, Landmark, City, State, PIN code"
                value={checkoutData.address}
                onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
              />
            </div>

            <div
              style={{
                backgroundColor: 'var(--ivory)',
                border: '1px solid var(--line)',
                borderRadius: '3px',
                padding: '16px',
                marginTop: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  Order Total ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
                <span
                  style={{ fontSize: '18px', fontWeight: 600, color: 'var(--terracotta)' }}
                >
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.65 }}>
                Payment mode: Direct Maker Remittance (Preview / Razorpay session)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setShowCheckout(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn fill" disabled={isSubmitting}>
                {isSubmitting ? 'Processing Order...' : `Place Order (₹${total.toLocaleString('en-IN')})`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
