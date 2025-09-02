
import { TradeFormValues } from '../schemas/tradeFormSchema';
import { Trade, TradeFormData } from '@/types/Trade';
import { detectSession } from './sessionDetector';
import { calculateRiskRewardRatio } from '@/hooks/slices/tradeActions';

// Transform Trade object back to TradeFormValues for editing
export const transformTradeToFormValues = (trade: Trade): TradeFormValues => {
  // Parse dates properly
  const entryDate = trade.entryDate ? new Date(trade.entryDate) : new Date();
  const exitDate = trade.exitDate ? new Date(trade.exitDate) : undefined;
  
  return {
    tradeId: trade.tradeId || trade.id || "",
    instrument: trade.instrument || "",
    entryPrice: trade.entryPrice?.toString() || "",
    exitPrice: trade.exitPrice?.toString() || "",
    slPrice: trade.slPrice?.toString() || "",
    tp1Price: trade.tp1Price?.toString() || "",
    tp2Price: trade.tp2Price?.toString() || "",
    tp3Price: trade.tp3Price?.toString() || "",
    entryDate: entryDate,
    exitDate: exitDate,
    entryTime: trade.entryTime || "00:00",
    exitTime: trade.exitTime || "00:00",
    entryTimezone: trade.entryTimezone || "UTC",
    exitTimezone: trade.exitTimezone || "UTC", 
    direction: (trade.direction === "long" ? "Long" : "Short") as "Long" | "Short",
    entryTimeframe: trade.entryTimeframe || "15m",
    htfTimeframe: trade.htfTimeframe || "1h",
    slPips: trade.slPips?.toString() || "0",
    confidenceRating: trade.confidenceRating || 5,
    tags: trade.tags || [],
    didHitBE: trade.didHitBE || false,
    tpHitAfterBE: trade.tpHitAfterBE || false,
    reversedAfterBE: trade.reversedAfterBE || false,
    tpHit: trade.tpHit || "none",
    demonTags: trade.demonTags || [],
    strategyId: trade.strategyId || "",
    accountId: trade.accountId || "",
    session: trade.session || "",
    entryType: trade.entryType || "",
    obType: trade.obType || "",
    marketStructure: trade.marketStructure || "",
    liquidityContext: trade.liquidityContext || "",
    exitReason: trade.exitReason || "",
    slLogic: trade.slLogic || "",
    tpLogic: trade.tpLogic || "",
    notes: trade.notes || "",
    maxDrawdown: trade.maxDrawdown,
    recoveryTime: trade.recoveryTime,
    drawdownDuration: trade.drawdownDuration,
    riskAmount: trade.riskAmount || "",
    riskRewardRatio: trade.riskRewardRatio,
    positionSize: trade.positionSize?.toString() || "",
    chartScreenshot: trade.chartScreenshot || "",
    chartAnalysis: (trade.chartAnalysis || []).map(item => ({
      id: item.id || '',
      imageUrl: item.imageUrl || '',
      notes: item.notes || '',
      order: item.order || 0
    })),
    stopLossInPips: true, // Default to true
    takeProfitInPips: true, // Default to true
    confluenceChecks: (trade.confluenceChecks || []).map(item => ({
      confluenceId: item.confluenceId || '',
      isPresent: item.isPresent || false
    })),
    setupQuality: trade.setupQuality
  };
};

// Transforms form data to match the TradeFormData interface
export const transformFormToTradeData = (values: TradeFormValues): TradeFormData => {
  // Calculate session based on entry time and timezone
  // Make sure the detected session is used if not explicitly set
  const detectedSession = detectSession(values.entryTime || "00:00", values.entryTimezone || 'UTC');
  const session = values.session || detectedSession;
  
  // Calculate risk to reward ratio using centralized store method
  const calculateRiskReward = () => {
    const entryPrice = parseFloat(values.entryPrice || "0");
    const slPrice = parseFloat(values.slPrice || "0");
    const exitPrice = parseFloat(values.exitPrice || "0");
    
    return calculateRiskRewardRatio(entryPrice, slPrice, exitPrice);
  };
  
  // Convert form data to TradeFormData ensuring all required fields are present
  const tradeData: TradeFormData = {
    ...values,
    // Explicitly set all required fields
    instrument: values.instrument,
    entryPrice: values.entryPrice,
    exitPrice: values.exitPrice,
    slPrice: values.slPrice,
    entryDate: values.entryDate,
    direction: values.direction,
    entryTimeframe: values.entryTimeframe,
    htfTimeframe: values.htfTimeframe,
    tags: values.tags || [],
    slPips: values.slPips,
    confidenceRating: values.confidenceRating,
    didHitBE: values.didHitBE || false,
    tpHitAfterBE: values.tpHitAfterBE || false,
    reversedAfterBE: values.reversedAfterBE || false,
    tpHit: values.tpHit || "none",
    // Make sure to preserve entry time and timezone
    entryTime: values.entryTime || "00:00",
    exitTime: values.exitTime || "00:00",
    entryTimezone: values.entryTimezone || "UTC",
    exitTimezone: values.exitTimezone || "UTC",
    // Ensure session is always present - use the detected or explicitly set session
    session: session,
    // Use optional fields or provide empty string defaults
    entryType: values.entryType || '',
    obType: values.obType || '',
    marketStructure: values.marketStructure || '',
    liquidityContext: values.liquidityContext || '',
    exitReason: values.exitReason || '',
    slLogic: values.slLogic || '',
    tpLogic: values.tpLogic || '',
    // Add strategyId from form values
    strategyId: values.strategyId || 'default',
    // Add risk amount
    riskAmount: values.riskAmount || '',
    // Add demon tags
    demonTags: values.demonTags || [],
    // Add chart screenshot
    chartScreenshot: values.chartScreenshot || '',
    // Add chart analysis with screenshots and notes
    chartAnalysis: (values.chartAnalysis || []).map(item => ({
      id: item.id || '',
      imageUrl: item.imageUrl || '',
      notes: item.notes || '',
      order: item.order || 0
    })),
    // Add notes
    notes: values.notes || '',
    // Add drawdown analysis fields
    maxDrawdown: values.maxDrawdown,
    recoveryTime: values.recoveryTime,
    drawdownDuration: values.drawdownDuration,
    // Add calculated metrics
    riskRewardRatio: values.riskRewardRatio,
    positionSize: values.positionSize,
    // Add confluence checks
    confluenceChecks: (values.confluenceChecks || []).map(item => ({
      confluenceId: item.confluenceId || '',
      isPresent: item.isPresent || false
    })),
    // Add setup quality
    setupQuality: values.setupQuality
  };


  return tradeData;
};

// Prepare trade data for API submission by converting types and formats
export const prepareTradeSave = (tradeData: TradeFormData): Partial<Trade> => {
  // Calculate risk to reward ratio using centralized store method
  const calculateRiskReward = () => {
    const entryPrice = parseFloat(tradeData.entryPrice || "0");
    const slPrice = parseFloat(tradeData.slPrice || "0");
    const exitPrice = parseFloat(tradeData.exitPrice || "0");
    
    return calculateRiskRewardRatio(entryPrice, slPrice, exitPrice);
  };
  
  // Calculate profit using our centralized calculation system
  const calculateProfit = () => {
    // Use the rMultiple we calculated and riskAmount to get profit
    const rMultiple = calculateRMultipleValue();
    const riskAmount = tradeData.riskAmount ? parseFloat(tradeData.riskAmount) : 0;
    
    if (riskAmount > 0 && isFinite(rMultiple)) {
      return riskAmount * rMultiple;
    }
    
    return 0;
  };

  // Calculate the rMultiple value
  const calculateRMultipleValue = () => {
    const entryPrice = parseFloat(tradeData.entryPrice || "0");
    const exitPrice = parseFloat(tradeData.exitPrice || "0");
    const slPrice = parseFloat(tradeData.slPrice || "0");
    const direction = tradeData.direction.toLowerCase() as "long" | "short";
    
    const slDistance = Math.abs(entryPrice - slPrice);
    if (slDistance > 0) {
      const priceChange = exitPrice - entryPrice;
      return direction === "long" ? priceChange / slDistance : -priceChange / slDistance;
    }
    return 0;
  };

  // Ensure the session is included in the save data
  const saveData = {
    ...tradeData,
    strategyId: tradeData.strategyId || 'default',
    direction: tradeData.direction.toLowerCase() as "long" | "short",
    entryDate: tradeData.entryDate.toISOString(),
    exitDate: tradeData.exitDate ? tradeData.exitDate.toISOString() : undefined,
    // Convert string prices to numbers
    entryPrice: Number(tradeData.entryPrice),
    exitPrice: Number(tradeData.exitPrice),
    slPrice: Number(tradeData.slPrice),
    tp1Price: tradeData.tp1Price ? Number(tradeData.tp1Price) : undefined,
    tp2Price: tradeData.tp2Price ? Number(tradeData.tp2Price) : undefined,
    tp3Price: tradeData.tp3Price ? Number(tradeData.tp3Price) : undefined,
    slPips: tradeData.slPips ? Number(tradeData.slPips) : undefined,
    // Make sure to persist the time and timezone information
    entryTime: tradeData.entryTime || "00:00",
    entryTimezone: tradeData.entryTimezone || "UTC",
    exitTime: tradeData.exitTime || "00:00",
    exitTimezone: tradeData.exitTimezone || "UTC",
    // Make sure session is always included
    session: tradeData.session,
    // Make sure all analysis fields are included
    entryType: tradeData.entryType,
    obType: tradeData.obType,
    marketStructure: tradeData.marketStructure,
    liquidityContext: tradeData.liquidityContext,
    exitReason: tradeData.exitReason,
    slLogic: tradeData.slLogic,
    tpLogic: tradeData.tpLogic,
    // Add console log to verify
    confidenceRating: tradeData.confidenceRating,
    // Include risk amount and risk-reward ratio
    riskAmount: tradeData.riskAmount,
    riskRewardRatio: calculateRiskReward(),
    // Calculate and include rMultiple - THIS WAS MISSING!
    rMultiple: calculateRMultipleValue(),
    // Calculate and include profit
    profit: calculateProfit(),
    // Include demon tags
    demonTags: tradeData.demonTags || [],
    // Include chart screenshot
    chartScreenshot: tradeData.chartScreenshot || '',
    // Include chart analysis with screenshots and notes
    chartAnalysis: tradeData.chartAnalysis || [],
    // Include notes
    notes: tradeData.notes || '',
    // Include drawdown analysis fields
    maxDrawdown: tradeData.maxDrawdown,
    recoveryTime: tradeData.recoveryTime,
    drawdownDuration: tradeData.drawdownDuration,
    // Include calculated metrics
    positionSize: tradeData.positionSize,
    // Include setup quality
    setupQuality: tradeData.setupQuality,
  };

  // Add console log to verify data is being saved
  
  return saveData;
};
