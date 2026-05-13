'use client';

import './globals.css';
import { useEffect, useRef, useCallback, useState } from 'react';
import { triggerPanic } from '@/lib/panicStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ── Design tokens (shared across layout) ─────────────────────────────────────
const tokens = {
  yellow: '#FFE94A',
  green:  '#4AFFC4',
  pink:   '#FF5FA0',
  muted:  '#7A7A9A',
  border: 'rgba(255,255,255,0.10)',
};

// ── Grid + glow background ───────────────────────────────────────────────────
function GridBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div className="bg-grid" style={{ position: 'absolute', inset: 0 }} />
      <div style={{
        position: 'absolute', top: '-30%', left: '10%',
        width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, ${tokens.yellow}15 0%, transparent 70%)`,
      }} />
      <div style={{
        position: 'absolute', bottom: '-25%', right: '5%',
        width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${tokens.pink}12 0%, transparent 70%)`,
      }} />
    </div>
  );
}

// ── Noise overlay ─────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', opacity: 0.04, zIndex: 999 }}>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

// ── Nav link ──────────────────────────────────────────────────────────────────
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <motion.span
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'inline-block',
          padding: '0.4rem 1rem',
          borderRadius: 9999,
          background: active ? tokens.yellow : 'transparent',
          color: active ? '#000' : tokens.muted,
          fontFamily: "'Space Grotesk', monospace",
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {label}
      </motion.span>
    </Link>
  );
}

// ── Panic countdown overlay ──────────────────────────────────────────────────
function PanicOverlay({ countdown }: { countdown: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(255,20,60,0.16)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: '5rem', fontWeight: 900, fontFamily: "'Space Grotesk',monospace", color: tokens.pink }}>
          ⚠ {countdown}
        </div>
        <div style={{ fontSize: '0.8rem', color: tokens.muted, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8 }}>
          Release ESC to cancel
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const escTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoldingRef  = useRef(false);
  const [panicCountdown, setPanicCountdown] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isHoldingRef.current) {
      isHoldingRef.current = true;
      let count = 2;
      setPanicCountdown(count);
      escTimerRef.current = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(escTimerRef.current!);
          escTimerRef.current = null;
          setPanicCountdown(null);
          triggerPanic();
        } else {
          setPanicCountdown(count);
        }
      }, 1000);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      isHoldingRef.current = false;
      if (escTimerRef.current) { clearInterval(escTimerRef.current); escTimerRef.current = null; }
      setPanicCountdown(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (escTimerRef.current) clearInterval(escTimerRef.current);
    };
  }, [handleKeyDown, handleKeyUp]);

  const navLinks = [
    { href: '/',        label: 'Home'   },
    { href: '/embed',   label: 'Hide'   },
    { href: '/extract', label: 'Reveal' },
    { href: '/gallery', label: 'Photos' },
  ];

  return (
    <html lang="en">
      <head>
        <title>GhostChannel — Secure Image Communication</title>
        <meta name="description" content="Hide AES-256 encrypted messages inside ordinary images" />
      </head>
      <body style={{ minHeight: '100vh', background: '#080810', color: '#F0F0F8', overflowX: 'hidden' }}>

        <GridBackground />
        <NoiseOverlay />

        {/* Panic overlay */}
        <AnimatePresence>
          {panicCountdown !== null && <PanicOverlay key="panic" countdown={panicCountdown} />}
        </AnimatePresence>

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'sticky', top: 0, zIndex: 50,
            borderBottom: `1px solid ${tokens.border}`,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            background: 'rgba(8,8,16,0.85)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, background: tokens.yellow, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em', color: '#F0F0F8' }}>
                GHOST<span style={{ color: tokens.yellow }}>CHANNEL</span>
              </span>
            </Link>

            {/* Tab pills */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 9999, border: `1px solid ${tokens.border}` }}>
              {navLinks.map(l => (
                <NavLink key={l.href} href={l.href} label={l.label} active={pathname === l.href} />
              ))}
            </div>

            {/* Panic button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${tokens.pink}55` }}
              whileTap={{ scale: 0.96 }}
              onClick={triggerPanic}
              style={{
                background: `${tokens.pink}22`,
                border: `1px solid ${tokens.pink}55`,
                color: tokens.pink,
                borderRadius: 9999,
                padding: '0.4rem 1rem',
                fontFamily: "'Space Mono',monospace",
                fontWeight: 700,
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              ⚡ Panic
            </motion.button>
          </div>
        </motion.nav>

        {/* Page content */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
          {children}
        </main>

        {/* Footer hint */}
        <div style={{
          position: 'fixed', bottom: 16, right: 16,
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '6px 14px', borderRadius: 8,
          backdropFilter: 'blur(8px)', zIndex: 10,
        }}>
          <span style={{ fontSize: '0.6rem', fontFamily: "'Space Mono',monospace", color: tokens.muted }}>
            HOLD ESC 2S TO PANIC
          </span>
        </div>
      </body>
    </html>
  );
}
