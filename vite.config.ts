/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': el usuario decide cuándo actualizar (evita recargas inesperadas a mitad de uso).
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'DCCV · Buscador de difícil cobertura',
        short_name: 'DCCV',
        description: 'Plazas de difícil cobertura de la Comunitat Valenciana filtradas según tu perfil docente.',
        lang: 'es',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1F2A44',
        background_color: '#1F2A44',
        categories: ['education', 'productivity'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // La aplicación (HTML/JS/CSS/iconos) se precachea: carga instantánea y sin conexión.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Los datos de convocatorias cambian cada semana: se sirve lo último conocido
            // al instante y se refresca en segundo plano (la app avisa de su antigüedad).
            urlPattern: ({ url }) => url.pathname.startsWith('/data/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'dccv-datos', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 60 } },
          },
        ],
      },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.{ts,tsx}'], setupFiles: ['src/test/setup.ts'] },
});
