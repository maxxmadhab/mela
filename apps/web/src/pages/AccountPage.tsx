import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Order } from '../types';

export const AccountPage: React.FC = () => {
  const { user, profile, role, session, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      setLoadingOrders(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetch('/api/orders/mine', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load past orders.');
        }

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err: any) {
        setOrdersError(err.message || 'Unable to retrieve orders.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out successfully.');
    navigate('/');
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return { backgroundColor: 'var(--olive)', color: '#fff' };
      case 'shipped':
        return { backgroundColor: 'var(--terracotta)', color: '#fff' };
      case 'cancelled':
        return { backgroundColor: 'var(--charcoal)', color: '#fff' };
      case 'pending':
      default:
        return {
          backgroundColor: 'transparent',
          border: '1px solid var(--terracotta)',
          color: 'var(--terracotta)',
        };
    }
  };

  return (
    <div className="page">
      <div className="eyebrow">My Account</div>
      <h1 className="big">Profile &amp; Orders.</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          marginTop: '40px',
        }}
      >
        {/* Profile Card */}
        <div className="form-card" style={{ height: 'fit-content' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px',
            }}
          >
            <h2 style={{ fontSize: '24px' }}>Personal Details</h2>
            {role && (
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  border: '1px solid var(--line)',
                  borderRadius: '99px',
                  padding: '4px 10px',
                  backgroundColor: role === 'admin' ? 'var(--terracotta)' : 'var(--paper)',
                  color: role === 'admin' ? '#fff' : 'inherit',
                  fontWeight: 600,
                }}
              >
                {role}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '16px', fontSize: '14px' }}>
            <div
              style={{
                opacity: 0.6,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginBottom: '4px',
              }}
            >
              Name
            </div>
            <div style={{ fontWeight: 500, fontSize: '16px' }}>
              {profile?.full_name || user?.user_metadata?.full_name || 'Himalayan Explorer'}
            </div>
          </div>

          <div style={{ marginBottom: '28px', fontSize: '14px' }}>
            <div
              style={{
                opacity: 0.6,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginBottom: '4px',
              }}
            >
              Email
            </div>
            <div style={{ fontSize: '15px' }}>{user?.email || 'No email associated'}</div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={handleSignOut}>
              Sign out
            </button>
            {role === 'admin' && (
              <Link to="/admin" className="btn fill">
                Admin Console
              </Link>
            )}
          </div>
        </div>

        {/* Orders Card */}
        <div className="form-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2 style={{ fontSize: '24px' }}>Order History</h2>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>

          {loadingOrders ? (
            <div style={{ padding: '24px 0', opacity: 0.7, fontSize: '14px' }}>
              Fetching orders from artisans...
            </div>
          ) : ordersError ? (
            <div
              style={{
                backgroundColor: 'rgba(184, 80, 56, 0.1)',
                color: 'var(--terracotta)',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              {ordersError}
            </div>
          ) : orders.length === 0 ? (
            <div>
              <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                No past orders recorded yet. Browse authentic pieces crafted by master artisans in
                the valleys of Himachal Pradesh.
              </p>
              <Link to="/shop" className="btn fill">
                Explore the Mela
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => {
                const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={order.id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: '4px',
                      padding: '20px',
                      backgroundColor: 'var(--ivory)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span style={{ opacity: 0.6, fontSize: '12px', marginLeft: '10px' }}>
                          {dateStr}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          fontWeight: 600,
                          borderRadius: '99px',
                          padding: '3px 10px',
                          ...getStatusBadgeStyle(order.status),
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Order items */}
                    {order.items && order.items.length > 0 && (
                      <div
                        style={{
                          margin: '12px 0',
                          padding: '10px 0',
                          borderTop: '1px dashed var(--line)',
                          borderBottom: '1px dashed var(--line)',
                        }}
                      >
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '13px',
                              padding: '4px 0',
                            }}
                          >
                            <span>
                              {item.product?.name || 'Handcrafted Item'} × {item.quantity}
                            </span>
                            <span style={{ fontWeight: 500 }}>
                              ₹{(item.unit_price_inr * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: '12px',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ opacity: 0.7, maxWidth: '240px' }}>
                        Shipping to: {order.address}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ opacity: 0.6, fontSize: '11px' }}>Total Paid</div>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'var(--terracotta)',
                          }}
                        >
                          ₹{order.total_inr.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
