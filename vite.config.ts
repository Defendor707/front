import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core (must be separate)
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          // Charts
          if (id.includes('node_modules/recharts')) {
            return 'chart-vendor';
          }
          // Zustand
          if (id.includes('node_modules/zustand')) {
            return 'state-vendor';
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor';
          }
          // React Query
          if (id.includes('node_modules/@tanstack')) {
            return 'query-vendor';
          }
          // Other node_modules (split by package)
          if (id.includes('node_modules')) {
            // Split large packages separately
            const match = id.match(/node_modules\/([^/]+)/);
            if (match) {
              const pkg = match[1];
              // Keep small packages together
              if (['lucide-react', 'date-fns', 'clsx', 'tailwind-merge'].includes(pkg)) {
                return 'utils-vendor';
              }
            }
            return 'vendor';
          }
        },
        // Optimize chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    host: true,
  },
})
