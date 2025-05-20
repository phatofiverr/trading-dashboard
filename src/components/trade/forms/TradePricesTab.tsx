
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { TradeFormValues } from '../schemas/tradeFormSchema';
import { tpHitOptions } from '../constants/formConstants';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TradePricesTab: React.FC = () => {
  const form = useFormContext<TradeFormValues>();
  
  // Calculate R:R ratio when entry price, SL price, or exit price changes
  useEffect(() => {
    const calculateRiskReward = () => {
      const entryPrice = parseFloat(form.watch("entryPrice") || "0");
      const slPrice = parseFloat(form.watch("slPrice") || "0");
      const exitPrice = parseFloat(form.watch("exitPrice") || "0");
      const direction = form.watch("direction");
      
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
          const rr = (reward / risk).toFixed(2);
          return `1:${rr}`;
        }
      }
      return "1:0";
    };
    
    // Update the R:R display
    const rrRatio = calculateRiskReward();
    const rrElement = document.getElementById('rr-ratio');
    if (rrElement) {
      rrElement.textContent = rrRatio;
    }
  }, [form.watch("entryPrice"), form.watch("slPrice"), form.watch("exitPrice"), form.watch("direction"), form]);
  
  return (
    <div className="space-y-6">
      {/* Entry & Exit Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="entryPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-white/80">Entry Price</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  {...field} 
                  placeholder="0"
                  className="bg-black/20 border-white/10" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="exitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-white/80">Exit Price</FormLabel>
              <FormControl>
                <Input type="text" {...field} className="bg-black/20 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Stop Loss */}
      <FormField
        control={form.control}
        name="slPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-white/80">Stop Loss Price</FormLabel>
            <FormControl>
              <Input 
                type="text" 
                {...field} 
                placeholder="-1"
                className="bg-black/20 border-white/10" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Risk Amount Field */}
      <FormField
        control={form.control}
        name="riskAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-white/80">
              Risk Amount ($)
            </FormLabel>
            <FormControl>
              <Input 
                type="text" 
                {...field} 
                placeholder="Enter risk amount"
                className="bg-black/20 border-white/10" 
              />
            </FormControl>
            <FormMessage />
            <FormDescription className="flex justify-between text-xs text-white/60">
              <span>Risk to Reward Ratio:</span>
              <span id="rr-ratio" className="font-medium text-trading-accent1">1:0</span>
            </FormDescription>
          </FormItem>
        )}
      />
      
      {/* Target Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="tp1Price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-white/80">TP1 Price</FormLabel>
              <FormControl>
                <Input type="text" {...field} className="bg-black/20 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tp2Price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-white/80">TP2 Price</FormLabel>
              <FormControl>
                <Input type="text" {...field} className="bg-black/20 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tp3Price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-white/80">TP3 Price</FormLabel>
              <FormControl>
                <Input type="text" {...field} className="bg-black/20 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* TP Hit Status */}
      <FormField
        control={form.control}
        name="tpHit"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-white/80">Which TP was Hit?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue placeholder="Select TP hit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {tpHitOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Break Even Tracking */}
      <div className="space-y-4 bg-black/30 border border-white/10 p-4 rounded-lg">
        <h3 className="font-medium text-white/90">Break Even (BE) Status</h3>
        
        <FormField
          control={form.control}
          name="didHitBE"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border border-white/10 p-3 bg-black/20">
              <div className="space-y-0.5">
                <FormLabel className="text-white/90">Did trade hit Break Even?</FormLabel>
                <FormDescription className="text-white/60 text-xs">
                  Trade reached entry price after moving in profit
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-trading-accent1"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {form.watch("didHitBE") && (
          <>
            <FormField
              control={form.control}
              name="tpHitAfterBE"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border border-white/10 p-3 bg-black/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white/90">Was TP hit after reaching BE?</FormLabel>
                    <FormDescription className="text-white/60 text-xs">
                      Trade hit take profit after moving back to break even
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-trading-accent1"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reversedAfterBE"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border border-white/10 p-3 bg-black/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white/90">Did trade reverse after BE?</FormLabel>
                    <FormDescription className="text-white/60 text-xs">
                      Trade moved against you after reaching break even
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-trading-accent1"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TradePricesTab;
