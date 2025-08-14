
import { TradeFormValues } from '../schemas/tradeFormSchema';
import { Trade, TradeFormData } from '@/types/Trade';
import { detectSession } from './sessionDetector';
import { calculateTradeProfit } from '@/lib/accountCalculations';

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
      
      // Return R:R as number (ratio value)
      if (risk > 0) {
        return reward / risk;
      }
    }
    return 0;
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
    tpHit: values.tpHit,
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
    chartAnalysis: values.chartAnalysis || [],
    // Add notes
    notes: values.notes || '',
    // Add drawdown analysis fields
    maxDrawdown: values.maxDrawdown,
    recoveryTime: values.recoveryTime,
    drawdownDuration: values.drawdownDuration,
    // Add calculated metrics
    riskRewardRatio: values.riskRewardRatio,
    positionSize: values.positionSize,
  };


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
      
      // Return R:R as number (ratio value)
      if (risk > 0) {
        return reward / risk;
      }
    }
    return 0;
  };
  
  // Calculate profit using our centralized calculation system
  const calculateProfit = () => {
    // Create a temporary trade object for calculation
    const tempTrade: Partial<Trade> = {
      entryPrice: parseFloat(tradeData.entryPrice || "0"),
      exitPrice: parseFloat(tradeData.exitPrice || "0"),
      slPrice: parseFloat(tradeData.slPrice || "0"),
      direction: tradeData.direction.toLowerCase() as "long" | "short",
      riskAmount: tradeData.riskAmount,
      // Calculate R-multiple for the temp trade
      rMultiple: (() => {
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
      })()
    };
    
    return calculateTradeProfit(tempTrade as Trade);
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
  };

  // Add console log to verify data is being saved
  
  return saveData;
};
