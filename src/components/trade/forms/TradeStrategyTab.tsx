
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
import BehavioralTagsSelector from '../BehavioralTagsSelector';

interface TradeStrategyTabProps {
  strategyType?: 'live' | 'backtest';
  isAccountContext?: boolean;
  currentStrategyId?: string;
}

const TradeStrategyTab: React.FC<TradeStrategyTabProps> = ({ 
  strategyType = 'live', 
  isAccountContext = false,
  currentStrategyId 
}) => {
  const form = useFormContext<TradeFormValues>();
  const getUniqueStrategies = useTradeStore(state => state.getUniqueStrategies);
  
  // Get strategies filtered by type (live or backtest)
  const strategies = getUniqueStrategies(strategyType);
  
  // Watch the selected strategy to conditionally show behavioral tags
  const selectedStrategyId = form.watch('strategyId');
  
  // For strategy context, use the current strategy ID directly
  const effectiveStrategyId = isAccountContext ? selectedStrategyId : currentStrategyId;
  
  return (
    <div className="space-y-6">
      {/* Only show strategy selector in account context */}
      {isAccountContext && (
        <FormField
          control={form.control}
          name="strategyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-white/80">
                {strategyType === 'live' ? 'Trading Strategy' : 'Backtest Strategy'}
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
      )}
      
      {/* Show current strategy info when in strategy context */}
      {/* {!isAccountContext && currentStrategyId && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-medium text-red-400">
              Demon Tracker for: {currentStrategyId}
            </span>
          </div>
          <p className="text-xs text-red-300">
            Track your behavioral demons while trading this strategy. Be honest about your mistakes to improve your discipline.
          </p>
        </div>
      )} */}
      
      {/* Behavioral Tags Selector - Show when strategy is selected or in strategy context */}
      <BehavioralTagsSelector 
        strategyId={effectiveStrategyId} 
        isDemonMode={!isAccountContext}
      />
    </div>
  );
};

export default TradeStrategyTab;
