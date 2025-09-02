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
import { calculateRiskRewardRatio, calculatePositionSize, convertPipsToPrice } from "@/hooks/slices/tradeActions";
import { useColors } from "@/hooks/useColors";
import { useParams } from "react-router-dom";

export default function StepLevels() {
  const form = useFormContext<TradeFormValues>();
  const watchedValues = form.watch();
  const colors = useColors();
  
  // Watch current values for conversion
  const entryPrice = parseFloat(watchedValues.entryPrice || "0");
  const currentSlPrice = watchedValues.slPrice;
  const currentExitPrice = watchedValues.exitPrice;
  
  // Get mode preferences from form or default to true
  const stopLossInPips = form.watch('stopLossInPips') ?? true;
  const takeProfitInPips = form.watch('takeProfitInPips') ?? true;

  // Calculate risk-reward ratio using centralized store method
  const calculateRiskReward = () => {
    const entryPrice = parseFloat(watchedValues.entryPrice || "0");
    const slPrice = parseFloat(watchedValues.slPrice || "0");
    const exitPrice = parseFloat(watchedValues.exitPrice || "0");
    const direction = watchedValues.direction || "Long";
    
    if (entryPrice <= 0 || exitPrice <= 0 || slPrice <= 0) {
      return 0;
    }

    // Handle pip to price conversion if needed
    let actualSlPrice = slPrice;
    let actualExitPrice = exitPrice;
    
    if (stopLossInPips && entryPrice > 0) {
      actualSlPrice = convertPipsToPrice(slPrice, entryPrice, direction === "Long");
    }
    
    if (takeProfitInPips && entryPrice > 0) {
      actualExitPrice = convertPipsToPrice(exitPrice, entryPrice, direction === "Long");
    }

    // Use centralized calculation from store
    const ratio = calculateRiskRewardRatio(entryPrice, actualSlPrice, actualExitPrice);
    
    console.log('R:R Calculation (Store Method):', {
      direction,
      entryPrice,
      actualSlPrice,
      actualExitPrice,
      ratio: ratio.toFixed(2)
    });

    return ratio;
  };

  // Calculate position size using centralized store method
  const calculatePositionSizeValue = () => {
    const riskAmount = parseFloat(watchedValues.riskAmount || "0");
    const entryPrice = parseFloat(watchedValues.entryPrice || "0");
    const slPrice = parseFloat(watchedValues.slPrice || "0");
    const direction = watchedValues.direction || "Long";

    // Handle pip conversion if needed
    let actualSlPrice = slPrice;
    if (stopLossInPips && entryPrice > 0) {
      actualSlPrice = convertPipsToPrice(slPrice, entryPrice, direction === "Long");
    }

    // Use centralized calculation from store
    return calculatePositionSize(riskAmount, entryPrice, actualSlPrice);
  };

  const riskRewardRatio = calculateRiskReward();
  const positionSize = calculatePositionSizeValue();

  // Convert price to pips for display conversion

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
          // Convert current pips to price using centralized method
          const price = convertPipsToPrice(parseFloat(currentSlPrice), entryPrice, isLong);
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
          // Convert current pips to price using centralized method
          const price = convertPipsToPrice(parseFloat(currentExitPrice), entryPrice, isLong);
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

      {/* Entry Price */}
      <FormField
        control={form.control}
        name="entryPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: colors.text.primary }} className="font-medium">Entry Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.00001"
                min="0"
                placeholder="Enter entry price"
                {...field}
                style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
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
                  <FormLabel style={{ color: colors.text.primary }} className="font-medium">
                    Stop Loss {stopLossInPipsMode ? '(pips)' : '(price)'}
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs" style={{ color: colors.text.secondary }}>Pips</span>
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
                      style={{ 
                        backgroundColor: colors.background.input, 
                        borderColor: colors.status.negative.border
                      }}
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
                  <FormLabel style={{ color: colors.text.primary }} className="font-medium">
                    Take Profit {takeProfitInPipsMode ? '(pips)' : '(price)'}
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs" style={{ color: colors.text.secondary }}>Pips</span>
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
                      style={{ 
                        backgroundColor: colors.background.input, 
                        borderColor: colors.status.positive.border
                      }}
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
              <FormLabel style={{ color: colors.text.primary }} className="font-medium flex items-center">
                Dollar Risk ($)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  placeholder="Enter dollar risk "
                  style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
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
              <FormLabel style={{ color: colors.text.primary }} className="font-medium flex items-center">
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
                  style={{ 
                    backgroundColor: colors.background.input, 
                    borderColor: colors.border.input
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Risk-Reward Ratio Card with Animation */}
      <div 
        className="rounded-lg border p-4"
        style={{ 
          backgroundColor: colors.background.card, 
          borderColor: colors.border.primary 
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium flex items-center" style={{ color: colors.text.primary }}>
              Risk-Reward Ratio
            </h3>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.text.primary }}>
              1:{riskRewardRatio > 0 ? riskRewardRatio.toFixed(2) : "0.00"}
            </p>
          </div>
          <div 
            className="w-40 h-8 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.background.muted }}
          >
            <div 
              className="h-full"
              style={{ 
                backgroundColor: colors.utils.getRiskRewardColor(riskRewardRatio),
                width: `${Math.min(riskRewardRatio * 30, 100)}%`,
                transition: "width 0.3s ease-in-out" 
              }}
            />
          </div>
        </div>
        <div className="mt-2 text-xs">
          {riskRewardRatio >= 2 ? (
            <span style={{ color: colors.trading.riskReward.excellent }}>
              Great risk-reward ratio! This trade has good potential.
            </span>
          ) : riskRewardRatio >= 1 ? (
            <span style={{ color: colors.trading.riskReward.good }}>
              Acceptable risk-reward ratio. Consider if this matches your strategy.
            </span>
          ) : riskRewardRatio > 0 ? (
            <span style={{ color: colors.trading.riskReward.poor }}>
              Poor risk-reward ratio. You're risking more than you stand to gain.
            </span>
          ) : (
            <span style={{ color: colors.text.disabled }}>
              Enter prices to calculate ratio
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
