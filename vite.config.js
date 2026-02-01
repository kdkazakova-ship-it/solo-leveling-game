import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/solo-leveling-game/frontend/',
  root: './frontend',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend/src'),
    },
  },
});
