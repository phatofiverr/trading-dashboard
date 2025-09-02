"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoIcon, Calculator, Plus, Target } from "lucide-react";
import { useTradeStore } from "@/hooks/useTradeStore";
import { useColors } from "@/hooks/useColors";
import { useParams } from "react-router-dom";
import { calculateSetupQuality, TradeConfluenceCheck } from "@/utils/confluenceUtils";

export default function StepLevels() {
  const { getUniqueStrategies, getStrategyById, strategies, deleteStrategy } = useTradeStore();
  const form = useFormContext<TradeFormValues>();
  const colors = useColors();
  const { strategyId } = useParams<{ strategyId: string }>();

  // Use a ref to track if we've initialized confluence checks for the current strategy
  const initializedStrategyRef = useRef<string | null>(null);

  // Clean up any existing "Multi-Account" strategy on component mount
  useEffect(() => {
    const cleanupMultiAccount = async () => {
      console.log('StepStrategy cleanup effect running...');
      console.log('Current strategies:', strategies);
      const multiAccountStrategy = strategies.find(s => s.name === "Multi-Account");
      console.log('Multi-Account strategy found:', multiAccountStrategy);

      if (multiAccountStrategy) {
        console.log('Found existing "Multi-Account" strategy, cleaning up from local and Firebase...');

        // Delete from local state
        const localDeleteResult = deleteStrategy("Multi-Account");
        console.log('Local delete result:', localDeleteResult);

        // Also delete from Firebase directly
        try {
          // Import firebaseService dynamically to avoid circular imports
          const firebaseService = await import('@/services/firebaseService');
          await firebaseService.deleteStrategy(multiAccountStrategy.id);
          console.log('Firebase delete completed for Multi-Account strategy');
        } catch (error) {
          console.error('Failed to delete Multi-Account strategy from Firebase:', error);
        }
      } else {
        console.log('No Multi-Account strategy found to clean up');
      }
    };

    cleanupMultiAccount();
  }, [strategies, deleteStrategy]); // Include dependencies to re-run when strategies change

  // Default to 'live' strategy type if not specified
  const strategyType = 'live';
  const userStrategies = useMemo(() => getUniqueStrategies(strategyType), [getUniqueStrategies, strategyType]);

  // Watch only the strategyId field to avoid unnecessary re-renders
  const selectedStrategyId = form.watch('strategyId') || strategyId;

  // Memoize selected strategy to prevent unnecessary recalculations
  const selectedStrategy = useMemo(() => {
    if (!selectedStrategyId) return undefined;

    return getStrategyById(selectedStrategyId) || // First try by ID
           strategies.find(s => s.name === selectedStrategyId); // Then try by name
  }, [selectedStrategyId, getStrategyById, strategies]);

  // Watch confluence checks specifically
  const confluenceChecks = form.watch('confluenceChecks') || [];

  // Calculate setup quality - memoize to prevent unnecessary recalculations
  const setupQuality = useMemo(() => {
    return selectedStrategy?.confluences
      ? calculateSetupQuality(selectedStrategy.confluences, confluenceChecks as TradeConfluenceCheck[])
      : 0;
  }, [selectedStrategy?.confluences, confluenceChecks]);

  // Initialize confluence checks when strategy changes - use ref to prevent infinite loops
  useEffect(() => {
    // Only initialize if strategy changed and we haven't initialized for this strategy yet
    if (selectedStrategy?.id && selectedStrategy.id !== initializedStrategyRef.current) {
      if (selectedStrategy.confluences?.length) {
        // Get existing checks from form or initialize new ones
        const existingChecks = form.getValues('confluenceChecks') || [];
        const strategyConfluenceIds = selectedStrategy.confluences.map(c => c.id);

        // Filter out checks for confluences that don't belong to this strategy
        const relevantChecks = existingChecks.filter(check =>
          strategyConfluenceIds.includes(check.confluenceId)
        );

        // Add any missing confluences with default false state
        const missingConfluences = selectedStrategy.confluences.filter(confluence =>
          !relevantChecks.some(check => check.confluenceId === confluence.id)
        );

        const newChecks = missingConfluences.map(confluence => ({
          confluenceId: confluence.id,
          isPresent: false
        }));

        const allChecks = [...relevantChecks, ...newChecks];
        form.setValue('confluenceChecks', allChecks);
      } else {
        form.setValue('confluenceChecks', []);
      }

      // Mark this strategy as initialized
      initializedStrategyRef.current = selectedStrategy.id;
    }
  }, [selectedStrategy?.id]); // Only depend on strategy ID

  // Update form with calculated setup quality
  useEffect(() => {
    form.setValue('setupQuality', setupQuality);
  }, [setupQuality]);

  // Handle confluence check change - use ref to access form methods
  const handleConfluenceCheck = useCallback((confluenceId: string, checked: boolean) => {
    const currentChecks = form.getValues('confluenceChecks') || [];
    const updatedChecks = currentChecks.map(check =>
      check.confluenceId === confluenceId
        ? { ...check, isPresent: checked }
        : check
    );
    form.setValue('confluenceChecks', updatedChecks);
  }, []); // Remove form from dependencies to prevent infinite loops

  return (
    <div className="h-[60vh] overflow-y-auto space-y-6 pr-2">
      {/* Strategy Selection */}
      <FormField
        control={form.control}
        name="strategyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: colors.text.primary }} className="font-medium">Strategy</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger 
                  style={{ 
                    backgroundColor: colors.background.input, 
                    borderColor: colors.border.input 
                  }}
                >
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {/* If in strategy context, show current strategy */}
                {strategyId && strategyId !== "Multi-Account" && (
                  <SelectItem 
                    value={strategyId} 
                    style={{ 
                      backgroundColor: colors.status.info.background,
                      color: colors.status.info.primary 
                    }}
                  >
                    🎯 {strategyId} (Current)
                  </SelectItem>
                )}
                
                {/* Show user's created strategies */}
                {(() => {
                  const filteredStrategies = userStrategies
                    .filter(strategy => strategy !== strategyId) // Don't duplicate current strategy
                    .filter(strategy => strategy !== "Multi-Account"); // Filter out multi-account pseudo-strategy

                  return filteredStrategies.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy}
                    </SelectItem>
                  ));
                })()}

                {/* Show "no strategies" message only if no strategies and not in strategy context */}
                {!strategyId && userStrategies.length === 0 && (
                  <SelectItem value="none" disabled>
                    <div className="flex items-center space-x-2" style={{ color: colors.text.secondary }}>
                      <Plus className="h-4 w-4" />
                      <span>No strategies created yet</span>
                    </div>
                  </SelectItem>
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
      
      {/* Strategy Selection Message */}
      {/* {(!selectedStrategyId || selectedStrategyId === "none") && (
        <div 
          className="rounded-lg border p-4"
          style={{
            backgroundColor: colors.status.info.background,
            borderColor: colors.status.info.border
          }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.status.info.primary }}>
            <span>
            You can assign a strategy to this trade or leave it unassigned if you prefer.
            </span>
          </div>
        </div>
      )} */}
      
      {/* Setup Quality Assessment */}
      {selectedStrategy?.confluences?.length > 0 && (
        <div 
          className="rounded-lg p-4 mt-6"
          style={{
            backgroundColor: colors.background.glass,
            border: `1px solid ${colors.border.muted}`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium" style={{ color: colors.text.primary }}>Setup Quality Assessment</h3>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="text-lg font-bold"
                style={{
                  color: setupQuality >= 80 ? colors.status.positive.primary :
                         setupQuality >= 60 ? colors.status.warning.primary :
                         setupQuality >= 40 ? colors.status.warning.secondary :
                         colors.status.negative.primary
                }}
              >
                {setupQuality}%
              </div>
              <div 
                className="w-20 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.background.muted }}
              >
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${setupQuality}%`,
                    backgroundColor: setupQuality >= 80 ? colors.status.positive.primary :
                                   setupQuality >= 60 ? colors.status.warning.primary :
                                   setupQuality >= 40 ? colors.status.warning.secondary :
                                   colors.status.negative.primary
                  }}
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
                <div 
                  key={confluence.id} 
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: colors.background.glass }}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => 
                        handleConfluenceCheck(confluence.id, e.target.checked)
                      }
                      style={{
                        '--checked-bg-color': colors.status.positive.primary,
                        '--checked-border-color': colors.status.positive.primary
                      }}
                    />
                    <div>
                      <div className="font-medium" style={{ color: colors.text.primary }}>{confluence.name}</div>
                      {confluence.description && (
                        <div className="text-sm text-muted-foreground">
                          {confluence.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: colors.status.info.primary }}>
                    {confluence.weight}%
                  </div>
                </div>
              );
            })}
          </div>
          
          <div 
            className="mt-4 p-3 rounded-lg border"
            style={{
              backgroundColor: colors.status.info.background,
              borderColor: colors.status.info.border
            }}
          >
            <div className="flex items-center gap-2 text-sm" style={{ color: colors.status.info.primary }}>
              <InfoIcon className="h-4 w-4" />
              <span>
                Check off the confluences present in this setup.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
