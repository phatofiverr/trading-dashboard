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
    <div className="flex justify-between w-full">
      <div>
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevStep}
            className="mr-2 bg-black/20 border-white/20 text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      <div>
        {!isLastStep ? (
          <Button
            type="button"
            onClick={() => {
              console.log("Next button clicked", { currentStep, totalSteps, isLastStep, isStepValid });
              onNextStep();
            }}
            disabled={!isStepValid}
            className={`transition-all duration-300 ${
              isStepValid
                ? "bg-trading-accent1 hover:bg-trading-accent1/90 text-white"
                : "bg-trading-accent1/50 text-white/70"
            }`}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button"
            onClick={() => {
              console.log("Complete Trade button clicked", { isStepValid, isSubmitting });
              onComplete();
            }}
            disabled={!isStepValid || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? "Saving..." : "Complete Trade"}
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
