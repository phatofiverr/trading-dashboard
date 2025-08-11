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
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
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
          
          // UI libraries (now Origin UI native implementations)
          'ui-vendor': [
            'class-variance-authority',
            'cmdk'
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
    // Disable source maps in production for better performance
    sourcemap: false,
    // Optimize for Vercel
    target: 'esnext'
  }
}));
