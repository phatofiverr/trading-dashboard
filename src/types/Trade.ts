export interface Trade {
  id: string;
  strategyId: string;
  accountId?: string;  // Add accountId property
  pair: string;
  tradeId?: string;
  instrument?: string;
  direction: "long" | "short";
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  slPrice?: number;
  tp1Price?: number;
  tp2Price?: number;
  tp3Price?: number;
  rMultiple: number;
  percentageGainLoss?: number;
  profit?: number;  
  notes: string;
  setup: string;
  timeframe: string;
  entryTimeframe?: string;
  htfTimeframe?: string;
  session?: string;
  killzone?: string;
  outcome: "win" | "loss" | "breakeven";
  stopLoss: number;
  targetPrice: number;
  size: number;
  drawdown: number;
  slPips?: number;
  confluences: string[];
  tags?: string[];
  images: string[];
  isPlaceholder?: boolean;
  createdAt?: string;
  updatedAt?: string;
  exitReason?: string;
  entryType?: string;
  obType?: string;
  marketStructure?: string;
  liquidityContext?: string;
  confidenceRating?: number;
  slLogic?: string;
  tpLogic?: string;
  // New fields for BE and TP hit tracking
  entryTime?: string;  // Time of day for entry
  exitTime?: string;   // Time of day for exit
  entryTimezone?: string; // Timezone for entry
  exitTimezone?: string;  // Timezone for exit
  didHitBE?: boolean;     // Did the trade reach break-even?
  tpHitAfterBE?: boolean; // Was TP hit after reaching BE?
  reversedAfterBE?: boolean; // Did trade reverse after reaching BE?
  tpHit?: "none" | "tp1" | "tp2" | "tp3"; // Which TP level was hit
  // New fields for drawdown analysis
  maxDrawdown?: number;    // Maximum drawdown during this trade
  recoveryTime?: number;   // Days to recover from drawdown
  drawdownDuration?: number; // Duration of drawdown in days
  // New field for risk amount
  riskAmount?: string;    // Amount risked on this trade
  riskRewardRatio?: string; // Risk to reward ratio
  // Behavioral tags for tracking trading mistakes
  behavioralTags?: string[]; // Array of BehavioralTag IDs
}

export interface TradeFormData {
  tradeId?: string; // Changed from required to optional
  strategyId?: string; // Strategy ID
  instrument: string;
  entryPrice: string;
  exitPrice: string;
  slPrice: string;
  tp1Price?: string;
  tp2Price?: string;
  tp3Price?: string;
  entryDate: Date;
  exitDate?: Date;
  entryTime?: string;
  exitTime?: string;
  entryTimezone?: string;
  exitTimezone?: string;
  direction: "Long" | "Short";
  entryTimeframe: string;
  htfTimeframe: string;
  entryType?: string;  // Make optional to match schema
  obType?: string;     // Make optional to match schema
  marketStructure?: string; // Make optional to match schema
  liquidityContext?: string; // Make optional to match schema
  tags: string[];
  slLogic?: string;
  tpLogic?: string;
  notes?: string;
  exitReason?: string;
  slPips: string;
  confidenceRating: number;
  didHitBE: boolean;
  tpHitAfterBE: boolean;
  reversedAfterBE: boolean;
  tpHit: "none" | "tp1" | "tp2" | "tp3";
  session?: string;
  riskAmount?: string;  // New field for risk amount
  behavioralTags?: string[]; // Behavioral tags for trading mistakes
}

export interface StrategyPerformance {
  name: string;
  winRate: number;
  profit: number;
  tradesCount: number;
  lastTradeDate: Date | null;
  type?: 'live' | 'backtest';
}

export interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  breakEvenRate: number;
  winRate: number;
  averageRMultiple: number;
  totalProfit: number;
  maxDrawdown: number;
  profitFactor: number;
  expectancy: number;
}

export interface TradingAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
  initialBalance?: number; // Make this optional to match useAccountsStore
  createdAt: string; // Changed from Date to string to match useAccountsStore
  updatedAt?: string; // Added from useAccountsStore
}
