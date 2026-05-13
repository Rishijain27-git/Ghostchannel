"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const images = [
  { id: 1, title: "Mountain Sunrise", date: "Dec 2024", accent: "blue",   emoji: "🏔", cls: "glass-card--blue"   },
  { id: 2, title: "City Lights",      date: "Nov 2024", accent: "pink",   emoji: "🌆", cls: "glass-card--pink"   },
  { id: 3, title: "Forest Path",      date: "Oct 2024", accent: "green",  emoji: "🌲", cls: "glass-card--green"  },
  { id: 4, title: "Ocean Waves",      date: "Sep 2024", accent: "blue",   emoji: "🌊", cls: "glass-card--blue"   },
  { id: 5, title: "Desert Dunes",     date: "Aug 2024", accent: "yellow", emoji: "🏜", cls: "glass-card--yellow" },
  { id: 6, title: "Snow Peak",        date: "Jul 2024", accent: "yellow", emoji: "🗻", cls: "glass-card--yellow" },
];

const accentHex: Record<string, string> = {
  blue: "#5AB4FF", pink: "#FF5FA0", green: "#4AFFC4", yellow: "#FFE94A",
};

export default function GalleryPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">

      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: "2rem" }}>
        <h1 className="neo-heading" style={{ fontSize: "clamp(2.5rem, 7vw, 4rem)", color: "#F0F0F8", marginBottom: "0.6rem" }}>
          My Photos
        </h1>
        <p style={{ color: "#7A7A9A", fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.85rem" }}>
          A collection of my favourite shots.
        </p>
      </motion.div>

      {/* Grid */}
      <div className="bento-3col">
        {images.map((img) => (
          <motion.div
            key={img.id}
            variants={itemVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            className={`glass-card ${img.cls}`}
            style={{ cursor: "pointer", overflow: "hidden" }}
          >
            {/* Placeholder image area */}
            <div style={{
              height: 170,
              background: `${accentHex[img.accent]}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3.2rem",
              borderBottom: `1px solid ${accentHex[img.accent]}22`,
            }}>
              {img.emoji}
            </div>

            {/* Card body */}
            <div style={{ padding: "0.9rem 1.1rem" }}>
              <div style={{
                fontFamily: "'Space Grotesk',monospace",
                fontWeight: 700,
                fontSize: "0.82rem",
                color: "#F0F0F8",
                marginBottom: 4,
              }}>
                {img.title}
              </div>
              <div style={{ fontSize: "0.65rem", fontFamily: "'Space Mono',monospace", color: "#7A7A9A" }}>
                {img.date}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Warning */}
      <motion.div variants={itemVariants} style={{ textAlign: "center", marginTop: "2.5rem" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(255,233,74,0.10)",
          border: "1px solid rgba(255,233,74,0.35)",
          borderRadius: 12,
          padding: "0.75rem 1.5rem",
        }}>
          <span style={{ fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", color: "#FFE94A" }}>
            ⚠ Always use PNG format — JPEG compression destroys hidden data
          </span>
        </div>
      </motion.div>

    </motion.div>
  );
}
