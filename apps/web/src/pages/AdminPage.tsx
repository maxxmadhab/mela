import React, { useState } from 'react';
import { useToast } from '../components/Toast';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'crafts' | 'artisans'>('products');
  const { showToast } = useToast();

  return (
    <div className="page">
      <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>Admin Console</div>
      <h1 className="big">Catalogue &amp; Crafts.</h1>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '30px 0' }}>
        {(['products', 'categories', 'artisans', 'crafts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? 'fill' : ''}`}
            style={{ padding: '8px 20px', fontSize: '11px' }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="form-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px' }}>Manage {activeTab}</h2>
          <button
            className="btn fill"
            onClick={() => showToast(`Add ${activeTab.slice(0, -1)} modal (Phase 8)`)}
          >
            + Add New {activeTab.slice(0, -1)}
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px', opacity: 0.8, fontSize: '14px' }}>
          Catalogue management table and CRUD controls will connect to Supabase storage and endpoints in Phase 8.
        </div>
      </div>
    </div>
  );
};
