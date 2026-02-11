import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-mobile': ['antd-mobile', 'antd-mobile-icons'],
          'utils': ['lodash-es', 'zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000
  }
});
