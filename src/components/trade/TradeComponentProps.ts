
import { Trade } from "@/types/Trade";

export interface TradeActivityProps {
  trades: Trade[];
}

export interface TradeTableProps {
  trades: Trade[];
  hideExportButton?: boolean;
}

export interface SimpleStatsDisplayProps {
  trades: Trade[];
  currency?: string;
  className?: string;
  isAccountView?: boolean;
}

export interface EquityCurveChartProps {
  trades: Trade[];
}

export interface MostTradedPairsCardProps {
  trades: Trade[];
}

export interface RAnalysisCardProps {
  trades: Trade[];
}

export interface TradingKPIsProps {
  trades: Trade[];
}

export interface TradeActivityHeatmapProps {
  trades: Trade[];
}

export interface StochasticVolatilityModelProps {
  trades: Trade[];
}

