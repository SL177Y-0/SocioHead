import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom Theme Colors
        "cyber-green": "#09FBD3",
        "cyber-blue": "#08F7FE",
        "cyber-pink": "#FE53BB",
        "cyber-yellow": "#F5D300",
        "dark-green": "#0F1922",
        "darker-green": "#071219",
        degen: {
          dark: "#0A1F1C",
          green: "#1E3A37",
          light: "#264D49",
          glow: "#36FF9C",
          accent: "#00E0B0",
        },
        defi: {
          dark: "#121217",
          green: {
            DEFAULT: "#ACFF7F",
            light: "#CBF9A0",
            neon: "#B0FF58",
            dark: "#43B309",
          },
          gray: {
            DEFAULT: "#222228",
            dark: "#1A1A1F",
            light: "#32323A",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.3)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 10px 2px rgba(9, 251, 211, 0.3)" },
          "50%": { boxShadow: "0 0 20px 5px rgba(9, 251, 211, 0.6)" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
        "zoom-in-out": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "light-speed": {
          "0%": { transform: "translateX(0) skewX(0)", opacity: "1" },
          "30%": { transform: "translateX(40%) skewX(-20deg)", opacity: "0.7" },
          "100%": { transform: "translateX(100%) skewX(-30deg)", opacity: "0" },
        },
        "checkmark-appear": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "0.7" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-up": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-out": "fade-out 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite linear",
        "zoom-in-out": "zoom-in-out 2s ease-in-out",
        "light-speed": "light-speed 0.8s ease-out",
        "checkmark-appear": "checkmark-appear 0.5s ease-out",
        "glow-pulse": "glow-pulse 2s infinite",
        "scale-up": "scale-up 0.4s ease-out",
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0F1922 0%, #071219 100%)",
        "glass-card":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "cyber-gradient":
          "linear-gradient(135deg, rgba(9, 251, 211, 0.2) 0%, rgba(254, 83, 187, 0.2) 100%)",
        "shimmer-effect":
          "linear-gradient(90deg, transparent, rgba(9, 251, 211, 0.3), transparent)",
        "neon-glow":
          "radial-gradient(circle, rgba(172, 255, 127, 0.3) 0%, rgba(172, 255, 127, 0.1) 40%, rgba(0, 0, 0, 0) 70%)",
        "card-gradient":
          "linear-gradient(to bottom, rgba(41, 41, 51, 0.8), rgba(28, 28, 36, 0.8))",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
