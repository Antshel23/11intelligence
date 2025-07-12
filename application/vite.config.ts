import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Changed from './' to '/' for proper routing
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress all warnings
        return
      },
      output: {
        manualChunks: undefined,
      }
    }
  },
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'empty-import-meta': 'silent'
    }
  },
  define: {
    global: 'globalThis',
  },
  publicDir: 'public' // Ensure public files are copied
})