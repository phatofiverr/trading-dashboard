import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          
          // Chart libraries (these are heavy)
          'charts': ['recharts'],
          
          // Firebase
          'firebase': [
            'firebase/app',
            'firebase/auth', 
            'firebase/firestore'
          ],
          
          // Form libraries
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilities
          'utils': ['date-fns', 'clsx', 'tailwind-merge', 'lucide-react']
        }
      }
    },
    // Increase chunk size warning limit to 1MB
    chunkSizeWarningLimit: 1000,
    // Enable minification optimizations
    minify: 'esbuild',
    // Enable source maps for debugging (optional)
    sourcemap: false
  }
}));
