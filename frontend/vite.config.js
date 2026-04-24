import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        // eslint-disable-next-line no-undef
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})