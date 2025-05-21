// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the plugin
  ],
  // IMPORTANT: Configure server proxy to avoid CORS issues during development
  // Assumes your backend runs on http://localhost:5123 (Adjust if different)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5123', // Your backend URL
        changeOrigin: true,
        secure: false, // Set to true if your backend uses HTTPS
        // If your backend sets cookies on a different path:
        // cookiePathRewrite: {
        //   '/api': '/', // Example: rewrite /api path in cookie to /
        // },
      }
    }
  }
})