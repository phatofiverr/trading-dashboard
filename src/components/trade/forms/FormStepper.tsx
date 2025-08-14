"use client";

import { cn } from "@/lib/utils";

const steps = [
  { name: "Context" },
  { name: "Strategy" },
  { name: "Demon" },
  { name: "Review" },
];

interface FormStepperProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export default function FormStepper({ currentStep, setCurrentStep }: FormStepperProps) {
  return (
    <nav aria-label="Progress" className="relative">
      {/* Background beam that slides */}
      <div 
        className="absolute h-8 bg-trading-accent1/20 rounded-lg transition-all duration-500 ease-out"
        style={{
          left: `${(currentStep / (steps.length - 1)) * 75}%`,
          width: '25%',
          transform: 'translateX(0)',
          top: '-4px'
        }}
      />
      
      {/* Step labels */}
      <ol className="relative flex justify-between w-full">
        {steps.map((step, index) => (
          <li
            key={step.name}
            className="flex-1 text-center"
          >
            <button
              onClick={() => setCurrentStep(index)}
              className={cn(
                "px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium transition-all duration-300",
                "hover:text-white focus-visible:outline-none",
                currentStep === index
                  ? "text-white font-semibold scale-105"
                  : currentStep > index
                  ? "text-white/80"
                  : "text-white/60"
              )}
            >
              <span className="hidden sm:inline">{step.name}</span>
              <span className="sm:hidden">{step.name.substring(0, 3)}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
