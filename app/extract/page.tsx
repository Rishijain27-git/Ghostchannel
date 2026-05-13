"use client";

import { useState, useCallback, useRef } from "react";
import { decrypt } from "@/lib/crypto";
import { extract as lsbExtract, loadImageData } from "@/lib/lsb";
import { motion, AnimatePresence } from "framer-motion";

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const tokens = {
  yellow: "#FFE94A",
  green:  "#4AFFC4",
  pink:   "#FF5FA0",
  blue:   "#5AB4FF",
  muted:  "#7A7A9A",
};

export default function ExtractPage() {
  const [image,      setImage]      = useState<File | null>(null);
  const [imageUrl,   setImageUrl]   = useState("");
  const [password,   setPassword]   = useState("");
  const [processing, setProcessing] = useState(false);
  const [message,    setMessage]    = useState("");
  const [error,      setError]      = useState("");
  const [copied,     setCopied]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    setError(""); setMessage(""); setImage(file);
    setImageUrl(URL.createObjectURL(file));
  }, []);

  const onUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  }, [handleFile]);

  const onExtract = useCallback(async () => {
    if (!image || !password) return;
    setProcessing(true); setError(""); setMessage("");
    try {
      const data      = await loadImageData(image);
      const extracted = lsbExtract(data);
      const decrypted = await decrypt(new Uint8Array(extracted.buffer), password);
      setMessage(decrypted);
    } catch (e: any) {
      setError(e.message || "Failed to extract or decrypt. Wrong password?");
    } finally {
      setProcessing(false);
    }
  }, [image, password]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">

      {/* Page header */}
      <motion.div variants={itemVariants} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 className="neo-heading" style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", color: "#F0F0F8", marginBottom: "0.75rem" }}>
          Reveal a Message
        </h1>
        <p style={{ color: tokens.muted, fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.88rem" }}>
          Extract and decrypt a hidden message from a stego image.
        </p>
      </motion.div>

      {/* Main bento */}
      <div className="bento-2col">

        {/* ── Left: drop zone ─────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className={`glass-card${imageUrl ? " glass-card--pink" : ""}`}
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 16, minHeight: 380, cursor: "pointer" }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e: React.DragEvent) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f?.type.startsWith("image/")) handleFile(f);
            else setError("Please drop an image file");
          }}
        >
          <input ref={inputRef} type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: "1rem" }}>Stego Image</span>
            {imageUrl && (
              <span className="accent-badge accent-badge--green">✓ Ready</span>
            )}
          </div>

          {imageUrl ? (
            <motion.img
              key={imageUrl}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              src={imageUrl}
              alt="Preview"
              style={{ width: "100%", flex: 1, objectFit: "contain", borderRadius: 12, border: `1px solid ${tokens.pink}44`, maxHeight: 280 }}
            />
          ) : (
            <div className="drop-zone" style={{ flex: 1 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${tokens.pink}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tokens.pink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <path d="M11 8v6M8 11h6"/>
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>
                  Drop stego image here
                </div>
                <div style={{ fontSize: "0.7rem", color: tokens.muted }}>or click to browse</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Right: controls ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Password + action */}
          <motion.div variants={itemVariants} className="glass-card" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: "1rem" }}>Decryption</div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password used during embedding…"
                className="ghost-input"
                onKeyDown={(e) => e.key === "Enter" && onExtract()}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="alert-error">{error}</motion.div>
              )}
            </AnimatePresence>

            <button
              className="pill-button pill-button--pink"
              onClick={onExtract}
              disabled={!image || !password || processing}
              style={{ width: "100%", padding: "0.75rem" }}
            >
              {processing ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>🔍</motion.span>
                  Scanning…
                </span>
              ) : "🔓 Reveal Message"}
            </button>
          </motion.div>

          {/* Crypto info badges */}
          <motion.div variants={itemVariants} className="glass-card" style={{ padding: "1rem 1.25rem" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "AES-256-GCM", accent: "green" },
                { label: "LSB Extract", accent: "blue"  },
                { label: "PBKDF2",      accent: "yellow" },
              ].map(b => (
                <span key={b.label} className={`accent-badge accent-badge--${b.accent}`}>{b.label}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Decrypted result ──────────────────────────────────────────── */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 16 }}
          >
            <div className="glass-card glass-card--green" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: "1rem", color: tokens.green }}>
                  ✓ Message Decrypted
                </span>
                <button className="pill-button pill-button--green" onClick={onCopy} style={{ padding: "0.4rem 1rem" }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div style={{
                background: "rgba(0,0,0,0.35)",
                borderRadius: 10,
                padding: "1rem",
                fontFamily: "'Space Mono',monospace",
                fontSize: "0.8rem",
                lineHeight: 1.7,
                color: "#F0F0F8",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
