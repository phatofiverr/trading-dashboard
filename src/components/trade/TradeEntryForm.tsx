import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTradeStore } from '@/hooks/useTradeStore';
import { tradeFormSchema, TradeFormValues } from './schemas/tradeFormSchema';
import { transformFormToTradeData, prepareTradeSave } from './utils/tradeDataTransformer';
import { useParams } from 'react-router-dom';
import { Trade } from '@/types/Trade';
import { getInitialTradeData } from './utils/tradeFormUtils';
import { TradeEntryFormProps } from './TradeEntryFormProps';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';

// Import tab components
import TradeSetupTab from './forms/TradeSetupTab';
import TradePricesTab from './forms/TradePricesTab';
import TradeStrategyTab from './forms/TradeStrategyTab';

const TradeEntryForm: React.FC<TradeEntryFormProps> = ({ initialTrade, isEditing = false, initialAccountId, initialStrategyId }) => {
  const { addTrade, updateTrade, filters, lastEntryDate } = useTradeStore();
  const [activeTab, setActiveTab] = useState('setup');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { strategyId } = useParams<{ strategyId: string }>();
  
  // Initialize form with default values
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      // Required fields - ensure they all have proper defaults
      instrument: "",
      entryPrice: "0",
      exitPrice: "",
      slPrice: "-1",
      entryDate: undefined,
      entryTime: "00:00",
      exitTime: "00:00",
      entryTimeframe: "15m",
      htfTimeframe: "1h",
      
      // Other fields
      direction: "Long",
      entryTimezone: "America/New_York",
      exitTimezone: "America/New_York",
      tags: [],
      behavioralTags: [],
      didHitBE: false,
      tpHitAfterBE: false,
      reversedAfterBE: false,
      tpHit: "none",
      confidenceRating: 5,
      tp1Price: "",
      tp2Price: "",
      tp3Price: "",
      riskAmount: "",
      tradeId: "",
      notes: "",
      slPips: "0",
      session: "",
      entryType: "",
      obType: "",
      marketStructure: "",
      liquidityContext: "",
      exitReason: "",
      slLogic: "",
      tpLogic: "",
      // Only set strategy ID if we're in strategy context or it's provided
      strategyId: initialStrategyId || (initialAccountId ? "none" : (strategyId || filters.strategy)) || "",
      accountId: initialAccountId || ""
    },
  });
  
  // Watch form values to determine if all required fields are filled
  const watchedValues = form.watch();
  const isFormValid = form.formState.isValid;
  
  // Check if all required fields have values (not just validation)
  // entryPrice and slPrice have valid defaults, so they're always considered filled
  const requiredFields = ['instrument', 'exitPrice', 'entryDate', 'entryTime', 'exitTime', 'entryTimeframe', 'htfTimeframe'];
  const allRequiredFieldsFilled = requiredFields.every(field => {
    const value = watchedValues[field as keyof typeof watchedValues];
    if (field === 'entryDate') return value !== undefined;
    return value && value.toString().trim() !== '';
  });
  
  // If initialTrade is provided, populate the form with its values
  useEffect(() => {
    if (initialTrade && isEditing) {
      // Transform the trade data back to form values
      form.reset({
        tradeId: initialTrade.tradeId || initialTrade.id,
        strategyId: initialTrade.strategyId,
        accountId: initialTrade.accountId,
        instrument: initialTrade.pair || '',
        direction: initialTrade.direction === 'long' ? 'Long' : 'Short',
        entryDate: new Date(initialTrade.entryDate),
        exitDate: initialTrade.exitDate ? new Date(initialTrade.exitDate) : undefined,
        entryTime: initialTrade.entryTime || "00:00",
        exitTime: initialTrade.exitTime || "00:00",
        entryTimezone: initialTrade.entryTimezone || "America/New_York",
        exitTimezone: initialTrade.exitTimezone || "America/New_York",
        entryTimeframe: initialTrade.entryTimeframe || "15m",
        htfTimeframe: initialTrade.htfTimeframe || "1h",
        entryPrice: initialTrade.entryPrice?.toString() || "0",
        exitPrice: initialTrade.exitPrice?.toString() || "0",
        slPrice: initialTrade.slPrice?.toString() || "-1",
        tp1Price: initialTrade.tp1Price?.toString() || "",
        tp2Price: initialTrade.tp2Price?.toString() || "",
        tp3Price: initialTrade.tp3Price?.toString() || "",
        riskAmount: initialTrade.riskAmount?.toString() || "",
        tags: initialTrade.tags || [],
        // Remove notes from reset if not in schema
        notes: initialTrade.notes || '',
        confidenceRating: initialTrade.confidenceRating || 5,
        didHitBE: initialTrade.didHitBE || false,
        tpHitAfterBE: initialTrade.tpHitAfterBE || false,
        reversedAfterBE: initialTrade.reversedAfterBE || false,
        tpHit: initialTrade.tpHit || "none",
        slPips: initialTrade.slPips?.toString() || "0",
        session: initialTrade.session || '',
        entryType: initialTrade.entryType || '',
        obType: initialTrade.obType || '',
        marketStructure: initialTrade.marketStructure || '',
        liquidityContext: initialTrade.liquidityContext || '',
        exitReason: initialTrade.exitReason || '',
        slLogic: initialTrade.slLogic || '',
        tpLogic: initialTrade.tpLogic || '',
      });
    }
  }, [initialTrade, isEditing, form]);
  
  // Update the strategy ID in the form only if we're not in an account context
  useEffect(() => {
    // If in account context (initialAccountId provided), don't set a strategy
    if (initialAccountId) {
      form.setValue('accountId', initialAccountId);
      // Set default strategy to "none" for account context
      form.setValue('strategyId', "none");
    } 
    // Otherwise set strategy from initialStrategyId, URL param, or filter
    else if (initialStrategyId || strategyId || filters.strategy) {
      const currentStrategy = initialStrategyId || strategyId || filters.strategy;
      form.setValue('strategyId', currentStrategy);
    }
  }, [initialAccountId, initialStrategyId, strategyId, filters.strategy, form]);
  
  // Load last trade data to pre-fill form
  useEffect(() => {
    if (!isEditing && !initialTrade) {
      const savedTrade = localStorage.getItem('lastTradeData');
      if (savedTrade) {
        try {
          const lastTradeData = JSON.parse(savedTrade);
          // Only pre-fill specific fields, not all trade data
          form.setValue('instrument', lastTradeData.instrument || lastTradeData.pair || '');
          form.setValue('entryTimeframe', lastTradeData.entryTimeframe || '15m');
          form.setValue('htfTimeframe', lastTradeData.htfTimeframe || '1h');
          form.setValue('entryTimezone', lastTradeData.entryTimezone || 'America/New_York');
          form.setValue('exitTimezone', lastTradeData.exitTimezone || 'America/New_York');
          form.setValue('riskAmount', lastTradeData.riskAmount || '');
        } catch (e) {
          console.error("Error loading last trade data:", e);
        }
      }
    }
  }, [form, isEditing, initialTrade]);
  
  const onSubmit = async (values: TradeFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if all required fields are filled before proceeding
      if (!allRequiredFieldsFilled) {
        const missingFields = requiredFields.filter(field => {
          const value = values[field as keyof typeof values];
          if (field === 'entryDate') return value === undefined;
          return !value || value.toString().trim() === '';
        });
        
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      
      
      // Auto-generate tradeId if needed and not editing
      if (!values.tradeId && !isEditing) {
        const timestamp = new Date().getTime();
        const randomSuffix = Math.floor(Math.random() * 1000);
        values.tradeId = `T-${timestamp}-${randomSuffix}`;
      }
      
      // Set account ID if provided (account context)
      if (initialAccountId) {
        values.accountId = initialAccountId;
        
        // Only use strategy if it's not "none"
        if (values.strategyId === "none") {
          values.strategyId = undefined;
        }
        
        // Add "account" tag for trades from account page
        if (!values.tags.includes("account")) {
          values.tags = [...values.tags, "account"];
        }
      } 
      // Otherwise use strategy from context (strategy page)
      else {
        values.strategyId = initialStrategyId || strategyId || filters.strategy;
        
        // Add "backtest" tag for trades from strategy page
        if (!values.tags.includes("backtest")) {
          values.tags = [...values.tags, "backtest"];
        }
      }
      
      // Transform form values to trade data
      const tradeData = transformFormToTradeData(values);
      
      // Prepare data for saving (convert types as needed)
      const saveData = prepareTradeSave(tradeData);
      
      // Save the current trade data to localStorage for next trade
      localStorage.setItem('lastTradeData', JSON.stringify({
        instrument: values.instrument,
        entryTimeframe: values.entryTimeframe,
        htfTimeframe: values.htfTimeframe,
        entryTimezone: values.entryTimezone,
        exitTimezone: values.exitTimezone,
        riskAmount: values.riskAmount
      }));
      
      if (isEditing && initialTrade) {
        // Update existing trade - ensure required fields for Trade type are set
        await updateTrade({
          ...saveData,
          id: initialTrade.id, // Make sure to keep the original ID
          strategyId: saveData.strategyId === "none" ? undefined : saveData.strategyId, // Don't use "none" as strategy ID
          accountId: saveData.accountId || initialTrade.accountId, // Keep original account if not changing
          pair: saveData.pair || saveData.instrument || initialTrade.pair || "Unknown", // Ensure pair is always set
          tags: saveData.tags || initialTrade.tags || [] // Make sure tags are included
        } as Trade);
        toast.success("Trade updated successfully");
      } else {
        // Save new trade - ensure required fields for Trade type are set
        await addTrade({
          ...saveData,
          strategyId: saveData.strategyId === "none" ? undefined : saveData.strategyId, // Don't use "none" as strategy ID
          accountId: initialAccountId, // Include account ID if provided
          pair: saveData.pair || saveData.instrument || "Unknown", // Ensure pair is always set
          riskAmount: values.riskAmount, // Make sure risk amount is included
          tags: saveData.tags || [] // Make sure tags are included
        });
        
        // Clear form after successful submission
        form.reset({
          direction: "Long",
          entryTimeframe: "15m",
          htfTimeframe: "1h",
          entryTime: "00:00",
          exitTime: "00:00",
          entryTimezone: "America/New_York",
          exitTimezone: "America/New_York",
          tags: [],
          didHitBE: false,
          tpHitAfterBE: false,
          reversedAfterBE: false,
          tpHit: "none",
          confidenceRating: 5,
          entryPrice: "0",
          slPrice: "-1",
          tp1Price: "",
          tp2Price: "",
          tp3Price: "",
          riskAmount: values.riskAmount, // Keep the risk amount for next trade
          strategyId: values.strategyId, // Keep selected strategy
          instrument: values.instrument // Keep the instrument for next trade
        });
        toast.success("Trade added successfully");
      }
    } catch (error) {
      console.error("Error saving trade:", error);
      toast.error("Failed to save trade: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-black/20 border border-white/10 rounded-md p-1 w-full">
              <TabsTrigger 
                value="setup" 
                className="data-[state=active]:bg-trading-accent1 data-[state=active]:text-white text-sm font-medium py-2"
              >
                Trade Setup
              </TabsTrigger>
              <TabsTrigger 
                value="prices" 
                className="data-[state=active]:bg-trading-accent1 data-[state=active]:text-white text-sm font-medium py-2"
              >
                Price Levels
              </TabsTrigger>
              <TabsTrigger 
                value="strategy" 
                className="data-[state=active]:bg-trading-accent1 data-[state=active]:text-white text-sm font-medium py-2"
              >
                {initialAccountId ? "Strategy" : "Demon"}
              </TabsTrigger>
            </TabsList>
            
            <div className="min-h-[400px]">
              <TabsContent value="setup" className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                <TradeSetupTab />
              </TabsContent>
              
              <TabsContent value="prices" className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                <TradePricesTab />
              </TabsContent>
              
              <TabsContent value="strategy" className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                <TradeStrategyTab 
                  strategyType={initialAccountId ? 'live' : 'backtest'} 
                  isAccountContext={!!initialAccountId}
                  currentStrategyId={strategyId}
                />
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button 
              type="submit" 
              className={`transition-all duration-300 ${
                allRequiredFieldsFilled && isFormValid
                  ? "bg-gray-200 hover:bg-gray-300 shadow-lg shadow-gray-400/25 text-black font-semibold" 
                  : "bg-trading-accent1/50 hover:bg-trading-accent1/60 text-white/70"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Trade" : "Save Trade")}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default TradeEntryForm;
