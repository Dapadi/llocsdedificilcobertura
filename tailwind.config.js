/** @type {import('tailwindcss').Config} */
const token = (v) => `rgb(var(--${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marca (fija)
        dccv: { navy: '#1F2A44', yellow: '#FFD54F', teal: '#2EC4B6' },
        // Tokens semánticos: cambian con el modo claro/oscuro (ver index.css)
        canvas: token('canvas'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        subtle: token('subtle'),
        line: token('line'),
        'line-strong': token('line-strong'),
        brand: token('brand'),
        'brand-ink': token('brand-ink'),
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
