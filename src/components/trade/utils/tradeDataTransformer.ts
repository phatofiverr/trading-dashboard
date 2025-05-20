
import { TradeFormValues } from '../schemas/tradeFormSchema';
import { Trade, TradeFormData } from '@/types/Trade';
import { detectSession } from './sessionDetector';

// Transforms form data to match the TradeFormData interface
export const transformFormToTradeData = (values: TradeFormValues): TradeFormData => {
  // Calculate session based on entry time and timezone
  // Make sure the detected session is used if not explicitly set
  const detectedSession = detectSession(values.entryTime || "00:00", values.entryTimezone || 'UTC');
  const session = values.session || detectedSession;
  
  // Calculate risk to reward ratio if we have valid entry, SL, and exit prices
  const calculateRiskReward = () => {
    const entryPrice = parseFloat(values.entryPrice || "0");
    const slPrice = parseFloat(values.slPrice || "0");
    const exitPrice = parseFloat(values.exitPrice || "0");
    const direction = values.direction;
    
    if (entryPrice && slPrice && exitPrice && entryPrice !== slPrice) {
      // Calculate risk (in price units)
      const risk = direction === "Long" 
        ? Math.abs(entryPrice - slPrice) 
        : Math.abs(slPrice - entryPrice);
      
      // Calculate reward (in price units)
      const reward = direction === "Long" 
        ? Math.abs(exitPrice - entryPrice) 
        : Math.abs(entryPrice - exitPrice);
      
      // Return R:R as string (1:X format)
      if (risk > 0) {
        return `1:${(reward / risk).toFixed(2)}`;
      }
    }
    return "1:0";
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
    // Add strategyId from form values
    strategyId: values.strategyId || 'default',
    // Add risk amount
    riskAmount: values.riskAmount || '',
  };

  // Add console log to verify all data is present
  console.log("Trade data from form:", tradeData);

  return tradeData;
};

// Prepare trade data for API submission by converting types and formats
export const prepareTradeSave = (tradeData: TradeFormData): Partial<Trade> => {
  // Calculate risk to reward ratio
  const calculateRiskReward = () => {
    const entryPrice = parseFloat(tradeData.entryPrice || "0");
    const slPrice = parseFloat(tradeData.slPrice || "0");
    const exitPrice = parseFloat(tradeData.exitPrice || "0");
    const direction = tradeData.direction;
    
    if (entryPrice && slPrice && exitPrice && entryPrice !== slPrice) {
      // Calculate risk (in price units)
      const risk = direction === "Long" 
        ? Math.abs(entryPrice - slPrice) 
        : Math.abs(slPrice - entryPrice);
      
      // Calculate reward (in price units)
      const reward = direction === "Long" 
        ? Math.abs(exitPrice - entryPrice) 
        : Math.abs(entryPrice - exitPrice);
      
      // Return R:R as string (1:X format)
      if (risk > 0) {
        return `1:${(reward / risk).toFixed(2)}`;
      }
    }
    return "1:0";
  };
  
  // Calculate profit based on risk amount and R multiple
  const calculateProfit = () => {
    if (!tradeData.riskAmount) return undefined;
    
    const riskAmount = parseFloat(tradeData.riskAmount);
    if (isNaN(riskAmount)) return undefined;
    
    // Calculate profit based on entryPrice, exitPrice and direction
    const entryPrice = parseFloat(tradeData.entryPrice || "0");
    const exitPrice = parseFloat(tradeData.exitPrice || "0");
    const direction = tradeData.direction;
    
    if (isNaN(entryPrice) || isNaN(exitPrice)) return undefined;
    
    let profitMultiplier = 0;
    if (direction === "Long") {
      profitMultiplier = (exitPrice - entryPrice) / entryPrice;
    } else {
      profitMultiplier = (entryPrice - exitPrice) / entryPrice;
    }
    
    return riskAmount * profitMultiplier;
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
    // Add console log to verify
    confidenceRating: tradeData.confidenceRating,
    // Include risk amount and risk-reward ratio
    riskAmount: tradeData.riskAmount,
    riskRewardRatio: calculateRiskReward(),
    // Calculate and include profit
    profit: calculateProfit(),
  };

  // Add console log to verify data is being saved
  console.log("Data being saved to API:", saveData);
  
  return saveData;
};
