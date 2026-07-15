import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neutral base - a warm-ish gray, not pure white/black, so long
        // dashboard sessions are easier on the eyes than stark #FFF/#000.
        canvas: {
          DEFAULT: "#FAFAF9",
          dark: "#121212",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#1A1A1A",
        },
        ink: {
          DEFAULT: "#18181B",
          dark: "#F4F4F5",
        },
        muted: {
          DEFAULT: "#6B7280",
          dark: "#9CA3AF",
        },
        // Single accent: a deep, calm teal. Chosen over blue/indigo because
        // it reads as "clear communication" without tipping into generic
        // SaaS-blue or AI-purple territory.
        accent: {
          50: "#EFFCFA",
          100: "#D6F5F0",
          300: "#7FDCCF",
          500: "#0F9C8B",
          600: "#0C7F71",
          700: "#0A665A",
        },
        // Reserved for live-recognition confidence states only.
        signal: {
          low: "#DC7609",
          high: "#0C7F71",
        },
      },
      fontFamily: {
        // Space Grotesk for headings/labels: a little technical, a little
        // architectural - fits a "reads a signal, states a fact" product
        // without being decorative. Inter for everything read at length.
        display: ["\"Space Grotesk\"", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.625rem",
      },
    },
  },
  plugins: [],
} satisfies Config;