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
        // Primary — Navy Blue (Authority)
        primary: {
          DEFAULT: "#002869",
          foreground: "#FFFFFF",
          container: "#0b3d91",
          "on-container": "#8dadff",
          inverse: "#b1c5ff",
          fixed: "#dae2ff",
          "fixed-dim": "#b1c5ff",
          "on-fixed": "#001947",
          "on-fixed-variant": "#144296",
          tint: "#345baf",
          light: "#0b3d91",
          lighter: "#dae2ff",
        },
        // Secondary — Emerald Green (Success/Verified)
        secondary: {
          DEFAULT: "#056e00",
          foreground: "#FFFFFF",
          container: "#8dfc75",
          "on-container": "#067500",
          fixed: "#8dfc75",
          "fixed-dim": "#72de5c",
          "on-fixed": "#012200",
          "on-fixed-variant": "#035300",
        },
        // Tertiary — Saffron/Amber (Warning/High Priority)
        tertiary: {
          DEFAULT: "#521a00",
          foreground: "#FFFFFF",
          container: "#762900",
          "on-container": "#ff9162",
          fixed: "#ffdbcd",
          "fixed-dim": "#ffb597",
          "on-fixed": "#360f00",
          "on-fixed-variant": "#7c2e04",
        },
        // Error
        destructive: {
          DEFAULT: "#ba1a1a",
          foreground: "#FFFFFF",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        // Surface / Neutral
        background: "#faf8ff",
        foreground: "#1a1b21",
        surface: {
          DEFAULT: "#faf8ff",
          dim: "#dad9e1",
          bright: "#faf8ff",
          "container-lowest": "#ffffff",
          "container-low": "#f4f3fb",
          container: "#eeedf5",
          "container-high": "#e8e7ef",
          "container-highest": "#e2e2e9",
        },
        muted: {
          DEFAULT: "#eeedf5",
          foreground: "#4B5563",
        },
        accent: {
          DEFAULT: "#b5460f",
          foreground: "#f7f5f0",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1a1b21",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        outline: "#747783",
        "outline-variant": "#c4c6d3",
        // Status chip colors
        status: {
          approved: "#056e00",
          "approved-bg": "#e6f7e6",
          pending: "#521a00",
          "pending-bg": "#fff3e6",
          rejected: "#ba1a1a",
          "rejected-bg": "#ffdad6",
          open: "#002869",
          "open-bg": "#e8edf5",
          closed: "#4B5563",
          "closed-bg": "#f3f4f6",
        },
        sidebar: {
          DEFAULT: "#ffffff",
          border: "#E5E7EB",
          muted: "#4B5563",
        },
        topbar: {
          DEFAULT: "#002869",
          text: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Metropolis", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        // Typography scale based on spec
        "display-lg": ["48px", { lineHeight: "56px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.01em" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "title-lg": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "600", letterSpacing: "0.01em" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.02em" }],
        // Legacy compatibility (map to new tokens)
        label: ["12px", { lineHeight: "1.2", letterSpacing: "0.02em" }],
        body: ["14px", { lineHeight: "1.5" }],
        heading: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
      boxShadow: {
        card: "0px 1px 2px 0px rgba(0,0,0,0.05)",
        hover: "0px 4px 6px -1px rgba(0,0,0,0.1)",
        dropdown: "0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};