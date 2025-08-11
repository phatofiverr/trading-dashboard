"use client";

import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { entryTimeframes, timeZones } from "../../constants/formConstants";
import { detectSession } from "../../utils/sessionDetector";
import DateTimeInput from "../DateTimeInput";
import SessionDisplay from "../../SessionDisplay";
import CustomInstrumentSelect from "../../CustomInstrumentSelect";

export default function StepContext() {
  const form = useFormContext<TradeFormValues>();

  // Auto-detect session when time or timezone changes
  const entryTime = form.watch('entryTime');
  const entryTimezone = form.watch('entryTimezone');
  const entryTimeframe = form.watch('entryTimeframe');
  const currentSession = form.watch('session');
  
  // Debug logging
  console.log('StepContext - entryTimeframe:', entryTimeframe);
  
  const detectedSession = useMemo(() => {
    if (entryTime && entryTimezone) {
      return detectSession(entryTime, entryTimezone);
    }
    return 'Unknown';
  }, [entryTime, entryTimezone]);
  
  useEffect(() => {
    if (entryTime && entryTimezone && detectedSession !== 'Unknown' && detectedSession !== currentSession) {
      form.setValue('session', detectedSession);
    }
  }, [detectedSession, entryTime, entryTimezone, currentSession]);

  return (
    <div className="space-y-6">
      {/* First Row: Instrument and Timezone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="instrument"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/80">Instrument</FormLabel>
              <FormControl>
                <CustomInstrumentSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select or add instrument"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entryTimezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/80">Time Zone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-black/20 border-white/10">
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-80">
                  {timeZones.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Direction */}
      <FormField
        control={form.control}
        name="direction"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-white/80">Direction</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`
                  cursor-pointer rounded-md border p-2 transition-colors text-center
                  ${field.value === "Long" 
                    ? "border-green-500 bg-green-100/10 text-green-400" 
                    : "border-white/10 hover:bg-white/5"
                  }
                `}
                onClick={() => field.onChange("Long")}
              >
                <span className="text-sm font-medium">Long</span>
              </div>
              <div 
                className={`
                  cursor-pointer rounded-md border p-2 transition-colors text-center
                  ${field.value === "Short" 
                    ? "border-red-500 bg-red-100/10 text-red-400" 
                    : "border-white/10 hover:bg-white/5"
                  }
                `}
                onClick={() => field.onChange("Short")}
              >
                <span className="text-sm font-medium">Short</span>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Entry and Exit DateTime */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateTimeInput
          dateFieldName="entryDate"
          timeFieldName="entryTime"
          label="Entry Date & Time"
        />
        
        <DateTimeInput
          dateFieldName="exitDate"
          timeFieldName="exitTime"
          label="Exit Date & Time"
        />
      </div>

      {/* Entry Timeframe */}
      <FormField
        control={form.control}
        name="entryTimeframe"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/80">Entry Timeframe</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {entryTimeframes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Trading Session Display */}
      <SessionDisplay 
        entryTime={form.watch('entryTime')}
        entryTimezone={form.watch('entryTimezone')}
        session={form.watch('session')}
      />


    </div>
  );
}
