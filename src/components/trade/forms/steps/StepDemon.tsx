"use client";

import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useColors } from "@/hooks/useColors";
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
  const colors = useColors();
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
      <p className="text-sm" style={{ color: colors.text.secondary }}>
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
                      className="relative cursor-pointer rounded-lg border-2 p-4 transition-all"
                      style={isSelected
                        ? {
                            borderColor: colors.status.negative.primary,
                            backgroundColor: colors.status.negative.background
                          }
                        : {
                            borderColor: colors.border.muted,
                            backgroundColor: colors.background.glass
                          }
                      }
                      onClick={() => handleDemonSelection(option.value)}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
                          style={isSelected
                            ? {
                                borderColor: colors.status.negative.primary,
                                backgroundColor: colors.status.negative.primary
                              }
                            : {
                                borderColor: colors.border.input
                              }
                          }
                        >
                          {isSelected && (
                            <div className="w-full h-full rounded-full bg-white transform scale-50" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4 flex-shrink-0" style={{ color: colors.text.secondary }} />
                            <div className="font-medium text-base" style={{ color: colors.text.primary }}>
                              {option.label}
                            </div>
                            <div className="text-sm" style={{ color: colors.text.secondary }}>
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
        <div 
          className="rounded-lg border p-4"
          style={{ 
            backgroundColor: colors.status.negative.background,
            borderColor: colors.status.negative.border 
          }}
        >
          <h4 className="font-medium mb-2" style={{ color: colors.text.primary }}>Selected Demons ({watchedDemonTags.length}):</h4>
          <div className="flex flex-wrap gap-2">
            {watchedDemonTags.map((tag) => {
              const option = DEMON_OPTIONS.find(opt => opt.value === tag);
              return (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: colors.status.negative.background,
                    color: colors.status.negative.primary
                  }}
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