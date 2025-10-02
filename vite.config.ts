import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    hmr: {
      port: 5173,
      clientPort: 5173,
      overlay: false
    }
  },
  esbuild: {
    target: 'es2020',
    logLevel: 'error',
    keepNames: true
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
    rollupOptions: {
      external: [],
      output: {
        format: 'es',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          utils: ['axios', 'validator'],
          payment: ['./src/lib/payments', './src/lib/paymentFixes']
        }
      }
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
    exclude: ['@rollup/rollup-linux-x64-gnu'],
    force: true
  },
  define: {
    global: 'globalThis',
  }
})