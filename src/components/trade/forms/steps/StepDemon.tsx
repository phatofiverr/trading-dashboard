"use client";

import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { 
  Clock, 
  Timer, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Target, 
  TrendingUp, 
  SkipForward 
} from "lucide-react";

const DEMON_OPTIONS = [
  { 
    value: "entered-too-soon", 
    label: "Entered too soon:", 
    description: "Entered position before proper setup",
    icon: Clock
  },
  { 
    value: "entered-too-late", 
    label: "Entered too late:", 
    description: "Missed optimal entry point",
    icon: Timer
  },
  { 
    value: "exited-too-soon", 
    label: "Exited too soon:", 
    description: "Closed position prematurely",
    icon: XCircle
  },
  { 
    value: "exited-too-late", 
    label: "Exited too late:", 
    description: "Held position too long",
    icon: AlertCircle
  },
  { 
    value: "not-in-trading-plan", 
    label: "Not in trading plan:", 
    description: "Trade didn't follow planned strategy",
    icon: FileText
  },
  { 
    value: "incorrect-stop-placement", 
    label: "Incorrect stop placement:", 
    description: "Stop loss positioned incorrectly",
    icon: Target
  },
  { 
    value: "wrong-size-trade", 
    label: "Wrong size trade:", 
    description: "Incorrect position sizing",
    icon: TrendingUp
  },
  { 
    value: "didnt-take-planned-trade", 
    label: "Didn't take planned trade:", 
    description: "Missed a planned trading opportunity",
    icon: SkipForward
  },
];

export default function StepDemon() {
  const form = useFormContext<TradeFormValues>();
  const watchedDemonTags = form.watch("demonTags") || [];

  const handleDemonSelection = (value: string) => {
    const currentTags = watchedDemonTags;
    const isSelected = currentTags.includes(value);
    
    if (isSelected) {
      // Remove the tag
      form.setValue("demonTags", currentTags.filter(tag => tag !== value));
    } else {
      // Add the tag
      form.setValue("demonTags", [...currentTags, value]);
    }
  };

  return (
    <div className="h-[60vh] overflow-y-auto space-y-3 pr-2">
      
      {/* Description */}
      <p className="text-white/60 text-sm">
        Select any trading demons that affected this trade
      </p>
      
      {/* Demon Options */}
      <FormField
        control={form.control}
        name="demonTags"
        render={() => (
          <FormItem>
            <FormControl>
              <div className="max-h-85 overflow-y-auto space-y-3 pr-2">
                {DEMON_OPTIONS.map((option) => {
                  const isSelected = watchedDemonTags.includes(option.value);
                  
                  return (
                    <div 
                      key={option.value}
                      className={`
                        relative cursor-pointer rounded-lg border-2 p-4 transition-all
                        ${isSelected
                          ? "border-red-500 bg-red-500/20" 
                          : "border-white/20 hover:border-white/40 bg-black/20"
                        }
                      `}
                      onClick={() => handleDemonSelection(option.value)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`
                          mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all
                          ${isSelected 
                            ? "border-red-500 bg-red-500" 
                            : "border-white/40"
                          }
                        `}>
                          {isSelected && (
                            <div className="w-full h-full rounded-full bg-white transform scale-50" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4 text-white/80 flex-shrink-0" />
                            <div className="text-white font-medium text-base">
                              {option.label}
                            </div>
                            <div className="text-white/60 text-sm">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Selected demons summary */}
      {watchedDemonTags.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Selected Demons ({watchedDemonTags.length}):</h4>
          <div className="flex flex-wrap gap-2">
            {watchedDemonTags.map((tag) => {
              const option = DEMON_OPTIONS.find(opt => opt.value === tag);
              return (
                <span
                  key={tag}
                  className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
                >
                  {option?.label || tag}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}