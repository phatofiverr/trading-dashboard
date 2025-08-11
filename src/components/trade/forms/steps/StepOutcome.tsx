"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { RadioGroup } from "@/components/ui/radio-group";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CheckIcon, X } from "lucide-react";

export default function StepOutcome() {
  const form = useFormContext<TradeFormValues>();
  const [drawdownBeforeTP, setDrawdownBeforeTP] = useState<boolean | null>(null);
  
  const watchedValues = form.watch();
  const selectedOutcome = watchedValues.tpHit;

  return (
    <div className="space-y-6">
      {/* Title */}
      <h3 className="text-xl font-medium text-white">Trade Outcome</h3>
      
      {/* Outcome Grid */}
      <FormField
        control={form.control}
        name="tpHit"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                value={field.value || ""}
                onValueChange={field.onChange}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* Take Profit */}
                <div 
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${field.value === "TP" 
                      ? "border-green-500 bg-green-500/20" 
                      : "border-white/20 hover:border-white/40 bg-black/20"
                    }
                  `}
                  onClick={() => field.onChange("TP")}
                >
                  <div className="text-white font-medium text-lg mb-1">Take Profit</div>
                  <div className="text-white/60 text-sm">Hit target profit level</div>
                </div>

                {/* Stop Loss */}
                <div 
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${field.value === "SL" 
                      ? "border-red-500 bg-red-500/20" 
                      : "border-white/20 hover:border-white/40 bg-black/20"
                    }
                  `}
                  onClick={() => field.onChange("SL")}
                >
                  <div className="text-white font-medium text-lg mb-1">Stop Loss</div>
                  <div className="text-white/60 text-sm">Hit stop loss level</div>
                </div>

                {/* Breakeven */}
                <div 
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${field.value === "BE" 
                      ? "border-yellow-500 bg-yellow-500/20" 
                      : "border-white/20 hover:border-white/40 bg-black/20"
                    }
                  `}
                  onClick={() => field.onChange("BE")}
                >
                  <div className="text-white font-medium text-lg mb-1">Breakeven</div>
                  <div className="text-white/60 text-sm">Closed at entry price</div>
                </div>

                {/* Manual Close */}
                <div 
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${field.value === "Manual" 
                      ? "border-blue-500 bg-blue-500/20" 
                      : "border-white/20 hover:border-white/40 bg-black/20"
                    }
                  `}
                  onClick={() => field.onChange("Manual")}
                >
                  <div className="text-white font-medium text-lg mb-1">Manual Close</div>
                  <div className="text-white/60 text-sm">Closed before TP/SL hit</div>
                </div>

                {/* Partial */}
                <div 
                  className={`
                    col-span-1 sm:col-span-2 relative cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${field.value === "Partial" 
                      ? "border-purple-500 bg-purple-500/20" 
                      : "border-white/20 hover:border-white/40 bg-black/20"
                    }
                  `}
                  onClick={() => field.onChange("Partial")}
                >
                  <div className="text-white font-medium text-lg mb-1">Partial</div>
                  <div className="text-white/60 text-sm">Closed position in stages</div>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Conditional Follow-up for Take Profit */}
      {selectedOutcome === "TP" && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">During this profitable trade:</h4>
          
          <div className="space-y-3">
            <p className="text-white font-medium">Was there significant drawdown before hitting take profit?</p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={drawdownBeforeTP === true ? "default" : "outline"}
                onClick={() => setDrawdownBeforeTP(true)}
                className={`h-14 ${
                  drawdownBeforeTP === true 
                    ? "bg-green-600 text-white border-green-600" 
                    : "bg-black/30 text-white border-white/20 hover:bg-black/50"
                }`}
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Yes
              </Button>
              
              <Button
                type="button"
                variant={drawdownBeforeTP === false ? "default" : "outline"}
                onClick={() => setDrawdownBeforeTP(false)}
                className={`h-14 ${
                  drawdownBeforeTP === false 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-black/30 text-white border-white/20 hover:bg-black/50"
                }`}
              >
                <X className="h-5 w-5 mr-2" />
                No
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
