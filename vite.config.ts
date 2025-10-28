import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), nodePolyfills()],
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['buffer', 'process', '@solana/web3.js', '@solana/spl-token']
  },
  server: {
    proxy: {
      // Local dev only: proxy browser calls to mainnet RPC to avoid CORS/403 from api.mainnet-beta.solana.com
      '/solana': {
        target: 'https://api.mainnet-beta.solana.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/solana/, ''),
      },
    },
  },
})
