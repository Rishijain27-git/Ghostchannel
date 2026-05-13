import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ghost: {
          900: "#080810",
          800: "#0f0f1a",
          700: "#14141f",
          600: "#1c1c2e",
          500: "#252538",
          400: "#3a3a55",
          300: "#6b6b8a",
          200: "#9a9ab5",
          100: "#c5c5d8",
        },
        accent: {
          yellow: "#FFE94A",
          green:  "#4AFFC4",
          pink:   "#FF5FA0",
          blue:   "#5AB4FF",
          orange: "#FFB84A",
        },
      },
      fontFamily: {
        heading: ["Space Grotesk", "system-ui", "sans-serif"],
        body:    ["Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["Space Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "20px",
        pill: "9999px",
      },
      boxShadow: {
        "glow-yellow": "0 0 0 1px #FFE94A22, 0 8px 40px #FFE94A14",
        "glow-green":  "0 0 0 1px #4AFFC422, 0 8px 40px #4AFFC414",
        "glow-pink":   "0 0 0 1px #FF5FA022, 0 8px 40px #FF5FA014",
        "glow-blue":   "0 0 0 1px #5AB4FF22, 0 8px 40px #5AB4FF14",
        "card":        "0 4px 24px rgba(0,0,0,0.45)",
      },
      backdropBlur: {
        glass: "18px",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "glow-yellow": "radial-gradient(circle, #FFE94A18 0%, transparent 70%)",
        "glow-pink":   "radial-gradient(circle, #FF5FA014 0%, transparent 70%)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      animation: {
        "spin-slow": "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}

export default config
