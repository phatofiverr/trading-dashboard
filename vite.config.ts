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
        manualChunks(id) {
          // React and core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          
          // UI component libraries (Radix UI)
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          
          // Chart libraries
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          
          // Firebase
          if (id.includes('firebase')) {
            return 'firebase';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'forms';
          }
          
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          
          // Large trading chart components
          if (id.includes('components/trade/EquityCurveChart') || 
              id.includes('components/trade/TradeActivityHeatmap') || 
              id.includes('components/trade/analysis/StochasticVolatilityModel')) {
            return 'trading-charts';
          }
          
          // Trading KPIs and stats
          if (id.includes('components/trade/SimpleStatsDisplay') || 
              id.includes('components/trade/TradingKPIs') || 
              id.includes('components/trade/kpi/')) {
            return 'trading-stats';
          }
          
          // Trading analysis components
          if (id.includes('components/trade/analysis/') || 
              id.includes('components/trade/MostTradedPairsCard')) {
            return 'trading-analysis';
          }
          
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Other node_modules as vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
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
