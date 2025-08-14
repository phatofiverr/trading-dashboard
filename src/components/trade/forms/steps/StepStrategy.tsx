"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../../schemas/tradeFormSchema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { InfoIcon, Calculator, Plus } from "lucide-react";
import { useTradeStore } from "@/hooks/useTradeStore";
import { useParams } from "react-router-dom";

export default function StepStrategy() {
  const form = useFormContext<TradeFormValues>();
  const watchedValues = form.watch();
  const { getUniqueStrategies } = useTradeStore();
  const { strategyId } = useParams<{ strategyId: string }>();
  
  // Watch current values for conversion
  const entryPrice = parseFloat(watchedValues.entryPrice || "0");
  const currentSlPrice = watchedValues.slPrice;
  const currentExitPrice = watchedValues.exitPrice;
  
  // Get mode preferences from form or default to true
  const stopLossInPips = form.watch('stopLossInPips') ?? true;
  const takeProfitInPips = form.watch('takeProfitInPips') ?? true;
  
  // Determine if we're in backtest or live trading mode
  const isBacktestMode = window.location.pathname.includes('/backtest');
  const strategyType = isBacktestMode ? 'backtest' : 'live';
  
  // Get user's strategies
  const userStrategies = getUniqueStrategies(strategyType);

  // Calculate risk-reward ratio
  const calculateRiskReward = () => {
    const entryPrice = parseFloat(watchedValues.entryPrice || "0");
    const exitPrice = parseFloat(watchedValues.exitPrice || "0");
    const slPrice = parseFloat(watchedValues.slPrice || "0");
    const direction = watchedValues.direction || "Long";


    if (entryPrice > 0 && exitPrice > 0 && slPrice > 0) {
      let reward = 0;
      let risk = 0;
      
      if (direction === "Long") {
        // For long trades: reward when TP > entry, risk when price hits SL < entry
        reward = exitPrice - entryPrice;  // Should be positive for valid long TP
        risk = entryPrice - slPrice;      // Should be positive for valid long SL
        
        console.log('Long trade calc:', { 
          entryPrice, 
          exitPrice, 
          slPrice, 
          rewardCalc: `${exitPrice} - ${entryPrice} = ${reward}`,
          riskCalc: `${entryPrice} - ${slPrice} = ${risk}`
        });
        
        // Valilong setup: SL should be below entry, TP should be above entry
        if (slPrice >= entryPrice) {
          console.log('Invalid long setup: SL should be below entry price');
          return 0;
        }
        if (exitPrice <= entryPrice) {
          console.log('Invalid long setup: TP should be above entry price');  
          return 0;
        }
        
      } else {
        // For short trades: reward when TP < entry, risk when price hits SL > entry
        reward = entryPrice - exitPrice;  // Should be positive for valid short TP
        risk = slPrice - entryPrice;      // Should be positive for valid short SL
        
        console.log('Short trade calc:', { 
          entryPrice, 
          exitPrice, 
          slPrice, 
          rewardCalc: `${entryPrice} - ${exitPrice} = ${reward}`,
          riskCalc: `${slPrice} - ${entryPrice} = ${risk}`
        });
        
        // Validate short setup: SL should be above entry, TP should be below entry
        if (slPrice <= entryPrice) {
          console.log('❌ Invalid short setup: SL should be above entry price');
          return 0;
        }
        if (exitPrice >= entryPrice) {
          console.log('❌ Invalid short setup: TP should be below entry price');
          return 0;
        }
      }
      
      console.log('✅ RR Components:', { 
        direction, 
        reward: reward.toFixed(5), 
        risk: risk.toFixed(5), 
        ratio: (reward / risk).toFixed(2),
        ratioDisplay: `1:${(reward / risk).toFixed(2)}`
      });
      
      // Calculate ratio if both reward and risk are positive
      if (reward > 0 && risk > 0) {
        return reward / risk;
      } else {
        console.log('❌ Invalid R:R - negative reward or risk:', { reward, risk });
        return 0;
      }
    }
    
    console.log('RR Calc failed - missing or invalid values');
    return 0;
  };

  // Calculate position size based on risk amount
  const calculatePositionSize = () => {
    const riskAmount = parseFloat(watchedValues.riskAmount || "0");
    const entryPrice = parseFloat(watchedValues.entryPrice || "0");
    const slPrice = parseFloat(watchedValues.slPrice || "0");

    if (riskAmount && entryPrice && slPrice) {
      const riskPerUnit = Math.abs(entryPrice - slPrice);
      if (riskPerUnit > 0) {
        return riskAmount / riskPerUnit;
      }
    }
    return 0;
  };

  const riskRewardRatio = calculateRiskReward();
  const positionSize = calculatePositionSize();

  // Convert pips to price and vice versa
  const convertPipsToPrice = (pips: number, isLong: boolean) => {
    if (!entryPrice || pips <= 0) return 0;
    const pipValue = pips * 0.0001; // Standard pip value for most forex pairs
    return isLong ? entryPrice + pipValue : entryPrice - pipValue;
  };

  const convertPriceToPips = (price: number, isLong: boolean) => {
    if (!entryPrice || price <= 0) return 0;
    const priceDiff = Math.abs(price - entryPrice);
    return Math.round(priceDiff / 0.0001);
  };

  // Handle stop loss mode change
  const handleStopLossModeChange = (usePips: boolean) => {
    console.log('Stop Loss mode change:', { from: stopLossInPips, to: usePips, currentSlPrice, entryPrice });
    form.setValue('stopLossInPips', usePips);
    
    if (currentSlPrice && entryPrice && parseFloat(currentSlPrice) > 0) {
      const direction = watchedValues.direction || "Long";
      const isLong = direction === "Long";
      
      try {
        if (usePips) {
          // Convert current price to pips
          const pips = convertPriceToPips(parseFloat(currentSlPrice), isLong);
          console.log('Converting SL price to pips:', { price: currentSlPrice, pips });
          form.setValue('slPrice', pips.toString());
        } else {
          // Convert current pips to price
          const price = convertPipsToPrice(parseFloat(currentSlPrice), isLong);
          console.log('Converting SL pips to price:', { pips: currentSlPrice, price });
          form.setValue('slPrice', price.toFixed(5));
        }
      } catch (error) {
        console.error('Error converting stop loss value:', error);
      }
    }
  };

  // Handle take profit mode change
  const handleTakeProfitModeChange = (usePips: boolean) => {
    console.log('Take Profit mode change:', { from: takeProfitInPips, to: usePips, currentExitPrice, entryPrice });
    form.setValue('takeProfitInPips', usePips);
    
    if (currentExitPrice && entryPrice && parseFloat(currentExitPrice) > 0) {
      const direction = watchedValues.direction || "Long";
      const isLong = direction === "Long";
      
      try {
        if (usePips) {
          // Convert current price to pips
          const pips = convertPriceToPips(parseFloat(currentExitPrice), isLong);
          console.log('Converting TP price to pips:', { price: currentExitPrice, pips });
          form.setValue('exitPrice', pips.toString());
        } else {
          // Convert current pips to price
          const price = convertPipsToPrice(parseFloat(currentExitPrice), isLong);
          console.log('Converting TP pips to price:', { pips: currentExitPrice, price });
          form.setValue('exitPrice', price.toFixed(5));
        }
      } catch (error) {
        console.error('Error converting take profit value:', error);
      }
    }
  };

  // Update form values when calculations change
  React.useEffect(() => {
    form.setValue('riskRewardRatio', riskRewardRatio);
    form.setValue('positionSize', positionSize > 0 ? positionSize.toFixed(4) : "");
  }, [riskRewardRatio, positionSize]);

  return (
    <div className="h-[60vh] overflow-y-auto space-y-6 pr-2">
      {/* Strategy Selection */}
      <FormField
        control={form.control}
        name="strategyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Strategy</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-[#0A0A0A] border-gray-600/40">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {/* If in strategy context, show current strategy */}
                {strategyId && (
                  <SelectItem value={strategyId} className="bg-blue-500/20 text-blue-400">
                    🎯 {strategyId} (Current)
                  </SelectItem>
                )}
                
                {/* Show user's created strategies */}
                {userStrategies.length > 0 ? (
                  userStrategies
                    .filter(strategy => strategy !== strategyId) // Don't duplicate current strategy
                    .map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {strategy}
                      </SelectItem>
                    ))
                ) : (
                  !strategyId && (
                    <SelectItem value="none" disabled>
                      <div className="flex items-center space-x-2 text-white/60">
                        <Plus className="h-4 w-4" />
                        <span>No strategies created yet</span>
                      </div>
                    </SelectItem>
                  )
                )}
                
                {/* Option for no strategy (account context) */}
                <SelectItem value="none">
                  <div className="flex items-center space-x-2">
                    <span>No Strategy (Account Only)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Entry Price */}
      <FormField
        control={form.control}
        name="entryPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Entry Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.00001"
                min="0"
                placeholder="Enter entry price"
                {...field}
                className="bg-[#0A0A0A] border-gray-600/40"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Stop Loss and Take Profit Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stop Loss */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="stopLossInPips"
            render={({ field }) => {
              const stopLossInPipsMode = form.watch('stopLossInPips');
              return (
                <div className="flex items-center justify-between">
                  <FormLabel className="text-white font-medium">
                    Stop Loss {stopLossInPipsMode ? '(pips)' : '(price)'}
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-white/60">Pips</span>
                    <Switch
                      checked={field.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = e.target.checked;
                        console.log('Stop Loss Switch onChange:', { 
                          fieldValue: field.value, 
                          targetChecked: checked, 
                          formValue: form.getValues('stopLossInPips')
                        });
                        field.onChange(checked);
                        handleStopLossModeChange(checked);
                      }}
                      className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20"
                    />
                  </div>
                </div>
              );
            }}
          />
          <FormField
            control={form.control}
            name="slPrice"
            render={({ field }) => {
              const isInPips = form.watch('stopLossInPips');
              return (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step={isInPips ? "1" : "0.00001"}
                      min="0"
                      {...field}
                      className="bg-[#0A0A0A] border-red-500/30 focus:border-red-500/50"
                      placeholder={isInPips ? "Enter in pips" : "Enter in price"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Take Profit */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="takeProfitInPips"
            render={({ field }) => {
              const takeProfitInPipsMode = form.watch('takeProfitInPips');
              return (
                <div className="flex items-center justify-between">
                  <FormLabel className="text-white font-medium">
                    Take Profit {takeProfitInPipsMode ? '(pips)' : '(price)'}
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-white/60">Pips</span>
                    <Switch
                      checked={field.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = e.target.checked;
                        console.log('Take Profit Switch onChange:', { 
                          fieldValue: field.value, 
                          targetChecked: checked, 
                          formValue: form.getValues('takeProfitInPips')
                        });
                        field.onChange(checked);
                        handleTakeProfitModeChange(checked);
                      }}
                      className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20"
                    />
                  </div>
                </div>
              );
            }}
          />
          <FormField
            control={form.control}
            name="exitPrice"
            render={({ field }) => {
              const isInPips = form.watch('takeProfitInPips');
              return (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step={isInPips ? "1" : "0.00001"}
                      min="0"
                      {...field}
                      className="bg-[#0A0A0A] border-green-500/30 focus:border-green-500/50"
                      placeholder={isInPips ? "Enter in pips" : "Enter in price"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </div>

      {/* Dollar Risk and Lot Size Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Dollar Risk */}
        <FormField
          control={form.control}
          name="riskAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-medium flex items-center">
                Dollar Risk ($)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  placeholder="Enter dollar risk "
                  className="bg-[#0A0A0A] border-gray-600/40"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lot Size */}
        <FormField
          control={form.control}
          name="positionSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-medium flex items-center">
                Lot Size
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  {...field}
                  value={field.value !== undefined && field.value !== null ? field.value : (positionSize > 0 ? positionSize.toFixed(4) : "")}
                  placeholder="Enter lot size"
                  className="bg-[#0A0A0A] border-gray-600/40 focus:border-green-500/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Risk-Reward Ratio Card with Animation */}
      <div className="bg-[#0A0A0A] rounded-lg border border-gray-600/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white flex items-center">
              Risk-Reward Ratio
            </h3>
            <p className="text-2xl font-bold mt-1 text-white">
              1:{riskRewardRatio > 0 ? riskRewardRatio.toFixed(2) : "0.00"}
            </p>
          </div>
          <div className="w-40 h-8 bg-gray-600/20 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                riskRewardRatio >= 2 
                  ? "bg-green-500" 
                  : riskRewardRatio >= 1 
                  ? "bg-amber-500" 
                  : "bg-red-500"
              }`}
              style={{ 
                width: `${Math.min(riskRewardRatio * 30, 100)}%`,
                transition: "width 0.3s ease-in-out" 
              }}
            />
          </div>
        </div>
        <div className="mt-2 text-xs">
          {riskRewardRatio >= 2 ? (
            <span className="text-green-400">Great risk-reward ratio! This trade has good potential.</span>
          ) : riskRewardRatio >= 1 ? (
            <span className="text-amber-400">Acceptable risk-reward ratio. Consider if this matches your strategy.</span>
          ) : riskRewardRatio > 0 ? (
            <span className="text-red-400">Poor risk-reward ratio. You're risking more than you stand to gain.</span>
          ) : (
            <span className="text-white/60">Enter prices to calculate ratio</span>
          )}
        </div>
      </div>

    </div>
  );
}
