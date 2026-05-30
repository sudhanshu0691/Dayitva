/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // Indian tricolor heritage values — kept for cultural context,
        // but used sparingly (badges, flags, themed sections only)
        saffron: {
          DEFAULT: "#FF9933",
          light: "#FFB84D",
        },
        indianGreen: {
          DEFAULT: "#138808",
          light: "#1BB00B",
        },
        chakraBlue: {
          DEFAULT: "#000080",
          light: "#0000B3",
        }
      },
      borderRadius: {
        lg: "var(--radius-lg)",   // 10px — popovers, modals
        md: "var(--radius)",       // 6px — cards, sections
        sm: "var(--radius-sm)",    // 4px — buttons, inputs
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blockchain-pulse": "blockchainPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        blockchainPulse: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: .5, transform: "scale(1.05)", filter: "drop-shadow(0 0 8px hsla(38, 92%, 44%, 0.4))" },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(15px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        }
      },
      fontFamily: {
        /*
         * FONT STACK — deliberate, opinionated choices:
         *
         * sans → DM Sans for body text. It's grotesque, warm, and has
         *   actual personality unlike Inter. We fall back to Inter for
         *   performance on slow connections, but DM Sans is the star.
         *
         * mono → IBM Plex Mono. Used in ALL headings (via globals.css)
         *   and as the primary code font. It has warmth and humanity.
         *   A deliberate choice over JetBrains Mono for its character.
         *
         * serif → intentionally same as mono. Merriweather was removed.
         *   A government blockchain portal does not need Georgia or
         *   Merriweather. Monospace at large weight = gravitas.
         */
        sans: ["DM Sans", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        serif: ["IBM Plex Mono", "ui-monospace", "monospace"], // yes, serif = mono. this is intentional.
      }
    },
  },
  plugins: [],
};