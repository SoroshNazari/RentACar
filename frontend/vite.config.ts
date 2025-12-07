import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path' // <-- Fix für den "default-import" Fehler

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Wir lassen Vite den Standard-Minifier (esbuild) nutzen.
    // Das ist schneller und weniger fehleranfällig als 'terser'.

    // Chunk-Warning Limit etwas erhöhen, falls Libraries groß sind
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('axios')) return 'vendor-axios'
            return 'vendor-other'
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
