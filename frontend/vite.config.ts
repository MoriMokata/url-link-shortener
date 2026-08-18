import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the ASP.NET Core backend during local dev.
      // Keep this in sync with backend/Gulfy.Api's launch URL (see BE-10).
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false, // dev cert for gul.fy/localhost isn't in Node's trust store
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
