import React, { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { tradeFormSchema, TradeFormValues } from './schemas/tradeFormSchema';
import { transformFormToTradeData, prepareTradeSave } from './utils/tradeDataTransformer';
import { Trade } from '@/types/Trade';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { X } from 'lucide-react';

// Import stepper components
import FormStepper from './forms/FormStepper';
import FormButtons from './forms/FormButtons';

// Import step components
import StepContext from './forms/steps/StepContext';
import StepLevels from './forms/steps/StepLevels';
import StepStrategy from './forms/steps/StepStrategy';
import StepDemon from './forms/steps/StepDemon';
import StepReview from './forms/steps/StepReview';

interface MultiAccountTradeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultiAccountTradeEntryForm: React.FC<MultiAccountTradeEntryFormProps> = ({
  isOpen,
  onClose
}) => {
  const { addTrade } = useTradeStore();
  const { accounts } = useAccountsStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;

  // Initialize form with default values
  const getDefaultValues = (): TradeFormValues => {
    return {
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
      demonTags: [],
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
      strategyId: "Multi-Account",
      accountId: "", // Will be set per account during submission
      // Chart analysis for screenshots and notes
      chartAnalysis: [],
      // Pip/Price mode preferences
      stopLossInPips: true,
      takeProfitInPips: true,
      confluenceChecks: [],
      setupQuality: 0
    };
  };

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: getDefaultValues(),
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
  const demonTags = form.watch("demonTags");

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
      case 1: // Levels
        isValid = !!(entryPrice &&
                  exitPrice &&
                  slPrice &&
                  riskAmount &&
                  parseFloat(entryPrice) > 0 &&
                  parseFloat(exitPrice) > 0 &&
                  parseFloat(riskAmount) > 0);
        break;

      case 2: //strategy
        isValid = true;
      case 3: // Demon
        isValid = true; // Demon tags are optional, so step is always valid
        break;
      case 4: // Review
        isValid = true; // All fields optional - chart screenshots and notes are optional
        break;
      default:
        isValid = false;
    }

    return isValid;
  }, [currentStep, instrument, entryDate, entryTime, entryTimeframe, entryPrice, exitPrice, slPrice, riskAmount, demonTags]);

  // Function to get validation error message for current step
  const getValidationErrorMessage = (step: number) => {
    switch (step) {
      case 0: // Context
        if (!instrument) return "Please select an instrument";
        if (!entryDate) return "Please select an entry date";
        if (!entryTime) return "Please select an entry time";
        if (!entryTimeframe) return "Please select an entry timeframe";
        return "";
      case 1: // Strategy
        if (!entryPrice) return "Please enter an entry price";
        if (!exitPrice) return "Please enter an exit price";
        if (!slPrice) return "Please enter a stop loss price";
        if (!riskAmount) return "Please enter a risk amount";
        if (parseFloat(entryPrice) <= 0) return "Entry price must be greater than 0";
        if (parseFloat(exitPrice) <= 0) return "Exit price must be greater than 0";
        if (parseFloat(riskAmount) <= 0) return "Risk amount must be greater than 0";
        return "";
      case 2: // Demon
        return ""; // Always valid
      case 3: // Review
        return ""; // Always valid
      default:
        return "Unknown validation error";
    }
  };

  const handleNextStep = () => {
    console.log("handleNextStep called", { currentStep, totalSteps, condition: currentStep < totalSteps - 1 });

    // Check validation before moving to next step
    if (!isStepValid) {
      const errorMessage = getValidationErrorMessage(currentStep);
      toast.error(errorMessage || "Please complete all required fields");
      return;
    }

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
        return <StepLevels />;
      case 2:
        return <StepStrategy />;
      case 3:
        return <StepDemon />;
      case 4:
        return <StepReview />;
      default:
        return <StepContext />;
    }
  };

  const onSubmit = async (values: TradeFormValues) => {
    console.log("Multi-account onSubmit called with values:", values);
    console.log("Current step when submitting:", currentStep);

    // Prevent auto-submission - only allow submission on the last step
    if (currentStep !== totalSteps - 1) {
      console.log("Preventing submission - not on last step");
      return;
    }

    // Check if there are accounts available
    if (!accounts || accounts.length === 0) {
      toast.error("No trading accounts available. Please create an account first.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Auto-generate base tradeId if needed
      const timestamp = new Date().getTime();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const baseTradeId = values.tradeId || `MA-${timestamp}-${randomSuffix}`;

      // Transform form values to trade data
      const tradeData = transformFormToTradeData(values);

      // Prepare data for saving
      const saveData = prepareTradeSave(tradeData);

      console.log('Original form values:', values);
      console.log('Transformed trade data:', tradeData);
      console.log('Prepared save data:', saveData);

      // Create trades for each account
      const createdTrades: Trade[] = [];
      const failedAccounts: string[] = [];

      // Validate that we have the minimum required data
      if (!saveData.instrument || !saveData.entryPrice || !saveData.exitPrice) {
        toast.error("Missing required trade data. Please ensure instrument, entry price, and exit price are provided.");
        setIsSubmitting(false);
        return;
      }

      for (const account of accounts) {
        try {
          // Generate unique tradeId for each account to avoid database constraint violations
          const accountSpecificTradeId = `MA-${timestamp}-${randomSuffix}-${account.id}`;

          const accountTradeData = {
            ...saveData,
            tradeId: accountSpecificTradeId, // Override with account-specific ID
            accountId: account.id,
            pair: saveData.pair || saveData.instrument || "Unknown",
            tags: [...(saveData.tags || []), "multi-account"],
            riskAmount: values.riskAmount,
            strategyId: "none", // Don't create a "Multi-Account" strategy
            // Ensure required fields are present with proper types
            instrument: saveData.instrument || values.instrument || "Unknown",
            direction: saveData.direction || "long",
            entryDate: saveData.entryDate || new Date().toISOString(),
            exitDate: saveData.exitDate || new Date().toISOString(),
            // Ensure numeric fields are properly converted
            entryPrice: typeof saveData.entryPrice === 'string' ? parseFloat(saveData.entryPrice) || 0 : saveData.entryPrice || 0,
            exitPrice: typeof saveData.exitPrice === 'string' ? parseFloat(saveData.exitPrice) || 0 : saveData.exitPrice || 0,
            slPrice: typeof saveData.slPrice === 'string' ? parseFloat(saveData.slPrice) || 0 : saveData.slPrice || 0,
            // Add missing required fields for Trade interface
            notes: saveData.notes || "",
            setup: saveData.setup || "",
            timeframe: saveData.timeframe || "",
            stopLoss: typeof saveData.stopLoss === 'string' ? parseFloat(saveData.stopLoss) || 0 : saveData.stopLoss || 0,
            targetPrice: typeof saveData.targetPrice === 'string' ? parseFloat(saveData.targetPrice) || 0 : saveData.targetPrice || 0,
            size: typeof saveData.size === 'string' ? parseFloat(saveData.size) || 0 : saveData.size || 0,
            drawdown: typeof saveData.drawdown === 'string' ? parseFloat(saveData.drawdown) || 0 : saveData.drawdown || 0,
            confluences: saveData.confluences || [],
            images: saveData.images || [],
            outcome: saveData.outcome || "breakeven",
            rMultiple: typeof saveData.rMultiple === 'string' ? parseFloat(saveData.rMultiple) || 0 : saveData.rMultiple || 0,
            percentageGainLoss: typeof saveData.percentageGainLoss === 'string' ? parseFloat(saveData.percentageGainLoss) || 0 : saveData.percentageGainLoss || 0
          };

          console.log(`Creating trade for account ${account.name} (${account.id}):`, accountTradeData);

          const createdTrade = await addTrade(accountTradeData);
          if (createdTrade) {
            createdTrades.push(createdTrade as Trade);
            console.log(`Successfully created trade for account ${account.name}`);
          }
        } catch (error) {
          console.error(`Failed to create trade for account ${account.name}:`, error);
          console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
          failedAccounts.push(account.name);
        }
      }

      // Show success message
      const successCount = createdTrades.length;
      const failureCount = failedAccounts.length;

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} trades across ${accounts.length} accounts`);

        if (failureCount > 0) {
          toast.warning(`Failed to create trades for: ${failedAccounts.join(', ')}`);
        }
      } else {
        toast.error("Failed to create any trades");
      }

      onClose();

    } catch (error) {
      console.error("Error creating multi-account trades:", error);
      toast.error("Failed to create trades: " + (error instanceof Error ? error.message : "Unknown error"));
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
          <div className="mt-2 text-center">
            {/* <h2 className="text-lg font-semibold text-white">Multi-Account Trade Entry</h2> */}
            <p className="text-sm text-gray-400">This trade will be created for all {accounts.length} accounts</p>
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
                  onComplete={form.handleSubmit(onSubmit, (errors) => {
                    console.error("Form validation errors:", errors);
                    console.error("Form values at submission:", form.getValues());

                    // Show toast for the first validation error
                    const errorFields = Object.keys(errors);
                    if (errorFields.length > 0) {
                      const firstField = errorFields[0];
                      const firstError = errors[firstField];
                      const errorMessage = firstError?.message || `Please check ${firstField}`;
                      toast.error(`Validation Error: ${errorMessage}`);
                    } else {
                      toast.error("Please complete all required fields before submitting");
                    }
                  })}
                  isStepValid={isStepValid}
                  isSubmitting={isSubmitting}
                  isEditing={false}
                />
              </div>
            </form>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
};

export default MultiAccountTradeEntryForm;
