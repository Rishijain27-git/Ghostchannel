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
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a25",
          600: "#252536",
          500: "#3a3a50",
          400: "#6b6b8a",
          300: "#9a9ab5",
          200: "#c5c5d8",
          100: "#e8e8f0",
        },
        yellow: "#ffee32",
        gray: {
          2: "#4a4a5a",
          3: "#6b6b8a",
        },
      },
      fontFamily: {
        heading: ["Courier New", "monospace"],
        body: ["system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        neo: "6px 6px 0px 0px #000000",
        "neo-white": "6px 6px 0px 0px #ffffff",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}

export default config
