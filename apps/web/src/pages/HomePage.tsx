import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Media } from '../components/Media';
import { supabase } from '../lib/supabase';
import { Craft } from '../types';

const CRAFT_PALETTES: Record<string, [string, string]> = {
  'kullu-wool': ['#B96D52', '#4b3a33'],
  'kinnauri-weaves': ['#74765B', '#2c3633'],
  'chamba-rumal': ['#D8C9B3', '#B96D52'],
  'deodar-wood': ['#8C5D4D', '#282722'],
  'himalayan-wool-fibres': ['#c9c3b6', '#74765B'],
  'natural-dyes': ['#a39a6a', '#4b3a33'],
};

export const HomePage: React.FC = () => {
  const location = useLocation();

  const [showLanding, setShowLanding] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasEntered = sessionStorage.getItem('mela-entered');
      const hasHash = window.location.hash.length > 0;
      return !hasEntered && !hasHash;
    }
    return false;
  });

  const [landingExiting, setLandingExiting] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const m1Ref = useRef<SVGPathElement>(null);
  const m2Ref = useRef<SVGPathElement>(null);

  // Load crafts from database
  useEffect(() => {
    let isMounted = true;
    async function loadCrafts() {
      try {
        const { data, error } = await supabase
          .from('crafts')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && isMounted) {
          setCrafts(data as Craft[]);
        }
      } catch (err) {
        console.error('Failed to load craft chapters:', err);
      }
    }
    loadCrafts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Mouse parallax for landing mountain layers
  useEffect(() => {
    if (!showLanding) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      setParallaxOffset(x);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showLanding]);

  const handleEnterMela = () => {
    setLandingExiting(true);
    sessionStorage.setItem('mela-entered', 'true');
    setTimeout(() => {
      setShowLanding(false);
    }, 1100);
  };

  // Scroll observer for reveal and active chapter detection
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

    const elements = document.querySelectorAll('.rv, .chap-container');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [crafts]);

  // Handle hash jump if navigated directly
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location.hash]);

  const scrollToChapter = (index: number) => {
    const el = document.getElementById(`craft-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Full-screen Landing Intro */}
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
            overflow: 'hidden',
          }}
        >
          {/* Drifting Clouds */}
          <div className="cloud" style={{ top: '18%' }} />
          <div className="cloud" style={{ top: '34%', animationDelay: '-16s', width: '320px' }} />

          {/* Dual Layer Mountain SVGs with Parallax */}
          <svg
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '55%',
              pointerEvents: 'none',
            }}
            viewBox="0 0 1440 400"
            preserveAspectRatio="none"
          >
            <path
              ref={m1Ref}
              id="m1"
              d="M0 260 L220 120 L380 230 L600 60 L820 240 L1040 110 L1250 220 L1440 140 V400 H0Z"
              fill="#4b5a57"
              opacity="0.7"
              style={{
                transform: `translateX(${parallaxOffset}px)`,
                transition: 'transform 0.15s ease-out',
              }}
            />
            <path
              ref={m2Ref}
              id="m2"
              d="M0 330 L180 230 L360 310 L560 190 L780 320 L980 220 L1200 320 L1440 250 V400 H0Z"
              fill="#2c3633"
              style={{
                transform: `translateX(${-parallaxOffset * 1.6}px)`,
                transition: 'transform 0.15s ease-out',
              }}
            />
          </svg>

          {/* Staggered Animated Content */}
          <div className="landing-content" style={{ position: 'relative', padding: '24px', maxWidth: '860px', zIndex: 2 }}>
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

      {/* Our Story Section */}
      <section
        className="story"
        id="story"
        style={{
          minHeight: '90vh',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '6vw',
          alignItems: 'center',
        }}
      >
        <div className="rv">
          <div className="eyebrow">Our story</div>
          <h2 className="big">
            Made in the hills.<br />
            Sold without middlemen.
          </h2>
          <p style={{ opacity: 0.8, marginTop: '20px', maxWidth: '480px' }}>
            Mela is a marketplace built for Pahadi artisans and the people who value their work. Makers list their own pieces, set their own prices and tell their own stories — you buy straight from the source.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: '36px',
              borderTop: '1px solid var(--line)',
              paddingTop: '24px',
            }}
          >
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

        {/* Interactive Four-Image Mosaic */}
        <div className="mosaic-grid rv">
          <div className="mosaic-tile">
            <Media label="Artisan portrait" colorStart="#74765B" colorEnd="#2c3633" style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="mosaic-tile">
            <Media label="Loom" colorStart="#B96D52" colorEnd="#4b3a33" style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="mosaic-tile">
            <Media label="Village" colorStart="#D8C9B3" colorEnd="#8C5D4D" style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="mosaic-tile">
            <Media label="Raw wool" colorStart="#4b5a57" colorEnd="#1f2a2e" style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </section>

      {/* Crafts & Raw Materials Section */}
      <div id="crafts" style={{ position: 'relative' }}>
        {/* Fixed dot navigator on the right */}
        {crafts.length > 0 && (
          <div
            className="dots"
            style={{
              position: 'fixed',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            aria-label="Chapter Navigator"
          >
            {crafts.map((c, i) => (
              <button
                key={c.id || i}
                type="button"
                onClick={() => scrollToChapter(i)}
                title={c.title}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: '1px solid var(--charcoal)',
                  backgroundColor: activeChapter === i ? 'var(--terracotta)' : 'transparent',
                  borderColor: activeChapter === i ? 'var(--terracotta)' : 'var(--charcoal)',
                  transform: activeChapter === i ? 'scale(1.5)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        <div className="rv" style={{ padding: '100px 5vw 40px' }}>
          <div className="eyebrow">Crafts &amp; raw materials</div>
          <h2 className="big">
            The hands and<br />
            materials of Himachal.
          </h2>
          <p style={{ maxWidth: '520px', opacity: 0.75, marginTop: '18px' }}>
            Scroll through six chapters. Each one tells the story of a craft or a raw material that shapes what you find in mela.
          </p>
        </div>

        {/* Chapters */}
        {crafts.map((chap, idx) => {
          const colors = CRAFT_PALETTES[chap.slug] || ['#74765B', '#2c3633'];

          return (
            <article
              key={chap.id || chap.slug}
              id={`craft-${idx}`}
              className="chap-container"
              data-chapter={idx}
            >
              <div className="chap-pic">
                <Media
                  src={chap.image_url}
                  label={chap.title}
                  colorStart={colors[0]}
                  colorEnd={colors[1]}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>

              <div className="rv">
                <div
                  style={{
                    fontSize: 'clamp(60px, 9vw, 130px)',
                    fontWeight: 600,
                    letterSpacing: '-0.06em',
                    color: 'var(--sandstone)',
                    lineHeight: 0.8,
                    marginBottom: '10px',
                  }}
                >
                  0{idx + 1}
                </div>

                <div style={{ display: 'flex', gap: '10px', margin: '14px 0' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      border: '1px solid var(--line)',
                      borderRadius: '99px',
                      padding: '5px 12px',
                      backgroundColor: chap.kind === 'craft' ? 'var(--terracotta)' : 'transparent',
                      color: chap.kind === 'craft' ? '#fff' : 'inherit',
                      borderColor: chap.kind === 'craft' ? 'var(--terracotta)' : 'var(--line)',
                    }}
                  >
                    {chap.kind === 'craft' ? 'Craft' : 'Raw material'}
                  </span>
                </div>

                <h3 style={{ fontSize: 'clamp(30px, 4vw, 52px)' }}>{chap.title}</h3>
                <div className="eyebrow" style={{ margin: '14px 0' }}>{chap.tagline}</div>
                <p style={{ opacity: 0.8, maxWidth: '440px' }}>{chap.body}</p>

                {chap.fact && (
                  <div
                    style={{
                      marginTop: '22px',
                      paddingLeft: '16px',
                      borderLeft: '2px solid var(--terracotta)',
                      fontSize: '13px',
                      opacity: 0.9,
                    }}
                  >
                    {chap.fact}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Closing CTA */}
      <section style={{ textAlign: 'center', borderTop: '1px solid var(--line)', padding: '100px 5vw' }}>
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
