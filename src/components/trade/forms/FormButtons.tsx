"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface FormButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onComplete: () => void;
  isStepValid: boolean;
  isSubmitting?: boolean;
}

export default function FormButtons({ 
  currentStep, 
  totalSteps, 
  onPrevStep, 
  onNextStep, 
  onComplete, 
  isStepValid,
  isSubmitting = false 
}: FormButtonsProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  // console.log("FormButtons render:", { currentStep, totalSteps, isFirstStep, isLastStep });

  return (
    <div className="flex justify-between items-center w-full gap-4">
      <div className="flex-1">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevStep}
            className="w-full sm:w-auto bg-black/20 border-white/20 text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
            <span className="sm:hidden">Back</span>
          </Button>
        )}
      </div>

      <div className="flex-1 flex justify-end">
        {!isLastStep ? (
          <Button
            type="button"
            onClick={() => {
              console.log("Next button clicked", { currentStep, totalSteps, isLastStep, isStepValid });
              onNextStep();
            }}
            disabled={!isStepValid}
            className={`w-full sm:w-auto transition-all duration-300 ${
              isStepValid
                ? "bg-trading-accent1 hover:bg-trading-accent1/90 text-white"
                : "bg-trading-accent1/50 text-white/70"
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button"
            onClick={() => {
              console.log("Complete Trade button clicked", { isStepValid, isSubmitting });
              if (!isStepValid) {
                console.log("Step not valid - Complete Trade button should be disabled");
                return;
              }
              console.log("About to call onComplete...");
              onComplete();
              console.log("onComplete called successfully");
            }}
            disabled={!isStepValid || isSubmitting}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            <span className="hidden sm:inline">{isSubmitting ? "Saving..." : "Complete Trade"}</span>
            <span className="sm:hidden">{isSubmitting ? "Saving..." : "Complete"}</span>
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
