import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy server-side hacia Wallapop: evita el bloqueo CORS del navegador.
      // En dev redirigimos /api/wallapop?url=<anuncio> al host real de Wallapop
      // (igual que hace la serverless function en producción).
      '/api/wallapop': {
        target: 'https://es.wallapop.com',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            try {
              const u = new URL(req.url, 'http://localhost');
              const target = u.searchParams.get('url');
              if (target) {
                const t = new URL(target);
                proxyReq.path = t.pathname + t.search;
              } else {
                proxyReq.path = '/';
              }
            } catch (e) {
              proxyReq.path = '/';
            }
          });
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
      },
    },
  },
})