
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTradeStore } from '@/hooks/useTradeStore';
import { TradeFormValues } from '../schemas/tradeFormSchema';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface TradeStrategyTabProps {
  strategyType?: 'live' | 'backtest';
}

const TradeStrategyTab: React.FC<TradeStrategyTabProps> = ({ strategyType = 'live' }) => {
  const form = useFormContext<TradeFormValues>();
  const getUniqueStrategies = useTradeStore(state => state.getUniqueStrategies);
  
  // Get strategies filtered by type (live or backtest)
  const strategies = getUniqueStrategies(strategyType);
  
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="strategyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-white/80">
              {strategyType === 'live' ? 'Live Trading Strategy' : 'Backtest Strategy'}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || "none"}
            >
              <FormControl>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue placeholder="Select Strategy" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">No Strategy (Account Only)</SelectItem>
                {strategies.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {strategy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TradeStrategyTab;
