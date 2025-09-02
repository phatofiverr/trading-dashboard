/**
 * TypeScript definitions for the centralized color system
 * 
 * Provides full type safety and intellisense for colors throughout the application
 */

import type { colorPalette, colorUtils } from '@/lib/colorPalette';

// Export the main color palette type
export type ColorPalette = typeof colorPalette;
export type ColorUtils = typeof colorUtils;

// Individual color categories
export type BackgroundColors = typeof colorPalette.background;
export type TextColors = typeof colorPalette.text;
export type StatusColors = typeof colorPalette.status;
export type AccentColors = typeof colorPalette.accent;
export type BorderColors = typeof colorPalette.border;
export type TradingColors = typeof colorPalette.trading;
export type SocialColors = typeof colorPalette.social;
export type ChartColors = typeof colorPalette.chart;

// Color utility types
export type ProfitLossValue = number;
export type RiskRewardRatio = number;
export type TradeDirection = 'long' | 'short';

// Color variant types
export type StatusColorVariant = 'positive' | 'negative' | 'warning' | 'info';
export type ButtonColorVariant = 'primary' | 'secondary' | 'success' | 'danger';
export type CardColorVariant = 'default' | 'glass' | 'muted';
export type InputColorVariant = 'default' | 'success' | 'error';

// Color style objects
export interface ColorStyles {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export interface ExtendedColorStyles extends ColorStyles {
  backdropFilter?: string;
}

// Hook return types
export interface UseColorsReturn {
  background: BackgroundColors;
  text: TextColors;
  status: StatusColors;
  accent: AccentColors;
  border: BorderColors;
  trading: TradingColors;
  social: SocialColors;
  chart: ChartColors;
  utils: ColorUtils;
  common: {
    profit: ColorStyles;
    loss: ColorStyles;
    card: ColorStyles;
    button: {
      primary: ColorStyles;
      secondary: ColorStyles;
      success: ColorStyles;
      danger: ColorStyles;
    };
    input: ColorStyles;
    riskReward: {
      excellent: string;
      good: string;
      poor: string;
    };
    direction: {
      long: ColorStyles;
      short: ColorStyles;
    };
  };
  getColorStyles: {
    profitLoss: (value: ProfitLossValue) => ColorStyles;
    riskReward: (ratio: RiskRewardRatio) => ColorStyles;
    direction: (direction: TradeDirection) => ExtendedColorStyles;
    card: (variant?: CardColorVariant) => ExtendedColorStyles;
    button: (variant?: ButtonColorVariant) => ColorStyles;
  };
}

// Component prop types for color-aware components
export interface ColorAwareProps {
  colorVariant?: StatusColorVariant;
  customColors?: Partial<ColorStyles>;
}

export interface TradingColorProps {
  direction?: TradeDirection;
  profitLoss?: ProfitLossValue;
  riskReward?: RiskRewardRatio;
}

// Utility type for color class names
export type ColorClassName = string;

// Color theme types (for potential future theming)
export interface ColorTheme {
  name: string;
  palette: ColorPalette;
}

/**
 * Type guards for color validation
 */
export const isValidTradeDirection = (direction: string): direction is TradeDirection => {
  return direction === 'long' || direction === 'short';
};

export const isValidStatusVariant = (variant: string): variant is StatusColorVariant => {
  return ['positive', 'negative', 'warning', 'info'].includes(variant);
};

export const isValidButtonVariant = (variant: string): variant is ButtonColorVariant => {
  return ['primary', 'secondary', 'success', 'danger'].includes(variant);
};

/**
 * Color constants for type-safe usage
 */
export const COLOR_VARIANTS = {
  status: ['positive', 'negative', 'warning', 'info'] as const,
  button: ['primary', 'secondary', 'success', 'danger'] as const,
  card: ['default', 'glass', 'muted'] as const,
  input: ['default', 'success', 'error'] as const,
  direction: ['long', 'short'] as const,
} as const;

/**
 * Example usage with TypeScript:
 * 
 * ```typescript
 * import { useColors } from '@/hooks/useColors';
 * import type { TradeDirection, RiskRewardRatio } from '@/types/colors';
 * 
 * const MyComponent = () => {
 *   const colors = useColors();
 *   const direction: TradeDirection = 'long';
 *   const ratio: RiskRewardRatio = 1.5;
 *   
 *   return (
 *     <div style={colors.getColorStyles.direction(direction)}>
 *       <span style={{ color: colors.utils.getRiskRewardColor(ratio) }}>
 *         Risk-Reward: 1:{ratio}
 *       </span>
 *     </div>
 *   );
 * };
 * ```
 */