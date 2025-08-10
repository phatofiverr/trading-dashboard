"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-2 gap-4"
              >
                {/* Take Profit */}
                <div className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all
                  ${field.value === "tp1" 
                    ? "border-green-500 bg-green-500/20" 
                    : "border-white/20 hover:border-white/40 bg-black/20"
                  }
                `}>
                  <RadioGroupItem 
                    value="tp1" 
                    id="outcome-tp" 
                    className="absolute right-4 top-4" 
                  />
                  <Label htmlFor="outcome-tp" className="cursor-pointer">
                    <div className="text-white font-medium text-lg mb-1">Take Profit</div>
                    <div className="text-white/60 text-sm">Hit target profit level</div>
                  </Label>
                </div>

                {/* Stop Loss */}
                <div className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all
                  ${field.value === "none" 
                    ? "border-red-500 bg-red-500/20" 
                    : "border-white/20 hover:border-white/40 bg-black/20"
                  }
                `}>
                  <RadioGroupItem 
                    value="none" 
                    id="outcome-sl" 
                    className="absolute right-4 top-4" 
                  />
                  <Label htmlFor="outcome-sl" className="cursor-pointer">
                    <div className="text-white font-medium text-lg mb-1">Stop Loss</div>
                    <div className="text-white/60 text-sm">Hit stop loss level</div>
                  </Label>
                </div>

                {/* Breakeven */}
                <div className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all
                  ${field.value === "breakeven" 
                    ? "border-yellow-500 bg-yellow-500/20" 
                    : "border-white/20 hover:border-white/40 bg-black/20"
                  }
                `}>
                  <RadioGroupItem 
                    value="breakeven" 
                    id="outcome-be" 
                    className="absolute right-4 top-4" 
                  />
                  <Label htmlFor="outcome-be" className="cursor-pointer">
                    <div className="text-white font-medium text-lg mb-1">Breakeven</div>
                    <div className="text-white/60 text-sm">Closed at entry price</div>
                  </Label>
                </div>

                {/* Manual Close */}
                <div className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all
                  ${field.value === "manual" 
                    ? "border-blue-500 bg-blue-500/20" 
                    : "border-white/20 hover:border-white/40 bg-black/20"
                  }
                `}>
                  <RadioGroupItem 
                    value="manual" 
                    id="outcome-manual" 
                    className="absolute right-4 top-4" 
                  />
                  <Label htmlFor="outcome-manual" className="cursor-pointer">
                    <div className="text-white font-medium text-lg mb-1">Manual Close</div>
                    <div className="text-white/60 text-sm">Closed before TP/SL hit</div>
                  </Label>
                </div>

                {/* Partial */}
                <div className={`
                  col-span-2 relative cursor-pointer rounded-lg border-2 p-4 transition-all
                  ${field.value === "partial" 
                    ? "border-purple-500 bg-purple-500/20" 
                    : "border-white/20 hover:border-white/40 bg-black/20"
                  }
                `}>
                  <RadioGroupItem 
                    value="partial" 
                    id="outcome-partial" 
                    className="absolute right-4 top-4" 
                  />
                  <Label htmlFor="outcome-partial" className="cursor-pointer">
                    <div className="text-white font-medium text-lg mb-1">Partial</div>
                    <div className="text-white/60 text-sm">Closed position in stages</div>
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Conditional Follow-up for Take Profit */}
      {selectedOutcome === "tp1" && (
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
