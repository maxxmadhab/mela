import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Media } from '../components/Media';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { showToast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', address: '' });
  const [orderComplete, setOrderComplete] = useState(false);

  const total = items.reduce((sum, item) => sum + item.product.price_inr * item.quantity, 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderComplete(true);
    clearCart();
    showToast('Order confirmed (preview)');
  };

  return (
    <div className="page">
      <div className="eyebrow">Cart</div>
      <h1 className="big">Your selection.</h1>

      {orderComplete ? (
        <div style={{ marginTop: '48px', maxWidth: '520px' }}>
          <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>Confirmed</div>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Order received.</h2>
          <p style={{ opacity: 0.8, marginBottom: '28px' }}>
            Thank you, {checkoutData.name}. Your order has been placed directly with the artisans. You will receive updates at {checkoutData.phone}.
          </p>
          <Link to="/shop" className="btn fill">
            Continue exploring
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div style={{ marginTop: '48px' }}>
          <p style={{ opacity: 0.7, marginBottom: '24px' }}>Your cart is empty.</p>
          <Link to="/shop" className="btn fill">
            Go to shop
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: '40px' }}>
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr auto auto auto',
                gap: '20px',
                alignItems: 'center',
                padding: '20px 0',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <Media label={product.name} aspectRatio="3/4" style={{ borderRadius: '3px' }} />
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{product.name}</h3>
                <div style={{ opacity: 0.6, fontSize: '13px' }}>Direct from maker</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid var(--line)',
                  borderRadius: '99px',
                  padding: '4px 12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, -1)}
                  style={{ fontWeight: 600, padding: '0 4px' }}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, 1)}
                  style={{ fontWeight: 600, padding: '0 4px' }}
                >
                  +
                </button>
              </div>
              <b style={{ fontSize: '16px', color: 'var(--terracotta)' }}>
                ₹{(product.price_inr * quantity).toLocaleString('en-IN')}
              </b>
              <button
                type="button"
                onClick={() => removeFromCart(product.id)}
                style={{ opacity: 0.5, fontSize: '18px', padding: '4px 8px' }}
                title="Remove item"
              >
                ×
              </button>
            </div>
          ))}

          <div
            style={{
              marginTop: '36px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 600 }}>
              Total ₹{total.toLocaleString('en-IN')}
            </div>
            <button className="btn fill" onClick={() => setShowCheckout(true)}>
              Proceed to checkout
            </button>
          </div>
          <p style={{ opacity: 0.6, fontSize: '13px', marginTop: '14px' }}>
            Your payment goes directly to the makers. Checkout is a preview in this sample.
          </p>

          {showCheckout && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 80,
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'rgba(20, 19, 16, 0.65)',
                backdropFilter: 'blur(8px)',
                padding: '20px',
              }}
              onClick={() => setShowCheckout(false)}
            >
              <form
                onSubmit={handleCheckoutSubmit}
                onClick={(e) => e.stopPropagation()}
                className="form-card"
                style={{ width: 'min(520px, 100%)' }}
              >
                <div className="eyebrow">Direct Checkout</div>
                <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Delivery Details</h2>
                <div className="form-group">
                  <label htmlFor="c-name">Full Name</label>
                  <input
                    id="c-name"
                    className="form-control"
                    required
                    value={checkoutData.name}
                    onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c-phone">Phone number</label>
                  <input
                    id="c-phone"
                    className="form-control"
                    required
                    value={checkoutData.phone}
                    onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c-address">Shipping Address</label>
                  <textarea
                    id="c-address"
                    className="form-control"
                    rows={3}
                    required
                    value={checkoutData.address}
                    onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
                  <button type="submit" className="btn fill">
                    Confirm Order (₹{total.toLocaleString('en-IN')})
                  </button>
                  <button type="button" className="btn" onClick={() => setShowCheckout(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
