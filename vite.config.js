import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy server-side hacia Wallapop: evita el bloqueo CORS del navegador.
      // El navegador pide /api/wallapop/item/... en el mismo origen y Vite
      // lo reenvía a https://es.wallapop.com/item/...
      '/api/wallapop': {
        target: 'https://es.wallapop.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wallapop/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
      },
    },
  },
})
