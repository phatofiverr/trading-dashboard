
// Time zones options
export const timeZones = [
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

// Timeframe options
export const entryTimeframes = [
  { value: '1m', label: '1 Minute' },
  { value: 'm2', label: '2 Minutes' },
  { value: 'm3', label: '3 Minutes' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: 'Daily' },
];

export const htfTimeframes = [
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: 'Daily' },
  { value: '1w', label: 'Weekly' },
];

// Take profit hit options
export const tpHitOptions = [
  { value: 'none', label: 'None' },
  { value: 'tp1', label: 'TP1' },
  { value: 'tp2', label: 'TP2' },
  { value: 'tp3', label: 'TP3' },
];

// Trading sessions
export const tradingSessions = [
  { value: 'Asia', label: 'Asia Session' },
  { value: 'London', label: 'London Session' },
  { value: 'Overlap', label: 'London/NY Overlap' },
  { value: 'NY', label: 'New York Session' },
  { value: 'Late NY', label: 'Late NY Session' },
];

// Tooltip description texts for metrics
export const metricDescriptions = {
  winRate: "Percentage of trades that closed with a profit",
  beRate: "Percentage of trades that closed at break even",
  slRate: "Percentage of trades that hit stop loss",
  timeStats: "Average time trades were held before hitting take profit or stop loss",
  outcomeRates: "Percentage of trades that hit take profit vs stop loss",
  missedR: "Additional R you could have gained by holding trades longer",
  beAnalysis: "Performance metrics for trades after reaching break even",
  missedRAfterBE: "Potential R not captured after trade reached break even",
  positiveRAfterBE: "Percentage of BE trades that closed with positive R",
  directionWinRate: "Comparison of win rates between long and short trades",
  sessionPerformance: "Win, loss, and break even rates across different trading sessions"
};
