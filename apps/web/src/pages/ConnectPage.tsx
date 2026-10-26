import React, { useState } from 'react';
import { useToast } from '../components/Toast';

export const ConnectPage: React.FC = () => {
  const { showToast } = useToast();

  const [buyerForm, setBuyerForm] = useState({ name: '', email: '', message: '', honeypot: '' });
  const [artisanForm, setArtisanForm] = useState({ name_village: '', phone: '', craft_type: 'Weaving', about: '', honeypot: '' });

  const handleBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (buyerForm.honeypot) return;
    showToast('Message sent — we’ll reply soon');
    setBuyerForm({ name: '', email: '', message: '', honeypot: '' });
  };

  const handleArtisanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (artisanForm.honeypot) return;
    showToast('Thanks — we’ll reach out to you');
    setArtisanForm({ name_village: '', phone: '', craft_type: 'Weaving', about: '', honeypot: '' });
  };

  return (
    <div className="page">
      <div className="eyebrow">Connect</div>
      <h1 className="big">Let’s talk.</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '5vw',
          marginTop: '50px',
        }}
      >
        {/* Buyer Form */}
        <form onSubmit={handleBuyerSubmit} className="form-card">
          <h2 style={{ fontSize: '26px', marginBottom: '24px' }}>For buyers</h2>
          <div style={{ display: 'none' }}>
            <input
              type="text"
              name="hp_buyer"
              value={buyerForm.honeypot}
              onChange={(e) => setBuyerForm({ ...buyerForm, honeypot: e.target.value })}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="b-name">Name</label>
            <input
              id="b-name"
              className="form-control"
              placeholder="Your name"
              required
              value={buyerForm.name}
              onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="b-email">Email</label>
            <input
              id="b-email"
              type="email"
              className="form-control"
              placeholder="Your email address"
              required
              value={buyerForm.email}
              onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="b-message">Message</label>
            <textarea
              id="b-message"
              className="form-control"
              rows={4}
              placeholder="How can we help?"
              required
              value={buyerForm.message}
              onChange={(e) => setBuyerForm({ ...buyerForm, message: e.target.value })}
            />
          </div>
          <button type="submit" className="btn fill" style={{ marginTop: '12px' }}>
            Send message
          </button>
        </form>

        {/* Artisan Application Form */}
        <form onSubmit={handleArtisanSubmit} className="form-card">
          <h2 style={{ fontSize: '26px', marginBottom: '24px' }}>For artisans</h2>
          <div style={{ display: 'none' }}>
            <input
              type="text"
              name="hp_artisan"
              value={artisanForm.honeypot}
              onChange={(e) => setArtisanForm({ ...artisanForm, honeypot: e.target.value })}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="a-name">Name &amp; Village</label>
            <input
              id="a-name"
              className="form-control"
              placeholder="e.g. Sunita Devi, Naggar"
              required
              value={artisanForm.name_village}
              onChange={(e) => setArtisanForm({ ...artisanForm, name_village: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="a-phone">Phone / WhatsApp</label>
            <input
              id="a-phone"
              className="form-control"
              placeholder="+91 98765 43210"
              required
              value={artisanForm.phone}
              onChange={(e) => setArtisanForm({ ...artisanForm, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="a-craft">Craft or material</label>
            <select
              id="a-craft"
              className="form-control"
              value={artisanForm.craft_type}
              onChange={(e) => setArtisanForm({ ...artisanForm, craft_type: e.target.value })}
            >
              <option value="Weaving">Weaving</option>
              <option value="Embroidery">Embroidery</option>
              <option value="Woodcraft">Woodcraft</option>
              <option value="Basketry">Basketry</option>
              <option value="Other">Other Pahadi craft</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="a-about">Tell us about your work</label>
            <textarea
              id="a-about"
              className="form-control"
              rows={3}
              placeholder="Generational crafts, raw materials, looms..."
              required
              value={artisanForm.about}
              onChange={(e) => setArtisanForm({ ...artisanForm, about: e.target.value })}
            />
          </div>
          <button type="submit" className="btn fill" style={{ marginTop: '12px' }}>
            Join mela
          </button>
        </form>
      </div>
    </div>
  );
};
