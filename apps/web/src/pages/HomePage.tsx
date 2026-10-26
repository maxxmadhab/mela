import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Media } from '../components/Media';

export const HomePage: React.FC = () => {
  const [showLanding, setShowLanding] = useState(() => {
    // Only show landing intro on first visit per session
    if (typeof window !== 'undefined') {
      const hasEntered = sessionStorage.getItem('mela-entered');
      return !hasEntered;
    }
    return true;
  });
  const [landingExiting, setLandingExiting] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const handleEnterMela = () => {
    setLandingExiting(true);
    sessionStorage.setItem('mela-entered', 'true');
    setTimeout(() => {
      setShowLanding(false);
    }, 1100);
  };

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            const chapterIdx = (entry.target as HTMLElement).dataset.chapter;
            if (chapterIdx !== undefined) {
              setActiveChapter(parseInt(chapterIdx, 10));
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = document.querySelectorAll('.rv, .chap');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {showLanding && (
        <div
          id="landing"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            color: '#F5F1E8',
            background:
              'radial-gradient(ellipse at 50% 120%, #B96D52, transparent 55%), linear-gradient(180deg, #1f2a2e, #3d4a4b 55%, #74765B)',
            transform: landingExiting ? 'translateY(-100%)' : 'none',
            transition: 'transform 1.1s cubic-bezier(0.77, 0, 0.18, 1)',
          }}
        >
          <div
            style={{
              position: 'relative',
              padding: '24px',
              maxWidth: '860px',
            }}
          >
            <div className="eyebrow" style={{ color: '#D8C9B3', letterSpacing: '0.4em' }}>
              Himachal Pradesh · Direct from the hills
            </div>
            <h1 style={{ fontSize: 'clamp(54px, 11vw, 140px)', letterSpacing: '0.06em', margin: '18px 0', color: '#F5F1E8' }}>
              MELA
            </h1>
            <p style={{ maxWidth: '460px', margin: '0 auto 34px', opacity: 0.85, fontSize: '16px' }}>
              A marketplace where Pahadi artisans meet you — no middlemen, just makers and their stories.
            </p>
            <button
              className="btn"
              onClick={handleEnterMela}
              style={{ color: '#F5F1E8', borderColor: '#F5F1E8' }}
            >
              Enter mela
            </button>
          </div>
        </div>
      )}

      {/* Story section */}
      <section className="story" id="story" style={{ minHeight: '85vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '6vw', alignItems: 'center' }}>
        <div className="rv">
          <div className="eyebrow">Our story</div>
          <h2 className="big">Made in the hills.<br />Sold without middlemen.</h2>
          <p style={{ opacity: 0.8, marginTop: '20px', maxWidth: '480px' }}>
            Mela is a marketplace built for Pahadi artisans and the people who value their work. Makers list their own pieces, set their own prices and tell their own stories — you buy straight from the source.
          </p>
          <div style={{ display: 'flex', gap: '40px', marginTop: '36px', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
            <div>
              <b style={{ display: 'block', fontSize: '42px', fontWeight: 600, color: 'var(--terracotta)' }}>0</b>
              middlemen
            </div>
            <div>
              <b style={{ display: 'block', fontSize: '42px', fontWeight: 600, color: 'var(--terracotta)' }}>100%</b>
              maker-led
            </div>
            <div>
              <b style={{ display: 'block', fontSize: '42px', fontWeight: 600, color: 'var(--terracotta)' }}>1</b>
              hill community
            </div>
          </div>
          <div style={{ marginTop: '34px' }}>
            <Link to="/shop" className="btn fill">
              Shop direct
            </Link>
          </div>
        </div>

        <div
          className="rv"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '220px 220px',
            gap: '14px',
          }}
        >
          <Media label="Artisan portrait" colorStart="#74765B" colorEnd="#2c3633" style={{ gridRow: 'span 2', borderRadius: '4px' }} />
          <Media label="Loom" colorStart="#B96D52" colorEnd="#4b3a33" style={{ borderRadius: '4px' }} />
          <Media label="Village" colorStart="#D8C9B3" colorEnd="#8C5D4D" style={{ borderRadius: '4px' }} />
        </div>
      </section>

      {/* Crafts Section */}
      <div id="crafts" style={{ position: 'relative' }}>
        {/* Fixed dot navigator on the right */}
        <div
          style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: '1px solid var(--charcoal)',
                backgroundColor: activeChapter === i ? 'var(--terracotta)' : 'transparent',
                borderColor: activeChapter === i ? 'var(--terracotta)' : 'var(--charcoal)',
                transform: activeChapter === i ? 'scale(1.4)' : 'scale(1)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <div className="rv" style={{ padding: '80px 5vw 40px' }}>
          <div className="eyebrow">Crafts &amp; raw materials</div>
          <h2 className="big">The hands and<br />materials of Himachal.</h2>
          <p style={{ maxWidth: '520px', opacity: 0.75, marginTop: '18px' }}>
            Scroll through six chapters. Each one tells the story of a craft or a raw material that shapes what you find in mela.
          </p>
        </div>

        {/* Chapters */}
        {[
          { num: '01', title: 'Kullu Wool', kind: 'Craft', tag: 'Wool of the valley', desc: 'Soft, warm shawls spun from local sheep wool and woven on hand looms in Kullu valley homes.', fact: 'A single shawl can take several days of hand weaving.', c1: '#B96D52', c2: '#4b3a33' },
          { num: '02', title: 'Kinnauri Weaves', kind: 'Craft', tag: 'Patterns from the high valleys', desc: 'Kinnaur’s weavers are known for geometric borders and bright accent bands, woven for caps and shawls.', fact: 'Motifs are often passed down within families.', c1: '#74765B', c2: '#2c3633' },
          { num: '03', title: 'Chamba Rumal', kind: 'Craft', tag: 'Embroidery as painting', desc: 'Chamba rumals are embroidered with fine double-satin stitch, often showing scenes from Pahari miniature painting.', fact: 'The design looks identical on both sides of the cloth.', c1: '#D8C9B3', c2: '#B96D52' },
          { num: '04', title: 'Deodar Wood', kind: 'Raw material', tag: 'The tree of the gods', desc: 'Deodar, a Himalayan cedar, is prized for its scent and durability in hill homes, temples and hand-carved objects.', fact: 'The name comes from a Sanskrit phrase meaning ‘timber of the gods’.', c1: '#8C5D4D', c2: '#282722' },
          { num: '05', title: 'Himalayan Wool & Fibres', kind: 'Raw material', tag: 'From fleece to thread', desc: 'Sheep wool, goat hair and hemp fibre are cleaned, spun and woven into cloth.', fact: 'Hemp has been woven in the hills for centuries.', c1: '#c9c3b6', c2: '#74765B' },
          { num: '06', title: 'Natural Dyes', kind: 'Raw material', tag: 'Colour from the landscape', desc: 'Bark, roots, leaves and walnut husks give soft earthy shades.', fact: 'No two dye lots are exactly the same.', c1: '#a39a6a', c2: '#4b3a33' },
        ].map((chap, idx) => (
          <article
            key={chap.title}
            className="chap"
            data-chapter={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: idx % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr',
              minHeight: '75vh',
              alignItems: 'center',
              gap: '5vw',
              padding: '60px 5vw',
              borderTop: '1px solid var(--line)',
            }}
          >
            <div style={{ order: idx % 2 === 0 ? 1 : 2, height: '65vh', borderRadius: '4px', overflow: 'hidden' }}>
              <Media label={chap.title} colorStart={chap.c1} colorEnd={chap.c2} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="rv" style={{ order: idx % 2 === 0 ? 2 : 1 }}>
              <div style={{ fontSize: 'clamp(50px, 8vw, 110px)', fontWeight: 600, color: 'var(--sandstone)', lineHeight: 0.8, marginBottom: '12px' }}>
                {chap.num}
              </div>
              <div style={{ display: 'inline-block', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', border: '1px solid var(--line)', borderRadius: '99px', padding: '5px 12px', marginBottom: '16px', background: chap.kind === 'Craft' ? 'var(--terracotta)' : 'transparent', color: chap.kind === 'Craft' ? '#fff' : 'inherit' }}>
                {chap.kind}
              </div>
              <h3 style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>{chap.title}</h3>
              <div className="eyebrow" style={{ margin: '14px 0' }}>{chap.tag}</div>
              <p style={{ opacity: 0.8, maxWidth: '440px' }}>{chap.desc}</p>
              <div style={{ marginTop: '22px', paddingLeft: '16px', borderLeft: '2px solid var(--terracotta)', fontSize: '13px', opacity: 0.9 }}>
                {chap.fact}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Closing CTA */}
      <section style={{ textAlign: 'center', borderTop: '1px solid var(--line)' }}>
        <h2 className="big">Meet the makers.</h2>
        <p style={{ opacity: 0.7, margin: '18px 0 30px' }}>
          Browse pieces made by the people behind these crafts.
        </p>
        <Link to="/shop" className="btn fill">
          Visit the shop
        </Link>
      </section>
    </>
  );
};
