"use client";

import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoIcon, Calculator, Plus, Target } from "lucide-react";
import { useTradeStore } from "@/hooks/useTradeStore";
import { useParams } from "react-router-dom";
import { calculateSetupQuality, TradeConfluenceCheck } from "@/utils/confluenceUtils";
import { Confluence } from "@/hooks/slices/types";

export default function StepLevels() {
  const { getUniqueStrategies, getStrategyById, strategies } = useTradeStore();
  const form = useFormContext<TradeFormValues>();
  const { strategyId } = useParams<{ strategyId: string }>();
  
  // Default to 'live' strategy type if not specified
  const strategyType = 'live';
  const userStrategies = getUniqueStrategies(strategyType);
  const watchedValues = form.watch();
  
  // Confluence tracking state
  const [confluenceChecks, setConfluenceChecks] = useState<TradeConfluenceCheck[]>([]);
  

  // Get selected strategy for confluences
  const selectedStrategyId = watchedValues.strategyId || strategyId;
  const selectedStrategy = selectedStrategyId ? 
    getStrategyById(selectedStrategyId) || // First try by ID
    strategies.find(s => s.name === selectedStrategyId) // Then try by name
    : undefined;
  
  // Initialize confluence checks when strategy changes
  useEffect(() => {
    if (selectedStrategy?.confluences?.length) {
      const initialChecks = selectedStrategy.confluences.map(confluence => ({
        confluenceId: confluence.id,
        isPresent: false
      }));
      setConfluenceChecks(initialChecks);
    } else {
      setConfluenceChecks([]);
    }
  }, [selectedStrategy?.id]);
  
  // Calculate setup quality
  const setupQuality = selectedStrategy?.confluences 
    ? calculateSetupQuality(selectedStrategy.confluences, confluenceChecks)
    : 0;
  
  // Handle confluence check change
  const handleConfluenceCheck = (confluenceId: string, checked: boolean) => {
    setConfluenceChecks(prev => 
      prev.map(check => 
        check.confluenceId === confluenceId 
          ? { ...check, isPresent: checked }
          : check
      )
    );
  };

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
      
      {/* Setup Quality Assessment */}
      {selectedStrategy?.confluences?.length > 0 && (
        <div className="glass-effect bg-black/5 border-0 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-white">Setup Quality Assessment</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-lg font-bold ${
                setupQuality >= 80 ? 'text-green-400' :
                setupQuality >= 60 ? 'text-yellow-400' :
                setupQuality >= 40 ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {setupQuality}%
              </div>
              <div className="w-20 h-2 bg-black/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    setupQuality >= 80 ? 'bg-green-400' :
                    setupQuality >= 60 ? 'bg-yellow-400' :
                    setupQuality >= 40 ? 'bg-orange-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: `${setupQuality}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {selectedStrategy.confluences.map((confluence) => {
              const isChecked = confluenceChecks.find(
                check => check.confluenceId === confluence.id
              )?.isPresent || false;
              
              return (
                <div key={confluence.id} className="flex items-center justify-between p-3 bg-black/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => 
                        handleConfluenceCheck(confluence.id, e.target.checked)
                      }
                      className="checked:bg-blue-500 checked:border-blue-500"
                    />
                    <div>
                      <div className="font-medium text-white">{confluence.name}</div>
                      {confluence.description && (
                        <div className="text-sm text-muted-foreground">
                          {confluence.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-400">
                    {confluence.weight}%
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <InfoIcon className="h-4 w-4" />
              <span>
                Check off the confluences present in this setup. Quality score helps track which setups perform best.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
