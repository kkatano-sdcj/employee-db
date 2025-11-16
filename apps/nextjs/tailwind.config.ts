import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        accent: {
          blue: "#3b82f6",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          violet: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(15, 23, 42, 0.15)",
        glow: "0 0 25px rgba(59, 130, 246, 0.25)",
      },
    },
  },
  daisyui: {
    themes: [
      {
        corporate: {
          primary: "#3b82f6",
          secondary: "#10b981",
          accent: "#f59e0b",
          neutral: "#1e293b",
          "base-100": "#f8fafc",
        },
      },
    ],
  },
  plugins: [daisyui],
};

export default config;
