/** @type {import('tailwindcss').Config} */
const token = (v) => `rgb(var(--${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marca (fija)
        dccv: { navy: '#1F2A44', yellow: '#FFD54F', teal: '#2EC4B6' },
        // Tokens semánticos que cambian con el modo claro/oscuro (ver index.css)
        canvas: token('canvas'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        subtle: token('subtle'),
        line: token('line'),
        'line-strong': token('line-strong'),
        brand: token('brand'),
        'brand-ink': token('brand-ink'),
        link: token('link'),
      },
      // Tipografía del sistema: SF Pro en iPhone/Mac, Roboto en Android
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'system-ui', 'Roboto', 'sans-serif'],
      },
      borderRadius: { ios: '20px', 'ios-btn': '16px' },
      transitionTimingFunction: { ios: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    },
  },
  plugins: [],
};
