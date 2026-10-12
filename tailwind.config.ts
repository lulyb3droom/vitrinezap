import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Girassol — as variáveis são sobrescritas por loja em src/app/[slug]/layout.tsx
        primary: {
          100: v("--primary-100"),
          400: v("--primary-400"),
          500: v("--primary-500"),
          600: v("--primary-600"),
        },
        brand: v("--primary-500"),
        "on-brand": v("--on-primary"),
        canvas: "#FAF8F5",
        "success-zap": "#22C55E",
        "accent-badge": "#FEF08A",
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
