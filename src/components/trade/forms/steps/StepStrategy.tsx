"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { InfoIcon, Calculator, Plus } from "lucide-react";
import { useTradeStore } from "@/hooks/useTradeStore";
import { useParams } from "react-router-dom";

export default function StepStrategy() {
  const form = useFormContext<TradeFormValues>();
  const watchedValues = form.watch();
  const [stopLossInPips, setStopLossInPips] = useState(true);
  const [takeProfitInPips, setTakeProfitInPips] = useState(true);
  const { getUniqueStrategies } = useTradeStore();
  const { strategyId } = useParams<{ strategyId: string }>();
  
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

    // Debug log to check values
    console.log('RR Calc:', { entryPrice, exitPrice, slPrice, direction });

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
        
        // Validate long setup: SL should be below entry, TP should be above entry
        if (slPrice >= entryPrice) {
          console.log('❌ Invalid long setup: SL should be below entry price');
          return 0;
        }
        if (exitPrice <= entryPrice) {
          console.log('❌ Invalid long setup: TP should be above entry price');  
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

  // Update form values when calculations change
  React.useEffect(() => {
    form.setValue('riskRewardRatio', riskRewardRatio);
    form.setValue('positionSize', positionSize);
  }, [riskRewardRatio, positionSize, form]);

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <FormField
        control={form.control}
        name="strategyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Strategy</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
      <div className="grid grid-cols-2 gap-4">
        {/* Stop Loss */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-white font-medium">Stop Loss {stopLossInPips ? '(pips)' : '(price)'}</FormLabel>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/60">Pips</span>
              <Switch
                checked={stopLossInPips}
                onCheckedChange={setStopLossInPips}
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20"
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="slPrice"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    step={stopLossInPips ? "1" : "0.00001"}
                    min="0"
                    {...field}
                    className="bg-[#0A0A0A] border-red-500/30 focus:border-red-500/50"
                    placeholder={stopLossInPips ? "Enter in pips" : "Enter in price"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Take Profit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-white font-medium">Take Profit {takeProfitInPips ? '(pips)' : '(price)'}</FormLabel>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/60">Pips</span>
              <Switch
                checked={takeProfitInPips}
                onCheckedChange={setTakeProfitInPips}
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20"
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="exitPrice"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    step={takeProfitInPips ? "1" : "0.00001"}
                    min="0"
                    {...field}
                    className="bg-[#0A0A0A] border-green-500/30 focus:border-green-500/50"
                    placeholder={takeProfitInPips ? "Enter in pips" : "Enter in price"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Dollar Risk and Lot Size Row */}
      <div className="grid grid-cols-2 gap-4">

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
        <div className="space-y-3">
          <div className="flex items-center">
            <FormLabel className="text-white font-medium">Lot Size</FormLabel>
          </div>
          <Input
            type="number"
            value={positionSize > 0 ? positionSize.toFixed(4) : "0.0000"}
            readOnly
            className="bg-[#0A0A0A] border-gray-600/40 text-gray-300"
          />
        </div>
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
