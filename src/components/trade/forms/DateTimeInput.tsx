"use client";

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { TradeFormValues } from '../schemas/tradeFormSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar, Clock } from 'lucide-react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { getDefaultTradeDate } from '@/lib/dateUtils';

interface DateTimeInputProps {
  dateFieldName: keyof TradeFormValues;
  timeFieldName: keyof TradeFormValues;
  label: string;
  className?: string;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  dateFieldName,
  timeFieldName,
  label,
  className = ""
}) => {
  const form = useFormContext<TradeFormValues>();
  const { lastEntryDate } = useTradeStore();

  // Initialize default values
  useEffect(() => {
    const currentDate = form.getValues(dateFieldName) as Date | undefined;
    const currentTime = form.getValues(timeFieldName) as string;
    
    // Set default date if not already set
    if (!currentDate) {
      const defaultDate = getDefaultTradeDate(lastEntryDate);
      form.setValue(dateFieldName as any, defaultDate, { shouldValidate: false });
    }
    
    // Set default time if not already set
    if (!currentTime) {
      form.setValue(timeFieldName as any, "00:00", { shouldValidate: false });
    }
    
    // For exit date, default to same as entry date if not set
    if (dateFieldName === 'exitDate' && !currentDate) {
      const entryDate = form.getValues('entryDate') as Date | undefined;
      if (entryDate) {
        form.setValue(dateFieldName as any, entryDate, { shouldValidate: false });
      }
    }
  }, [dateFieldName, timeFieldName, form, lastEntryDate, form.watch('entryDate')]);

  // Convert separate date and time to datetime-local format
  const combineDateTimeForInput = (date: Date | undefined, time: string): string => {
    if (!date) return '';
    
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    
    // Ensure time is in HH:MM format, default to 00:00 if empty
    const timeStr = time && time.length === 5 ? time : '00:00';
    
    return `${dateStr}T${timeStr}`;
  };

  // Split datetime-local value back to separate date and time
  const splitDateTimeValue = (datetimeValue: string) => {
    if (!datetimeValue) return { date: undefined, time: '' };
    
    const [dateStr, timeStr] = datetimeValue.split('T');
    const date = new Date(dateStr + 'T00:00:00'); // Create date at midnight to avoid timezone issues
    
    return {
      date,
      time: timeStr || '00:00'
    };
  };

  // Get current combined value
  const currentDate = form.watch(dateFieldName) as Date | undefined;
  const currentTime = form.watch(timeFieldName) as string;
  const currentValue = combineDateTimeForInput(currentDate, currentTime);

  const handleDateTimeChange = (value: string) => {
    const { date, time } = splitDateTimeValue(value);
    
    // Update both fields
    if (date) {
      form.setValue(dateFieldName as any, date, { shouldValidate: true });
    }
    form.setValue(timeFieldName as any, time, { shouldValidate: true });
  };

  return (
    <div className={`w-full min-w-0 flex-1 ${className}`}>
      <FormLabel className="text-white/80">{label}</FormLabel>
      <div className="relative mt-2 w-full">
        <Input
          type="datetime-local"
          value={currentValue}
          onChange={(e) => handleDateTimeChange(e.target.value)}
          style={{ width: '100%' }}
          className="bg-black/20 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>
      
      {/* Show validation errors for both fields */}
      <FormField
        control={form.control}
        name={dateFieldName}
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={timeFieldName}
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DateTimeInput;
