import { defineConfig } from 'vite';

// The word/capsule data lives in /shared at the repo root so the pronunciation-asr
// service can load the exact same vocabulary the frontend uses to build ASR grammars.
// Vite's dev server needs an explicit allow-list to serve files outside /frontend.
export default defineConfig({
  root: '.',
  // GitHub Pages serves the app under /<repo-name>/ — the deploy workflow
  // sets BASE_PATH=/langua-/; local dev and the backend-paired build keep '/'.
  base: process.env.BASE_PATH || '/',
  server: {
    port: 5173,
    fs: { allow: ['..'] },
    proxy: {
      '/api': {
        target: process.env.BLAS_BACKEND_URL || 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    environment: 'node',
  },
});
