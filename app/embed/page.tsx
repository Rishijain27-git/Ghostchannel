"use client";

import { useState, useCallback, useRef } from "react";
import { encrypt, getAESOverhead } from "@/lib/crypto";
import { embed, calculateCapacity, loadImageData, imageDataToBlob } from "@/lib/lsb";
import { extractTextFromImage } from "@/lib/ocr";
import { motion, AnimatePresence } from "framer-motion";

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const tokens = {
  yellow: "#FFE94A",
  green:  "#4AFFC4",
  pink:   "#FF5FA0",
  blue:   "#5AB4FF",
  muted:  "#7A7A9A",
};

export default function EmbedPage() {
  const [image,      setImage]      = useState<File | null>(null);
  const [imageUrl,   setImageUrl]   = useState("");
  const [imageSize,  setImageSize]  = useState<{ w: number; h: number } | null>(null);
  const [message,    setMessage]    = useState("");
  const [password,   setPassword]   = useState("");
  const [useOCR,     setUseOCR]     = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl,  setResultUrl]  = useState("");
  const [error,      setError]      = useState("");
  const [copied,     setCopied]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const capacity = imageSize ? calculateCapacity(imageSize.w, imageSize.h) : 0;
  const overhead = getAESOverhead();
  const used     = new Blob([message]).size + overhead;
  const pct      = capacity > 0 ? Math.min((used / capacity) * 100, 100) : 0;
  const over     = used > capacity;

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    setError(""); setImage(file); setResultUrl("");
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImageSize({ w: img.width, h: img.height });
    img.src = url;
    if (useOCR) {
      try {
        const text = await extractTextFromImage(file);
        setMessage((p) => p ? p + "\n" + text : text);
      } catch {}
    }
  }, [useOCR]);

  const onUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  }, [handleFile]);

  const onEmbed = useCallback(async () => {
    if (!image || !message || !password) return;
    if (over) { setError("Message too large for this image"); return; }
    setProcessing(true); setError("");
    try {
      const enc  = await encrypt(message, password);
      const data = await loadImageData(image);
      const out  = embed(data, new Uint8Array(enc));
      const blob = await imageDataToBlob(out);
      setResultUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message || "Embed failed");
    } finally {
      setProcessing(false);
    }
  }, [image, message, password, over]);

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
          Hide a Message
        </h1>
        <p style={{ color: tokens.muted, fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.88rem" }}>
          Encrypt and embed a secret into a cover image.
        </p>
      </motion.div>

      {/* Stat badges */}
      <motion.div variants={itemVariants} className="bento-stats">
        {[
          { label: "Encryption", value: "AES-256-GCM", accent: tokens.green },
          { label: "Key Derivation", value: "PBKDF2",  accent: tokens.blue  },
          { label: "Output Format", value: "PNG",      accent: tokens.yellow },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem" }}>
            <div className="field-label" style={{ marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: "0.9rem", color: s.accent }}>
              {s.value}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main bento */}
      <div className="bento-2col">

        {/* ── Left: drop zone ─────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className={`glass-card${imageUrl ? " glass-card--yellow" : ""}`}
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 16, gridRow: "1 / 3", minHeight: 440, cursor: "pointer" }}
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
            <span style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: "1rem" }}>Cover Image</span>
            {imageUrl && (
              <span className="accent-badge accent-badge--green">✓ Loaded</span>
            )}
          </div>

          {imageUrl ? (
            <motion.img
              key={imageUrl}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              src={imageUrl}
              alt="Cover preview"
              style={{ width: "100%", flex: 1, objectFit: "contain", borderRadius: 12, border: `1px solid ${tokens.yellow}44`, maxHeight: 280 }}
            />
          ) : (
            <div className="drop-zone" style={{ flex: 1 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${tokens.yellow}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tokens.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>
                  Drop image here
                </div>
                <div style={{ fontSize: "0.7rem", color: tokens.muted }}>or click to browse · PNG recommended</div>
              </div>
            </div>
          )}

          {/* Capacity bar */}
          {capacity > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="field-label" style={{ marginBottom: 0 }}>Capacity</span>
                <span style={{ fontSize: "0.65rem", fontFamily: "'Space Mono',monospace", color: over ? tokens.pink : tokens.yellow }}>
                  {used.toLocaleString()} / {capacity.toLocaleString()} bytes
                </span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 9999, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ height: "100%", background: over ? tokens.pink : tokens.yellow, borderRadius: 9999 }}
                />
              </div>
              {over && (
                <p style={{ color: tokens.pink, fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", marginTop: 6, textTransform: "uppercase" }}>
                  Message exceeds image capacity
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Right top: message + password ───────────────────────────── */}
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 800, fontSize: "1rem" }}>Secret Payload</div>

          {/* OCR toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input id="ocr" type="checkbox" checked={useOCR} onChange={(e) => setUseOCR(e.target.checked)}
              style={{ width: "auto", accentColor: tokens.yellow }} />
            <label htmlFor="ocr" style={{ marginBottom: 0, cursor: "pointer", fontSize: "0.72rem" }}>
              Auto-extract text from image via OCR
            </label>
          </div>

          <div>
            <label className="field-label">Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your secret message…"
              rows={5}
              className="ghost-input"
              style={{ resize: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
              <button onClick={onCopy}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", color: tokens.yellow, textDecoration: "underline", textTransform: "uppercase" }}>
                {copied ? "Copied!" : "Copy text"}
              </button>
            </div>
          </div>

          <div>
            <label className="field-label">Encryption Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password" className="ghost-input" />
          </div>
        </motion.div>

        {/* ── Right bottom: action ────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="glass-card glass-card--green" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", gap: 12 }}>

          <AnimatePresence>
            {error && (
              <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="alert-error">{error}</motion.div>
            )}
          </AnimatePresence>

          <button
            className="pill-button pill-button--yellow"
            onClick={onEmbed}
            disabled={!image || !message || !password || over || processing}
            style={{ width: "100%", padding: "0.75rem" }}
          >
            {processing ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>⏳</motion.span>
                Embedding…
              </span>
            ) : "🔒 Hide Message in Image"}
          </button>

          <AnimatePresence>
            {resultUrl && (
              <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <img src={resultUrl} alt="Result" style={{ width: "100%", borderRadius: 10, border: `1px solid ${tokens.green}44`, marginBottom: 10 }} />
                <a href={resultUrl} download="ghostchannel-stego.png">
                  <button className="pill-button pill-button--green" style={{ width: "100%", padding: "0.7rem" }}>
                    ⬇ Download Stego PNG
                  </button>
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <p style={{ fontSize: "0.62rem", fontFamily: "'Space Mono',monospace", color: tokens.muted, textAlign: "center", lineHeight: 1.65 }}>
            All processing runs locally in your browser.<br />No data ever leaves your device.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}
