import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0e1113',
          2: '#1a1e22',
          3: '#2a2f35',
        },
        paper: {
          DEFAULT: '#f1ece1',
          2: '#e8e2d4',
          3: '#d9d2c1',
        },
        accent: '#c2410c', // terracotta
        moss: '#3d5a3d',
      },
    },
  },
  plugins: [],
} satisfies Config;
