import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",

        /* ── Semantic backgrounds ── */
        base:     "var(--bg-base)",
        elevated: "var(--bg-elevated)",
        surface:  "var(--bg-surface)",
        muted:    "var(--bg-muted)",
        subtle:   "var(--bg-subtle)",

        /* ── Semantic text ── */
        "t-primary":   "var(--text-primary)",
        "t-secondary": "var(--text-secondary)",
        "t-muted":     "var(--text-muted)",
        "t-faint":     "var(--text-faint)",
        "t-ghost":     "var(--text-ghost)",

        /* ── French palette ── */
        french: {
          blue:       "#000091",
          white:      "#ffffff",
          red:        "#e1000f",
          black:      "#000000",
          gold:       "#e3b505",
          darkBlue:   "#0B1220",
          lightBlue:  "#4169E1",
          brightBlue: "#60A5FA",
          paleBlue:   "#93C5FD",
          coral:      "#FF6B6B",
          goldLight:  "#FFD700",
          purple:     "#A855F7",
          lime:       "#84CC16",
        },
      },
      borderColor: {
        DEFAULT: "var(--border-default)",
        strong:  "var(--border-strong)",
        subtle:  "var(--border-subtle)",
        gold:    "var(--border-gold)",
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        "spin-slow": "spin 3s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient": "gradient 8s ease infinite",
        "float": "float 3s ease-in-out infinite",
        "pop": "pop 0.3s ease-out",
        "slideUp": "slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "french-gradient": "linear-gradient(135deg, #000091 0%, #4169E1 50%, #e1000f 100%)",
        "french-flag": "linear-gradient(90deg, #000091 33%, #ffffff 33%, #ffffff 66%, #e1000f 66%)",
        "ocean-gradient": "linear-gradient(135deg, #000091 0%, #60A5FA 100%)",
        "fire-gradient": "linear-gradient(135deg, #e1000f 0%, #e3b505 100%)",
        "gold-gradient": "linear-gradient(135deg, #e3b505 0%, #FFD700 100%)",
        "dark-gradient": "linear-gradient(180deg, #0B1220 0%, #09090B 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(0, 0, 145, 0.3) 0%, rgba(11, 18, 32, 0.5) 100%)",
        "success-gradient": "linear-gradient(135deg, #162419 0%, #1a3a2a 100%)",
      },
      boxShadow: {
        "french-blue": "0 4px 20px rgba(0, 0, 145, 0.4)",
        "french-gold": "0 0 20px rgba(227, 181, 5, 0.5)",
        "french-red": "0 4px 15px rgba(225, 0, 15, 0.3)",
        "french-glow": "0 0 15px rgba(227, 181, 5, 0.6)",
        "card": "0 4px 20px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
