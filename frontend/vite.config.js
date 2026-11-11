import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The backend only accepts requests from FRONTEND_ORIGIN (http://localhost:5173 by default).
    // strictPort stops Vite from silently moving to 5174 (which the backend would then block by CORS).
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})
