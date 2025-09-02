/**
 * React Hook for Centralized Color System
 * 
 * This hook provides easy access to the color palette and utilities
 * for all React components throughout the application.
 */

import { useMemo } from 'react';
import { colorPalette, colorUtils } from '@/lib/colorPalette';

export const useColors = () => {
  const colors = useMemo(() => ({
    // Direct access to color palette
    ...colorPalette,
    
    // Utility functions
    utils: colorUtils,
    
    // Commonly used color combinations for easy access
    common: {
      // Profit/Loss styling
      profit: {
        text: colorPalette.status.positive.primary,
        background: colorPalette.status.positive.background,
        border: colorPalette.status.positive.border,
      },
      loss: {
        text: colorPalette.status.negative.primary,
        background: colorPalette.status.negative.background, 
        border: colorPalette.status.negative.border,
      },
      
      // Card styling
      card: {
        background: colorPalette.background.card,
        border: colorPalette.border.muted,
        text: colorPalette.text.primary,
        textSecondary: colorPalette.text.secondary,
      },
      
      // Button variants
      button: {
        primary: {
          background: colorPalette.accent.primary,
          text: colorPalette.text.primary,
          hover: colorPalette.accent.secondary,
        },
        secondary: {
          background: colorPalette.background.glass,
          text: colorPalette.text.primary,
          hover: colorPalette.background.muted,
        },
        success: {
          background: colorPalette.status.positive.primary,
          text: colorPalette.text.primary,
          hover: colorPalette.status.positive.secondary,
        },
        danger: {
          background: colorPalette.status.negative.primary,
          text: colorPalette.text.primary,
          hover: colorPalette.status.negative.secondary,
        },
      },
      
      // Input styling
      input: {
        background: colorPalette.background.input,
        border: colorPalette.border.input,
        text: colorPalette.text.primary,
        placeholder: colorPalette.text.disabled,
        focus: colorPalette.border.focus,
      },
      
      // Risk-Reward ratio colors
      riskReward: {
        excellent: colorPalette.trading.riskReward.excellent,  // >= 2.0
        good: colorPalette.trading.riskReward.good,            // >= 1.0
        poor: colorPalette.trading.riskReward.poor,            // < 1.0
      },
      
      // Trading direction colors
      direction: {
        long: {
          primary: colorPalette.trading.long.primary,
          background: colorPalette.trading.long.background,
          border: colorPalette.trading.long.border,
        },
        short: {
          primary: colorPalette.trading.short.primary,
          background: colorPalette.trading.short.background,
          border: colorPalette.trading.short.border,
        },
      },
    },
    
    // Helper methods for dynamic styling
    getColorStyles: {
      /**
       * Get profit/loss colors based on value
       */
      profitLoss: (value: number) => ({
        color: colorUtils.getProfitColor(value),
        backgroundColor: value >= 0 
          ? colorPalette.status.positive.background 
          : colorPalette.status.negative.background,
      }),
      
      /**
       * Get risk-reward ratio colors based on ratio
       */
      riskReward: (ratio: number) => ({
        color: colorUtils.getRiskRewardColor(ratio),
        backgroundColor: ratio >= 2.0 
          ? colorPalette.status.positive.background
          : ratio >= 1.0 
          ? colorPalette.status.warning.background
          : colorPalette.status.negative.background,
      }),
      
      /**
       * Get direction-based colors
       */
      direction: (direction: 'long' | 'short') => ({
        color: colorUtils.getDirectionColor(direction),
        backgroundColor: direction === 'long'
          ? colorPalette.trading.long.background
          : colorPalette.trading.short.background,
        borderColor: direction === 'long'
          ? colorPalette.trading.long.border
          : colorPalette.trading.short.border,
      }),
      
      /**
       * Get card styling with optional variant
       */
      card: (variant?: 'default' | 'glass' | 'muted') => {
        const baseStyles = {
          backgroundColor: colorPalette.background.card,
          borderColor: colorPalette.border.muted,
          color: colorPalette.text.primary,
        };
        
        if (variant === 'glass') {
          return {
            ...baseStyles,
            backgroundColor: colorPalette.background.glass,
            backdropFilter: 'blur(12px)',
          };
        }
        
        if (variant === 'muted') {
          return {
            ...baseStyles,
            backgroundColor: colorPalette.background.muted,
          };
        }
        
        return baseStyles;
      },
      
      /**
       * Get button styling based on variant
       */
      button: (variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary') => {
        const buttonColors = {
          primary: colorPalette.common.button.primary,
          secondary: colorPalette.common.button.secondary,
          success: colorPalette.common.button.success,
          danger: colorPalette.common.button.danger,
        };
        
        const selectedButton = buttonColors[variant];
        return {
          backgroundColor: selectedButton.background,
          color: selectedButton.text,
          '&:hover': {
            backgroundColor: selectedButton.hover,
          },
        };
      },
    },
  }), []);

  return colors;
};

/**
 * Usage Examples:
 * 
 * const colors = useColors();
 * 
 * // Direct color access
 * <div style={{ color: colors.status.positive.primary }} />
 * 
 * // Common color combinations
 * <div style={{ ...colors.common.card }} />
 * 
 * // Dynamic styling
 * <div style={colors.getColorStyles.profitLoss(tradeProfit)} />
 * <div style={colors.getColorStyles.riskReward(1.5)} />
 * <div style={colors.getColorStyles.direction('long')} />
 * 
 * // Utility functions
 * const profitColor = colors.utils.getProfitColor(100);
 * const rrColor = colors.utils.getRiskRewardColor(2.0);
 */

export default useColors;