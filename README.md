# GhostChannel — Secure Image-Based Communication

> Hide AES-256 encrypted messages inside ordinary images.  
> To any observer, you're just sharing photos.

---

## How It Works (3-Layer Architecture)

```
YOUR MESSAGE
    │
    ▼
[1] AES-256-GCM ENCRYPTION          ← lib/crypto.ts
    Password → PBKDF2 → 256-bit key
    Encrypts message → ciphertext bytes
    Bundles: salt(16B) + IV(12B) + ciphertext
    │
    ▼
[2] LSB STEGANOGRAPHY                ← lib/lsb.ts
    Encrypted bytes → binary bits
    Each bit replaces LSB of one pixel channel (R/G/B)
    32-bit length header embedded first
    Visual difference: imperceptible (max 1/255 per channel)
    │
    ▼
[3] PNG IMAGE                        ← looks completely normal
    Share via WhatsApp, email, Telegram, anywhere
    Receiver extracts → decrypts → reads message
```

---

## Features

| Feature | How | File |
|---------|-----|------|
| LSB Steganography | Canvas API pixel manipulation | `lib/lsb.ts` |
| AES-256-GCM Encryption | Web Crypto API (hardware-accelerated) | `lib/crypto.ts` |
| Key derivation | PBKDF2 with 100,000 iterations | `lib/crypto.ts` |
| OCR Document mode | Tesseract.js (client-side) | `lib/ocr.ts` |
| Capacity meter | Real-time chars remaining | `app/embed/page.tsx` |
| Before/after preview | Side-by-side image comparison | `app/embed/page.tsx` |
| Panic mode | ESC hold 2s or button → wipe + redirect | `lib/panicStore.ts` |
| Zero server | 100% client-side, nothing sent anywhere | architecture |

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo>
cd ghostchannel
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000
```

---

## Project Structure

```
ghostchannel/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout + panic key listener
│   ├── embed/
│   │   └── page.tsx          # Hide message page
│   ├── extract/
│   │   └── page.tsx          # Reveal message page
│   └── gallery/
│       └── page.tsx          # Innocent redirect page (panic mode)
│
├── lib/
│   ├── lsb.ts                # Core LSB steganography engine
│   ├── crypto.ts             # AES-256-GCM encryption
│   ├── ocr.ts                # OCR document scanning
│   └── panicStore.ts         # Global panic state (Zustand)
│
├── package.json
└── README.md
```

---

## Security Properties

### What protects the message:
1. **AES-256-GCM** — 256-bit encryption. Breaking it would take longer than the age of the universe with current computers.
2. **PBKDF2 key derivation** — 100,000 iterations. Makes brute-force password attacks ~100,000× slower.
3. **GCM authentication tag** — Detects if the image was modified after embedding. Wrong key = automatic rejection.
4. **Random salt + IV** — Same message + same password = different ciphertext every time.

### What makes it undetectable:
1. **LSB modification** — Only the last bit of each RGB value changes. Max pixel change = 1/255 ≈ 0.4%.
2. **No visible pattern** — The order of modification follows pixel order, not any identifiable structure.
3. **Innocent appearance** — The output looks identical to the input to any observer.

### Panic mode:
- ESC held 2 seconds OR "CLEAR ALL" button
- Wipes all React state instantly
- Clears sessionStorage
- Replaces browser history (Back button disabled)
- Redirects to innocent-looking `/gallery` page

---

## Important: Use PNG, Not JPEG

JPEG compression is **lossy** — it slightly modifies pixel values to save space.  
Since LSB steganography stores data in the last bit of pixel values, JPEG compression **destroys the hidden data**.

Always:
- Use **PNG** as the cover image
- Save/download the stego file as **PNG**
- Send the stego PNG without re-compressing

---

## Capacity Formula

```
Available bytes = floor((width × height × 3 channels - 32 bits) / 8)
Usable for text = Available bytes - 44 (AES overhead)
Max chars       ≈ Usable bytes / 1.1 (UTF-8 overhead)

Example: 1920×1080 PNG
= (1920 × 1080 × 3 - 32) / 8
= 777,599 bytes available
- 44 bytes AES overhead
÷ 1.1 UTF-8 factor
≈ 706,868 characters (~700KB of text)
```

---

## Use Cases

1. **Private chat** — Share messages as photo attachments. Nobody knows there's a message.
2. **Journalist tool** — Photograph a document → OCR extracts text → embed in travel photo → share safely.
3. **Whistleblower** — Transmit sensitive info through channels that scan for encrypted files (which this isn't).
4. **Dead drop** — Post images publicly (social media) with hidden messages. Only recipient with key can read.

---

## Tech Stack

- **Next.js 14** — React framework with App Router
- **Tailwind CSS** — Utility-first styling
- **Web Crypto API** — Browser-native AES-256-GCM (no library)
- **Canvas API** — Browser-native pixel manipulation (no library)
- **Tesseract.js** — Client-side OCR
- **Zustand** — Global state for panic mode
- **TypeScript** — Full type safety
- **Vercel** — One-click deployment (free)

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel deploy
```

Or push to GitHub → connect repo on vercel.com → auto-deploy on every commit.

---

*Built for SteganoSafe hackathon challenge — combines steganography + AES encryption + OCR into a complete covert communication platform.*
