/**
 * Centralized Color Palette System for Trading Dashboard
 * 
 * This file contains all color definitions used throughout the application.
 * Components should import and use these colors instead of hardcoded values.
 */

export const colorPalette = {
  // ===== BACKGROUNDS =====
  background: {
    primary: '#0f0f0f',           // Main app background (trading.bg)
    secondary: '#1a1a1a',         // Panel background (trading.panel)
    card: '#0A0A0B',              // Card backgrounds
    glass: 'rgba(0, 0, 0, 0.2)',  // Translucent overlays
    input: 'rgba(0, 0, 0, 0.2)',  // Input field backgrounds
    modal: 'rgba(0, 0, 0, 0.8)',  // Modal/dialog backgrounds
    muted: '#27272A',             // Secondary card backgrounds
  },

  // ===== TEXT COLORS =====
  text: {
    primary: '#FAFAFA',           // Main text color
    secondary: '#A1A1AA',         // Muted/secondary text
    muted: '#666666',             // Trading specific muted text
    disabled: 'rgba(255, 255, 255, 0.4)', // Disabled text
  },

  // ===== STATUS COLORS =====
  status: {
    // Profit/Positive indicators
    positive: {
      primary: '#15b9a6',         // Main positive color (teal)
      secondary: '#10B981',       // Alternative green
      background: 'rgba(21, 185, 166, 0.1)', // Positive backgrounds
      border: 'rgba(21, 185, 166, 0.3)',     // Positive borders
    },
    
    // Loss/Negative indicators  
    negative: {
      primary: '#D12B35',         // Main negative color (red)
      secondary: '#EF4444',       // Alternative red
      background: 'rgba(209, 43, 53, 0.1)',  // Negative backgrounds
      border: 'rgba(209, 43, 53, 0.3)',      // Negative borders
    },

    // Warning/Caution indicators
    warning: {
      primary: '#F59E0B',         // Main warning color (amber)
      secondary: '#D97706',       // Darker amber
      background: 'rgba(245, 158, 11, 0.1)', // Warning backgrounds
      border: 'rgba(245, 158, 11, 0.3)',     // Warning borders
    },

    // Information indicators
    info: {
      primary: '#3B82F6',         // Main info color (blue)
      secondary: '#2563EB',       // Darker blue
      background: 'rgba(59, 130, 246, 0.1)', // Info backgrounds
      border: 'rgba(59, 130, 246, 0.3)',     // Info borders
    },
  },

  // ===== ACCENT COLORS =====
  accent: {
    primary: '#555555',           // Main accent (trading.accent1)
    secondary: '#777777',         // Secondary accent (trading.accent2)
    tertiary: '#444444',          // Tertiary accent (trading.accent3)
    muted: '#333333',             // Muted accent (trading.accent4)
  },

  // ===== BORDER COLORS =====
  border: {
    primary: '#333333',           // Main borders (trading.border)
    muted: 'rgba(255, 255, 255, 0.1)',      // Light borders
    input: 'rgba(255, 255, 255, 0.05)',     // Input borders
    focus: 'rgba(85, 85, 85, 0.5)',         // Focus states
  },

  // ===== SPECIALIZED COLORS =====
  trading: {
    // Long/Buy direction
    long: {
      primary: '#00a86b',         // Long trade color
      background: 'rgba(0, 168, 107, 0.2)', // Long backgrounds
      border: 'rgba(0, 168, 107, 0.3)',     // Long borders
    },
    
    // Short/Sell direction  
    short: {
      primary: '#ea384c',         // Short trade color
      background: 'rgba(234, 56, 76, 0.2)',  // Short backgrounds
      border: 'rgba(234, 56, 76, 0.3)',      // Short borders
    },

    // Risk-Reward ratio colors
    riskReward: {
      excellent: '#15b9a6',       // R:R >= 2.0 (green)
      good: '#F59E0B',            // R:R >= 1.0 (amber)
      poor: '#D12B35',            // R:R < 1.0 (red)
    },
  },

  // ===== SOCIAL/BRANDING =====
  social: {
    primary: '#15b9a6',           // Main brand color
    secondary: '#3B82F6',         // Secondary brand
    accent: '#8B5CF6',            // Purple accent
    muted: '#64748B',             // Muted brand
  },

  // ===== CHARTS =====
  chart: {
    primary: '#8B5CF6',           // Primary chart color (purple)
    secondary: '#10B981',         // Secondary chart color (green)
    tertiary: '#F59E0B',          // Tertiary chart color (amber)
    quaternary: '#EF4444',        // Quaternary chart color (red)
    quinary: '#06B6D4',           // Quinary chart color (cyan)
  },
} as const;

/**
 * Helper functions for common color operations
 */
export const colorUtils = {
  /**
   * Get profit/loss color based on value
   */
  getProfitColor: (value: number) => {
    return value >= 0 ? colorPalette.status.positive.primary : colorPalette.status.negative.primary;
  },

  /**
   * Get risk-reward ratio color based on ratio
   */
  getRiskRewardColor: (ratio: number) => {
    if (ratio >= 2.0) return colorPalette.trading.riskReward.excellent;
    if (ratio >= 1.0) return colorPalette.trading.riskReward.good;
    return colorPalette.trading.riskReward.poor;
  },

  /**
   * Get direction color based on trade direction
   */
  getDirectionColor: (direction: 'long' | 'short') => {
    return direction === 'long' 
      ? colorPalette.trading.long.primary 
      : colorPalette.trading.short.primary;
  },

  /**
   * Generate RGBA color with custom opacity
   */
  withOpacity: (hexColor: string, opacity: number) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
};

/**
 * Type definitions for TypeScript support
 */
export type ColorPalette = typeof colorPalette;
export type StatusColors = keyof typeof colorPalette.status;
export type BackgroundColors = keyof typeof colorPalette.background;
export type TextColors = keyof typeof colorPalette.text;

/**
 * Usage Examples:
 * 
 * // Instead of: className="text-green-500"
 * // Use: style={{ color: colorPalette.status.positive.primary }}
 * 
 * // Instead of: className="bg-red-500/10" 
 * // Use: style={{ backgroundColor: colorPalette.status.negative.background }}
 * 
 * // For profit/loss coloring:
 * // style={{ color: colorUtils.getProfitColor(tradeProfit) }}
 * 
 * // For risk-reward coloring:
 * // style={{ color: colorUtils.getRiskRewardColor(1.5) }}
 */