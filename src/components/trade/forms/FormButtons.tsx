"use client";

import { Button } from "@/components/ui/button";
import { useColors } from "@/hooks/useColors";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface FormButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onComplete: () => void;
  isStepValid: boolean;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function FormButtons({ 
  currentStep, 
  totalSteps, 
  onPrevStep, 
  onNextStep, 
  onComplete, 
  isStepValid,
  isSubmitting = false,
  isEditing = false 
}: FormButtonsProps) {
  const colors = useColors();
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
            className="w-full sm:w-auto"
            style={{
              backgroundColor: colors.background.glass,
              borderColor: colors.border.muted,
              color: colors.text.secondary,
              '--hover-bg-color': colors.background.muted
            }}
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
            className="w-full sm:w-auto transition-all duration-300"
            style={isStepValid
              ? {
                  backgroundColor: colors.accent.primary,
                  color: colors.text.primary,
                  '--hover-bg-color': colors.accent.secondary
                }
              : {
                  backgroundColor: colors.accent.muted,
                  color: colors.text.disabled
                }
            }
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
            className="w-full sm:w-auto"
            style={{
              backgroundColor: colors.status.positive.primary,
              color: colors.text.primary,
              '--hover-bg-color': colors.status.positive.secondary,
              opacity: (!isStepValid || isSubmitting) ? 0.6 : 1
            }}
          >
            <span className="hidden sm:inline">{isSubmitting ? "Saving..." : (isEditing ? "Update Trade" : "Complete Trade")}</span>
            <span className="sm:hidden">{isSubmitting ? "Saving..." : (isEditing ? "Update" : "Complete")}</span>
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
