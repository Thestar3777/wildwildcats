import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./components/game/**/*.{js,ts,jsx,tsx}",
    "./components/screens/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        parchment: "hsl(var(--parchment))",
        "parchment-dark": "hsl(var(--parchment-dark))",
        "parchment-edge": "hsl(var(--parchment-edge))",
        ink: "hsl(var(--ink))",
        "ink-soft": "hsl(var(--ink-soft))",
        rust: "hsl(var(--rust))",
        "rust-glow": "hsl(var(--rust-glow))",
        gold: "hsl(var(--gold))",
        "gold-soft": "hsl(var(--gold-soft))",
        blood: "hsl(var(--blood))",
        leather: "hsl(var(--leather))",
        "leather-dark": "hsl(var(--leather-dark))",
        wood: "hsl(var(--wood))",
        "wood-dark": "hsl(var(--wood-dark))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        sm: "var(--radius)",
      },
    },
  },
  plugins: [],
};

export default config;