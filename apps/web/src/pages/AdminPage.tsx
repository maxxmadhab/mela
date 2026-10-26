import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Product, Category, Artisan, Craft, Order } from '../types';

type AdminTab = 'products' | 'categories' | 'artisans' | 'crafts' | 'orders';

export const AdminPage: React.FC = () => {
  const { session } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [loading, setLoading] = useState(true);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price_inr: 0,
    stock: 1,
    category_id: '',
    artisan_id: '',
    image_url: '',
    featured: false,
    active: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    sort_order: 0,
  });

  const [artisanForm, setArtisanForm] = useState({
    name: '',
    village: '',
    bio: '',
    portrait_url: '',
  });

  const [craftForm, setCraftForm] = useState({
    title: '',
    slug: '',
    kind: 'craft' as 'craft' | 'raw_material',
    tagline: '',
    body: '',
    fact: '',
    image_url: '',
    sort_order: 0,
  });

  const authHeader = useCallback(() => {
    return {
      Authorization: `Bearer ${session?.access_token || ''}`,
      'Content-Type': 'application/json',
    };
  }, [session]);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${session.access_token}` };

      const [prodsRes, catsRes, artsRes, craftsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/artisans', { headers }),
        fetch('/api/admin/crafts', { headers }),
        fetch('/api/admin/orders', { headers }),
      ]);

      if (prodsRes.ok) {
        const d = await prodsRes.json();
        setProducts(d.data || []);
      }
      if (catsRes.ok) {
        const d = await catsRes.json();
        setCategories(d.data || []);
      }
      if (artsRes.ok) {
        const d = await artsRes.json();
        setArtisans(d.data || []);
      }
      if (craftsRes.ok) {
        const d = await craftsRes.json();
        setCrafts(d.data || []);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.data || []);
      }
    } catch {
      showToast('Error loading admin data');
    } finally {
      setLoading(false);
    }
  }, [session, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file || !session?.access_token) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      if (targetField === 'product') {
        setProductForm((prev) => ({ ...prev, image_url: data.url }));
      } else if (targetField === 'artisan') {
        setArtisanForm((prev) => ({ ...prev, portrait_url: data.url }));
      } else if (targetField === 'craft') {
        setCraftForm((prev) => ({ ...prev, image_url: data.url }));
      }
      showToast('Image uploaded successfully');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingItem(null);
    if (activeTab === 'products') {
      setProductForm({
        name: '',
        slug: '',
        description: '',
        price_inr: 0,
        stock: 5,
        category_id: categories[0]?.id || '',
        artisan_id: artisans[0]?.id || '',
        image_url: '',
        featured: false,
        active: true,
      });
    } else if (activeTab === 'categories') {
      setCategoryForm({ name: '', sort_order: categories.length + 1 });
    } else if (activeTab === 'artisans') {
      setArtisanForm({ name: '', village: '', bio: '', portrait_url: '' });
    } else if (activeTab === 'crafts') {
      setCraftForm({
        title: '',
        slug: '',
        kind: 'craft',
        tagline: '',
        body: '',
        fact: '',
        image_url: '',
        sort_order: crafts.length + 1,
      });
    }
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setEditingItem(item);
    if (activeTab === 'products') {
      setProductForm({
        name: item.name || '',
        slug: item.slug || '',
        description: item.description || '',
        price_inr: item.price_inr || 0,
        stock: item.stock || 0,
        category_id: item.category_id || '',
        artisan_id: item.artisan_id || '',
        image_url: item.image_url || '',
        featured: Boolean(item.featured),
        active: Boolean(item.active),
      });
    } else if (activeTab === 'categories') {
      setCategoryForm({
        name: item.name || '',
        sort_order: item.sort_order || 0,
      });
    } else if (activeTab === 'artisans') {
      setArtisanForm({
        name: item.name || '',
        village: item.village || '',
        bio: item.bio || '',
        portrait_url: item.portrait_url || '',
      });
    } else if (activeTab === 'crafts') {
      setCraftForm({
        title: item.title || '',
        slug: item.slug || '',
        kind: item.kind || 'craft',
        tagline: item.tagline || '',
        body: item.body || '',
        fact: item.fact || '',
        image_url: item.image_url || '',
        sort_order: item.sort_order || 0,
      });
    }
    setShowModal(true);
  };

  // Submit Modal Form (Create or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    try {
      let endpoint = `/api/admin/${activeTab}`;
      const method = modalMode === 'create' ? 'POST' : 'PATCH';
      if (modalMode === 'edit') {
        endpoint += `/${editingItem.id}`;
      }

      let body: any = {};
      if (activeTab === 'products') {
        body = {
          ...productForm,
          category_id: productForm.category_id || null,
          artisan_id: productForm.artisan_id || null,
        };
      } else if (activeTab === 'categories') {
        body = categoryForm;
      } else if (activeTab === 'artisans') {
        body = artisanForm;
      } else if (activeTab === 'crafts') {
        body = craftForm;
      }

      const res = await fetch(endpoint, {
        method,
        headers: authHeader(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Operation failed');
      }

      showToast(modalMode === 'create' ? 'Created successfully' : 'Updated successfully');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Action failed');
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Delete failed');
      }
      showToast(`Deleted "${name}"`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Delete failed');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      showToast(`Order status updated to ${status}`);
      fetchData();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const getTabSingular = (tab: AdminTab) => {
    if (tab === 'categories') return 'Category';
    if (tab === 'products') return 'Product';
    if (tab === 'artisans') return 'Artisan';
    if (tab === 'crafts') return 'Craft';
    return 'Order';
  };

  return (
    <div className="page">
      <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
        Administrator Portal
      </div>
      <h1 className="big">Catalogue &amp; Crafts.</h1>

      {/* Tabs navigation */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          margin: '32px 0 24px',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '16px',
        }}
      >
        {(['products', 'categories', 'artisans', 'crafts', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery('');
            }}
            className={`btn ${activeTab === tab ? 'fill' : ''}`}
            style={{
              padding: '8px 18px',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          className="form-control"
          style={{ maxWidth: '320px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {activeTab !== 'orders' && (
          <button className="btn fill" onClick={handleOpenCreate}>
            + Add New {getTabSingular(activeTab)}
          </button>
        )}
      </div>

      {/* Main Content Table */}
      <div className="form-card" style={{ padding: '24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', opacity: 0.7 }}>
            Loading catalogue data...
          </div>
        ) : (
          <>
            {/* Products Table */}
            {activeTab === 'products' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', opacity: 0.7, fontSize: '12px' }}>
                    <th style={{ padding: '12px 8px' }}>PRODUCT</th>
                    <th style={{ padding: '12px 8px' }}>CATEGORY</th>
                    <th style={{ padding: '12px 8px' }}>ARTISAN</th>
                    <th style={{ padding: '12px 8px' }}>PRICE</th>
                    <th style={{ padding: '12px 8px' }}>STOCK</th>
                    <th style={{ padding: '12px 8px' }}>STATUS</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                        <td style={{ padding: '14px 8px', fontWeight: 500 }}>
                          <div>{p.name}</div>
                          <div style={{ opacity: 0.5, fontSize: '11px' }}>{p.slug}</div>
                        </td>
                        <td style={{ padding: '14px 8px', opacity: 0.8 }}>
                          {p.category?.name || '—'}
                        </td>
                        <td style={{ padding: '14px 8px', opacity: 0.8 }}>
                          {p.artisan?.name || '—'}
                        </td>
                        <td style={{ padding: '14px 8px', fontWeight: 600, color: 'var(--terracotta)' }}>
                          ₹{p.price_inr.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 8px' }}>{p.stock}</td>
                        <td style={{ padding: '14px 8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '99px',
                              backgroundColor: p.active ? 'var(--olive)' : 'var(--line)',
                              color: p.active ? '#fff' : 'inherit',
                            }}
                          >
                            {p.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', marginRight: '8px' }}
                            onClick={() => handleOpenEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--terracotta)' }}
                            onClick={() => handleDeleteItem(p.id, p.name)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* Categories Table */}
            {activeTab === 'categories' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', opacity: 0.7, fontSize: '12px' }}>
                    <th style={{ padding: '12px 8px' }}>CATEGORY NAME</th>
                    <th style={{ padding: '12px 8px' }}>SORT ORDER</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {categories
                    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                        <td style={{ padding: '14px 8px', fontWeight: 500 }}>{c.name}</td>
                        <td style={{ padding: '14px 8px' }}>{c.sort_order}</td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', marginRight: '8px' }}
                            onClick={() => handleOpenEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--terracotta)' }}
                            onClick={() => handleDeleteItem(c.id, c.name)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* Artisans Table */}
            {activeTab === 'artisans' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', opacity: 0.7, fontSize: '12px' }}>
                    <th style={{ padding: '12px 8px' }}>ARTISAN</th>
                    <th style={{ padding: '12px 8px' }}>VILLAGE</th>
                    <th style={{ padding: '12px 8px' }}>BIO</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {artisans
                    .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                        <td style={{ padding: '14px 8px', fontWeight: 500 }}>{a.name}</td>
                        <td style={{ padding: '14px 8px', opacity: 0.8 }}>{a.village || '—'}</td>
                        <td style={{ padding: '14px 8px', opacity: 0.7, maxWidth: '280px' }}>
                          {a.bio ? `${a.bio.slice(0, 75)}...` : '—'}
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', marginRight: '8px' }}
                            onClick={() => handleOpenEdit(a)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--terracotta)' }}
                            onClick={() => handleDeleteItem(a.id, a.name)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* Crafts Table */}
            {activeTab === 'crafts' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', opacity: 0.7, fontSize: '12px' }}>
                    <th style={{ padding: '12px 8px' }}>CRAFT TITLE</th>
                    <th style={{ padding: '12px 8px' }}>KIND</th>
                    <th style={{ padding: '12px 8px' }}>TAGLINE</th>
                    <th style={{ padding: '12px 8px' }}>SORT ORDER</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {crafts
                    .filter((cr) => cr.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((cr) => (
                      <tr key={cr.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                        <td style={{ padding: '14px 8px', fontWeight: 500 }}>
                          <div>{cr.title}</div>
                          <div style={{ opacity: 0.5, fontSize: '11px' }}>{cr.slug}</div>
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '99px',
                              border: '1px solid var(--line)',
                            }}
                          >
                            {cr.kind}
                          </span>
                        </td>
                        <td style={{ padding: '14px 8px', opacity: 0.7, maxWidth: '240px' }}>
                          {cr.tagline || '—'}
                        </td>
                        <td style={{ padding: '14px 8px' }}>{cr.sort_order}</td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', marginRight: '8px' }}
                            onClick={() => handleOpenEdit(cr)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--terracotta)' }}
                            onClick={() => handleDeleteItem(cr.id, cr.title)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* Orders Table */}
            {activeTab === 'orders' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', opacity: 0.7, fontSize: '12px' }}>
                    <th style={{ padding: '12px 8px' }}>ORDER ID</th>
                    <th style={{ padding: '12px 8px' }}>CUSTOMER</th>
                    <th style={{ padding: '12px 8px' }}>TOTAL</th>
                    <th style={{ padding: '12px 8px' }}>STATUS</th>
                    <th style={{ padding: '12px 8px' }}>ITEMS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                      <td style={{ padding: '14px 8px', fontWeight: 600 }}>
                        #{ord.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <div>{ord.customer_name}</div>
                        <div style={{ opacity: 0.6, fontSize: '12px' }}>{ord.phone}</div>
                      </td>
                      <td style={{ padding: '14px 8px', fontWeight: 600, color: 'var(--terracotta)' }}>
                        ₹{ord.total_inr.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 8px', opacity: 0.8, fontSize: '12px' }}>
                        {ord.items?.length || 0} items
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* CRUD Modal Dialog */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: 'rgba(20, 19, 16, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '20px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="form-card"
            style={{ width: 'min(600px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2 style={{ fontSize: '24px' }}>
                {modalMode === 'create' ? `Add New ${getTabSingular(activeTab)}` : `Edit ${getTabSingular(activeTab)}`}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ fontSize: '20px', opacity: 0.6, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Product Form */}
              {activeTab === 'products' && (
                <>
                  <div className="form-group">
                    <label htmlFor="product-name">Product Name</label>
                    <input
                      id="product-name"
                      className="form-control"
                      required
                      value={productForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setProductForm((prev) => ({ ...prev, name, slug: prev.slug || slug }));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-slug">URL Slug</label>
                    <input
                      id="product-slug"
                      className="form-control"
                      required
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="product-price">Price (₹ INR)</label>
                      <input
                        id="product-price"
                        type="number"
                        className="form-control"
                        required
                        min="0"
                        value={productForm.price_inr}
                        onChange={(e) => setProductForm({ ...productForm, price_inr: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="product-stock">Stock Available</label>
                      <input
                        id="product-stock"
                        type="number"
                        className="form-control"
                        required
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="product-category">Category</label>
                      <select
                        id="product-category"
                        className="form-control"
                        value={productForm.category_id}
                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="product-artisan">Artisan / Maker</label>
                      <select
                        id="product-artisan"
                        className="form-control"
                        value={productForm.artisan_id}
                        onChange={(e) => setProductForm({ ...productForm, artisan_id: e.target.value })}
                      >
                        <option value="">Select Artisan</option>
                        {artisans.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.village || 'HP'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-desc">Product Description</label>
                    <textarea
                      id="product-desc"
                      className="form-control"
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-image">Catalogue Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'product')}
                        style={{ fontSize: '13px' }}
                      />
                      {uploadingImage && <span style={{ fontSize: '12px' }}>Uploading...</span>}
                    </div>
                    {productForm.image_url && (
                      <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
                        Image set: {productForm.image_url}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '20px', margin: '16px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={productForm.active}
                        onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                      />
                      <span>Active in Store</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      />
                      <span>Featured</span>
                    </label>
                  </div>
                </>
              )}

              {/* Category Form */}
              {activeTab === 'categories' && (
                <>
                  <div className="form-group">
                    <label htmlFor="category-name">Category Name</label>
                    <input
                      id="category-name"
                      className="form-control"
                      required
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category-sort">Sort Order</label>
                    <input
                      id="category-sort"
                      type="number"
                      className="form-control"
                      value={categoryForm.sort_order}
                      onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {/* Artisan Form */}
              {activeTab === 'artisans' && (
                <>
                  <div className="form-group">
                    <label htmlFor="artisan-name">Artisan Name</label>
                    <input
                      id="artisan-name"
                      className="form-control"
                      required
                      value={artisanForm.name}
                      onChange={(e) => setArtisanForm({ ...artisanForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="artisan-village">Village / District</label>
                    <input
                      id="artisan-village"
                      className="form-control"
                      value={artisanForm.village}
                      onChange={(e) => setArtisanForm({ ...artisanForm, village: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="artisan-bio">Artisan Bio</label>
                    <textarea
                      id="artisan-bio"
                      className="form-control"
                      rows={3}
                      value={artisanForm.bio}
                      onChange={(e) => setArtisanForm({ ...artisanForm, bio: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="artisan-image">Portrait Image</label>
                    <input
                      id="artisan-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'artisan')}
                      style={{ fontSize: '13px' }}
                    />
                    {uploadingImage && <span style={{ fontSize: '12px' }}>Uploading...</span>}
                  </div>
                </>
              )}

              {/* Craft Form */}
              {activeTab === 'crafts' && (
                <>
                  <div className="form-group">
                    <label htmlFor="craft-title">Craft Title</label>
                    <input
                      id="craft-title"
                      className="form-control"
                      required
                      value={craftForm.title}
                      onChange={(e) => setCraftForm({ ...craftForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="craft-slug">Slug</label>
                    <input
                      id="craft-slug"
                      className="form-control"
                      required
                      value={craftForm.slug}
                      onChange={(e) => setCraftForm({ ...craftForm, slug: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="craft-kind">Kind</label>
                    <select
                      id="craft-kind"
                      className="form-control"
                      value={craftForm.kind}
                      onChange={(e) => setCraftForm({ ...craftForm, kind: e.target.value as any })}
                    >
                      <option value="craft">Craft</option>
                      <option value="raw_material">Raw Material</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="craft-tagline">Tagline</label>
                    <input
                      id="craft-tagline"
                      className="form-control"
                      value={craftForm.tagline}
                      onChange={(e) => setCraftForm({ ...craftForm, tagline: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="craft-body">Story Body</label>
                    <textarea
                      id="craft-body"
                      className="form-control"
                      rows={3}
                      value={craftForm.body}
                      onChange={(e) => setCraftForm({ ...craftForm, body: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="craft-sort">Sort Order</label>
                    <input
                      id="craft-sort"
                      type="number"
                      className="form-control"
                      value={craftForm.sort_order}
                      onChange={(e) => setCraftForm({ ...craftForm, sort_order: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn fill">
                  {modalMode === 'create' ? 'Save New Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
