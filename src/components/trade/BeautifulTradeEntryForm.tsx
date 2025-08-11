import React, { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTradeStore } from '@/hooks/useTradeStore';
import { tradeFormSchema, TradeFormValues } from './schemas/tradeFormSchema';
import { transformFormToTradeData, prepareTradeSave } from './utils/tradeDataTransformer';
import { useParams } from 'react-router-dom';
import { Trade } from '@/types/Trade';
import { TradeEntryFormProps } from './TradeEntryFormProps';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { X } from 'lucide-react';

// Import stepper components
import FormStepper from './forms/FormStepper';
import FormButtons from './forms/FormButtons';

// Import step components
import StepContext from './forms/steps/StepContext';
import StepStrategy from './forms/steps/StepStrategy';
import StepOutcome from './forms/steps/StepOutcome';
import StepReview from './forms/steps/StepReview';

interface BeautifulTradeEntryFormProps extends TradeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const BeautifulTradeEntryForm: React.FC<BeautifulTradeEntryFormProps> = ({ 
  initialTrade, 
  isEditing = false, 
  initialAccountId, 
  initialStrategyId,
  isOpen,
  onClose
}) => {
  const { addTrade, updateTrade, filters } = useTradeStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { strategyId } = useParams<{ strategyId: string }>();
  
  const totalSteps = 4;

  // Initialize form with default values
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      // Required fields
      instrument: "",
      entryPrice: "",
      exitPrice: "",
      slPrice: "",
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
      tpHit: undefined,
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
      strategyId: initialStrategyId || (initialAccountId ? "none" : (strategyId || filters.strategy)) || "",
      accountId: initialAccountId || "",
      // Pip/Price mode preferences
      stopLossInPips: true,
      takeProfitInPips: true
    },
  });

  // Watch specific fields needed for validation to avoid infinite renders
  const instrument = form.watch("instrument");
  const entryDate = form.watch("entryDate");
  const entryTime = form.watch("entryTime");
  const entryTimeframe = form.watch("entryTimeframe");
  const entryPrice = form.watch("entryPrice");
  const exitPrice = form.watch("exitPrice");
  const slPrice = form.watch("slPrice");
  const riskAmount = form.watch("riskAmount");
  const tpHit = form.watch("tpHit");
  
  // Step validation with memoization to prevent infinite renders
  const isStepValid = useMemo(() => {
    let isValid = false;
    
    switch (currentStep) {
      case 0: // Context
        isValid = !!(instrument && 
                  entryDate && 
                  entryTime && 
                  entryTimeframe);
        break;
      case 1: // Strategy
        isValid = !!(entryPrice && 
                  exitPrice && 
                  slPrice && 
                  riskAmount &&
                  parseFloat(entryPrice) > 0 &&
                  parseFloat(exitPrice) > 0 &&
                  parseFloat(riskAmount) > 0);
        break;
      case 2: // Outcome
        isValid = tpHit !== undefined;
        break;
      case 3: // Review
        isValid = true; // All fields optional
        break;
      default:
        isValid = false;
    }
    
    return isValid;
  }, [currentStep, instrument, entryDate, entryTime, entryTimeframe, entryPrice, exitPrice, slPrice, riskAmount, tpHit]);

  const handleNextStep = () => {
    console.log("handleNextStep called", { currentStep, totalSteps, condition: currentStep < totalSteps - 1 });
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      console.log("Moving to step:", currentStep + 1);
    } else {
      console.log("Already at last step, not moving");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepContext />;
      case 1:
        return <StepStrategy />;
      case 2:
        return <StepOutcome />;
      case 3:
        return <StepReview />;
      default:
        return <StepContext />;
    }
  };

  const onSubmit = async (values: TradeFormValues) => {
    console.log("onSubmit called with values:", values);
    console.log("Current step when submitting:", currentStep);
    console.trace("onSubmit call stack");
    
    // Prevent auto-submission - only allow submission on the last step
    if (currentStep !== totalSteps - 1) {
      console.log("Preventing submission - not on last step");
      return;
    }
    try {
      setIsSubmitting(true);
      
      // Auto-generate tradeId if needed and not editing
      if (!values.tradeId && !isEditing) {
        const timestamp = new Date().getTime();
        const randomSuffix = Math.floor(Math.random() * 1000);
        values.tradeId = `T-${timestamp}-${randomSuffix}`;
      }
      
      // Set account ID if provided (account context)
      if (initialAccountId) {
        values.accountId = initialAccountId;
        
        if (values.strategyId === "none") {
          values.strategyId = undefined;
        }
        
        if (!values.tags.includes("account")) {
          values.tags = [...values.tags, "account"];
        }
      } else {
        values.strategyId = initialStrategyId || strategyId || filters.strategy;
        
        if (!values.tags.includes("backtest")) {
          values.tags = [...values.tags, "backtest"];
        }
      }
      
      // Transform form values to trade data
      const tradeData = transformFormToTradeData(values);
      
      // Prepare data for saving
      const saveData = prepareTradeSave(tradeData);
      
      if (isEditing && initialTrade) {
        await updateTrade({
          ...saveData,
          id: initialTrade.id,
          strategyId: saveData.strategyId === "none" ? undefined : saveData.strategyId,
          accountId: saveData.accountId || initialTrade.accountId,
          pair: saveData.pair || saveData.instrument || initialTrade.pair || "Unknown",
          tags: saveData.tags || initialTrade.tags || []
        } as Trade);
        toast.success("Trade updated successfully");
      } else {
        await addTrade({
          ...saveData,
          strategyId: saveData.strategyId === "none" ? undefined : saveData.strategyId,
          accountId: initialAccountId,
          pair: saveData.pair || saveData.instrument || "Unknown",
          riskAmount: values.riskAmount,
          tags: saveData.tags || []
        });
        toast.success("Trade added successfully");
      }
      
      onClose();
      
    } catch (error) {
      console.error("Error saving trade:", error);
      toast.error("Failed to save trade: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-0 sm:p-2">
      <div className="bg-[#0A0A0A] border border-gray-600/30 rounded-none sm:rounded-lg w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col backdrop-blur-sm">
        {/* Header with Stepper */}
        <div className="p-4 sm:p-3 border-b border-gray-600/20 shrink-0 bg-[#0A0A0A]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <FormStepper currentStep={currentStep} setCurrentStep={setCurrentStep} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 ml-4"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
              
              {/* Content */}
              <div className="flex-1 px-4 py-4 sm:px-3 sm:py-2 overflow-y-auto min-h-0">
                <div className="min-h-full">
                  {renderStep()}
                </div>
              </div>
              
              {/* Footer with buttons */}
              <div className="p-4 sm:p-3 sm:pt-2 border-t border-gray-600/20 shrink-0 bg-[#0A0A0A] safe-area-padding-bottom">
                <FormButtons
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onPrevStep={handlePrevStep}
                  onNextStep={handleNextStep}
                  onComplete={form.handleSubmit(onSubmit)}
                  isStepValid={isStepValid}
                  isSubmitting={isSubmitting}
                />
              </div>
            </form>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
};

export default BeautifulTradeEntryForm;
