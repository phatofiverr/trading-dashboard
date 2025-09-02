/**
 * CSS Class Generator for Color System
 * 
 * Generates Tailwind-compatible CSS classes based on the centralized color palette.
 * Use this when you need CSS classes instead of inline styles.
 */

import { colorPalette } from '@/lib/colorPalette';

/**
 * Generate CSS classes for common color patterns
 */
export const colorClasses = {
  // Text colors
  text: {
    primary: 'text-[#FAFAFA]',
    secondary: 'text-[#A1A1AA]',
    muted: 'text-[#666666]',
    disabled: 'text-white/40',
    
    // Status text
    positive: 'text-[#15b9a6]',
    negative: 'text-[#D12B35]',
    warning: 'text-[#F59E0B]',
    info: 'text-[#3B82F6]',
  },
  
  // Background colors
  background: {
    primary: 'bg-[#0f0f0f]',
    secondary: 'bg-[#1a1a1a]',
    card: 'bg-[#0A0A0B]',
    glass: 'bg-black/20',
    input: 'bg-black/20',
    muted: 'bg-[#27272A]',
    
    // Status backgrounds
    positive: 'bg-[#15b9a6]/10',
    negative: 'bg-[#D12B35]/10',
    warning: 'bg-[#F59E0B]/10',
    info: 'bg-[#3B82F6]/10',
  },
  
  // Border colors
  border: {
    primary: 'border-[#333333]',
    muted: 'border-white/10',
    input: 'border-white/5',
    focus: 'border-[#555555]/50',
    
    // Status borders
    positive: 'border-[#15b9a6]/30',
    negative: 'border-[#D12B35]/30',
    warning: 'border-[#F59E0B]/30',
    info: 'border-[#3B82F6]/30',
  },
  
  // Trading specific
  trading: {
    // Direction colors
    long: {
      text: 'text-[#00a86b]',
      background: 'bg-[#00a86b]/20',
      border: 'border-[#00a86b]/30',
    },
    short: {
      text: 'text-[#ea384c]',
      background: 'bg-[#ea384c]/20', 
      border: 'border-[#ea384c]/30',
    },
    
    // Risk-reward colors
    riskReward: {
      excellent: 'text-[#15b9a6]',  // >= 2.0
      good: 'text-[#F59E0B]',       // >= 1.0  
      poor: 'text-[#D12B35]',       // < 1.0
    },
  },
  
  // Combined utility classes
  combinations: {
    // Card variants
    cardDefault: 'bg-[#0A0A0B] border-white/10 text-[#FAFAFA]',
    cardGlass: 'bg-black/20 backdrop-blur-md border-0 text-[#FAFAFA]',
    cardMuted: 'bg-[#27272A] border-white/10 text-[#FAFAFA]',
    
    // Button variants
    buttonPrimary: 'bg-[#555555] text-[#FAFAFA] hover:bg-[#777777]',
    buttonSecondary: 'bg-black/20 text-[#FAFAFA] hover:bg-[#27272A]',
    buttonSuccess: 'bg-[#15b9a6] text-[#FAFAFA] hover:bg-[#10B981]',
    buttonDanger: 'bg-[#D12B35] text-[#FAFAFA] hover:bg-[#EF4444]',
    
    // Input variants
    inputDefault: 'bg-black/20 border-white/5 text-[#FAFAFA] placeholder:text-white/40 focus:border-[#555555]/50',
    inputSuccess: 'bg-black/20 border-[#15b9a6]/30 text-[#FAFAFA] focus:border-[#15b9a6]/50',
    inputError: 'bg-black/20 border-[#D12B35]/30 text-[#FAFAFA] focus:border-[#D12B35]/50',
  },
};

/**
 * Helper functions to generate dynamic classes
 */
export const getColorClass = {
  /**
   * Get profit/loss text class
   */
  profitLoss: (value: number): string => {
    return value >= 0 ? colorClasses.text.positive : colorClasses.text.negative;
  },
  
  /**
   * Get risk-reward ratio class
   */
  riskReward: (ratio: number): string => {
    if (ratio >= 2.0) return colorClasses.trading.riskReward.excellent;
    if (ratio >= 1.0) return colorClasses.trading.riskReward.good;
    return colorClasses.trading.riskReward.poor;
  },
  
  /**
   * Get direction class
   */
  direction: (direction: 'long' | 'short'): string => {
    return direction === 'long' 
      ? colorClasses.trading.long.text 
      : colorClasses.trading.short.text;
  },
  
  /**
   * Get complete profit/loss styling classes
   */
  profitLossComplete: (value: number): string => {
    const base = value >= 0 
      ? `${colorClasses.text.positive} ${colorClasses.background.positive} ${colorClasses.border.positive}`
      : `${colorClasses.text.negative} ${colorClasses.background.negative} ${colorClasses.border.negative}`;
    return base;
  },
  
  /**
   * Get complete direction styling classes
   */
  directionComplete: (direction: 'long' | 'short'): string => {
    return direction === 'long'
      ? `${colorClasses.trading.long.text} ${colorClasses.trading.long.background} ${colorClasses.trading.long.border}`
      : `${colorClasses.trading.short.text} ${colorClasses.trading.short.background} ${colorClasses.trading.short.border}`;
  },
};

/**
 * Usage Examples:
 * 
 * // Static classes
 * <div className={colorClasses.text.primary} />
 * <div className={colorClasses.combinations.cardDefault} />
 * 
 * // Dynamic classes
 * <div className={getColorClass.profitLoss(tradeProfit)} />
 * <div className={getColorClass.riskReward(1.5)} />
 * <div className={getColorClass.directionComplete('long')} />
 */