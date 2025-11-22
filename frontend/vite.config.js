import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Only proxy API requests - Vite handles everything else
      '^/api/.*': {
        target: 'http://ec2-13-214-128-31.ap-southeast-1.compute.amazonaws.com:5000',
        changeOrigin: true,
        secure: false,
        // Don't fail on connection errors - just pass through
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Silently handle proxy errors when backend is not running
            if (err.code !== 'ECONNREFUSED' && err.code !== 'ERR_NETWORK') {
              console.error('Proxy error:', err);
            }
          });
        },
      },
    },
  },
})

