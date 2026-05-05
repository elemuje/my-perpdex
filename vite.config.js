import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Node built-in polyfills needed by @arcium-hq/client + @solana/web3.js
      buffer: path.resolve(__dirname, 'node_modules/buffer/index.js'),
      process: path.resolve(__dirname, 'node_modules/process/browser.js'),
      stream: path.resolve(__dirname, 'node_modules/stream-browserify/index.js'),
      util: path.resolve(__dirname, 'node_modules/util/util.js'),
      events: path.resolve(__dirname, 'node_modules/events/events.js'),
      // NOTE: Do NOT alias 'crypto' to crypto-browserify — it overrides window.crypto
      // and breaks crypto.getRandomValues() in the browser.
      // Instead we provide a targeted shim that uses Web Crypto API only.
      crypto: path.resolve(__dirname, 'src/crypto-shim.js'),
    },
  },
  server: { port: 3000 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      // Prevent rollup from treating node built-ins as external during build
      // (they'd be undefined at runtime in browsers)
      plugins: [],
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion')) return 'framer'
          if (id.includes('recharts')) return 'recharts'
          if (id.includes('@radix-ui')) return 'radix'
          if (id.includes('@arcium-hq') || id.includes('@solana') || id.includes('@coral-xyz')) return 'arcium-solana'
          if (id.includes('node_modules/react') || id.includes('react-router')) return 'react-vendor'
          if (id.includes('lucide-react')) return 'icons'
        },
      },
    },
  },
  define: {
    'process.env': '{}',
    'process.browser': 'true',
    'process.version': '"v18.0.0"',
    global: 'globalThis',
    Buffer: ['buffer', 'Buffer'],
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'crypto-browserify',
      '@arcium-hq/client',
      '@solana/web3.js',
      '@coral-xyz/anchor',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
