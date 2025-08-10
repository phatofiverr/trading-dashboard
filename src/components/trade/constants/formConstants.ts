
// Time zones options
export const timeZones = [
  // UTC and GMT
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
  
  // Major Trading Centers
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  
  // European Markets
  { value: 'Europe/Frankfurt', label: 'Frankfurt (CET/CEST)' },
  { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
  { value: 'Europe/Milan', label: 'Milan (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
  { value: 'Europe/Oslo', label: 'Oslo (CET/CEST)' },
  
  // American Markets
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
  
  // Asian Markets
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Asia/Mumbai', label: 'Mumbai (IST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
  { value: 'Asia/Manila', label: 'Manila (PHT)' },
  { value: 'Asia/Taipei', label: 'Taipei (CST)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)' },
  
  // Middle East & Africa
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (AST)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  
  // Pacific & Oceania
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)' },
  
  // Russian Markets
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Vladivostok', label: 'Vladivostok (VLAT)' },
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
