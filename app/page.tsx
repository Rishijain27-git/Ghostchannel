import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-16">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '1rem' }}>

        <div style={{
          display: 'inline-block',
          background: 'rgba(255,233,74,0.12)',
          border: '1px solid rgba(255,233,74,0.35)',
          borderRadius: 9999,
          padding: '0.35rem 1.1rem',
          marginBottom: '2rem',
        }}>
          <span style={{ fontSize: '0.65rem', fontFamily: "'Space Mono',monospace", color: '#FFE94A', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            100% Client-Side · Zero Server · AES-256
          </span>
        </div>

        <h1 className="neo-heading" style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', color: '#F0F0F8', marginBottom: '1.5rem' }}>
          GHOST<br />
          <span style={{ color: '#FFE94A' }}>CHANNEL</span>
        </h1>

        <p style={{ fontSize: '1rem', color: '#7A7A9A', maxWidth: 460, margin: '0 auto 2.5rem', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.7 }}>
          Hide AES-256 encrypted messages inside ordinary images.
          To any observer, you&apos;re just sharing photos.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/embed">
            <button className="pill-button pill-button--yellow" style={{ padding: '0.75rem 2rem', fontSize: '0.78rem' }}>
              🔒 Hide a Message
            </button>
          </Link>
          <Link href="/extract">
            <button className="pill-button pill-button--ghost" style={{ padding: '0.75rem 2rem', fontSize: '0.78rem' }}>
              🔓 Reveal a Message
            </button>
          </Link>
        </div>
      </section>

      {/* ── How It Works — bento row ──────────────────────────────────── */}
      <section>
        <h2 className="neo-heading" style={{ fontSize: '1.8rem', color: '#F0F0F8', marginBottom: '1.25rem' }}>
          How It Works
        </h2>
        <div className="bento-3col">
          {[
            { step: '01', title: 'Encrypt', accent: '#FFE94A', body: 'Your message is encrypted with AES-256-GCM using a PBKDF2 password-derived key.' },
            { step: '02', title: 'Embed',   accent: '#4AFFC4', body: 'The ciphertext is written into the least-significant bits of each pixel channel.' },
            { step: '03', title: 'Share',   accent: '#FF5FA0', body: 'The image looks identical. Only the password holder can extract and decrypt it.' },
          ].map(({ step, title, accent, body }) => (
            <div key={step} className={`glass-card glass-card--${accent === '#FFE94A' ? 'yellow' : accent === '#4AFFC4' ? 'green' : 'pink'}`}
              style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.6rem', fontFamily: "'Space Mono',monospace", color: accent, letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
                STEP {step}
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: '1.1rem', color: '#F0F0F8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#7A7A9A', lineHeight: 1.65 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features — 2×2 bento ─────────────────────────────────────── */}
      <section>
        <h2 className="neo-heading" style={{ fontSize: '1.8rem', color: '#F0F0F8', marginBottom: '1.25rem' }}>
          Features
        </h2>
        <div className="bento-2col" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { accent: '#FFE94A', cls: 'yellow', title: 'Military-Grade Crypto', body: 'AES-256-GCM with PBKDF2 key derivation (100k iterations). Your data never leaves the browser.' },
            { accent: '#4AFFC4', cls: 'green',  title: 'PNG Always',           body: 'Lossless PNG format guarantees the embedded bits survive. JPEG compression destroys them.' },
            { accent: '#FF5FA0', cls: 'pink',   title: 'Panic Mode',           body: 'Hold ESC for 2 seconds to instantly wipe all state and redirect to an innocent photo gallery.' },
            { accent: '#5AB4FF', cls: 'blue',   title: 'No Backend',           body: 'Pure client-side. No servers, no logs, no network requests. Nothing leaves your machine.' },
          ].map(f => (
            <div key={f.title} className={`glass-card glass-card--${f.cls}`} style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: '0.95rem', color: f.accent, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#7A7A9A', lineHeight: 1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Warning pill ─────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', paddingBottom: '2rem' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,233,74,0.10)',
          border: '1px solid rgba(255,233,74,0.35)',
          borderRadius: 12,
          padding: '0.75rem 1.5rem',
        }}>
          <span style={{ fontSize: '0.68rem', fontFamily: "'Space Mono',monospace", color: '#FFE94A' }}>
            ⚠ Always use PNG format — JPEG compression destroys hidden data
          </span>
        </div>
      </section>

    </div>
  );
}
