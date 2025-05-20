
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { TradeFormValues } from '../schemas/tradeFormSchema';
import { FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTradeStore } from '@/hooks/useTradeStore';
import { getDefaultTradeDate } from '@/lib/dateUtils';

// Function to format a date as YYYY-MM-DD for consistent handling
const formatDateValue = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

interface DateFieldsRowProps {
  className?: string;
}

const DateFieldsRow: React.FC<DateFieldsRowProps> = ({ className = '' }) => {
  const form = useFormContext<TradeFormValues>();
  const { lastEntryDate } = useTradeStore();
  
  // Initialize dates on component mount
  useEffect(() => {
    // Only set entryDate if it's not already set in the form
    if (!form.getValues('entryDate')) {
      const defaultDate = getDefaultTradeDate(lastEntryDate);
      form.setValue('entryDate', defaultDate, { shouldValidate: true });
      
      // Also set exitDate to same day if not set
      if (!form.getValues('exitDate')) {
        form.setValue('exitDate', defaultDate, { shouldValidate: true });
      }
    }
  }, [form, lastEntryDate]);
  
  // Helper to get formatted parts of a date
  const getDateParts = (dateField: Date | undefined) => {
    const date = dateField || getDefaultTradeDate(lastEntryDate);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      year: date.getFullYear().toString()
    };
  };
  
  // Generate options for days, months, and years
  const dayOptions = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const monthOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 27 }, (_, i) => (1999 + i).toString());

  // Date handling for separate day/month/year inputs with proper Date object creation
  const handleDateChange = (field: string, value: string, type: 'day' | 'month' | 'year') => {
    let currentDate = field === 'entryDate' ? form.getValues('entryDate') : form.getValues('exitDate');
    if (!currentDate) {
      currentDate = getDefaultTradeDate(lastEntryDate);
    }
    
    const date = new Date(currentDate);
    
    if (type === 'day') {
      date.setDate(parseInt(value));
    } else if (type === 'month') {
      date.setMonth(parseInt(value) - 1); // Months are 0-indexed
    } else if (type === 'year') {
      date.setFullYear(parseInt(value));
    }
    
    // Ensure we have a valid Date object before setting the value
    if (!isNaN(date.getTime())) {
      form.setValue(field as any, date, { shouldValidate: true });
    }
  };
  
  // Get parts for current dates
  const entryDateParts = getDateParts(form.getValues('entryDate'));
  const exitDateParts = getDateParts(form.getValues('exitDate'));

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Entry Date */}
      <div>
        <FormLabel className="text-sm font-medium text-white/80">Entry Date</FormLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          <Select 
            value={entryDateParts.day} 
            onValueChange={(value) => handleDateChange('entryDate', value, 'day')}
          >
            <SelectTrigger className="w-[70px] bg-black/20 border-white/10">
              <SelectValue placeholder="DD" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {dayOptions.map(day => (
                <SelectItem key={`entry-day-${day}`} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={entryDateParts.month} 
            onValueChange={(value) => handleDateChange('entryDate', value, 'month')}
          >
            <SelectTrigger className="w-[70px] bg-black/20 border-white/10">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {monthOptions.map(month => (
                <SelectItem key={`entry-month-${month}`} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={entryDateParts.year} 
            onValueChange={(value) => handleDateChange('entryDate', value, 'year')}
          >
            <SelectTrigger className="w-[90px] bg-black/20 border-white/10">
              <SelectValue placeholder="YYYY" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={`entry-year-${year}`} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exit Date */}
      <div>
        <FormLabel className="text-sm font-medium text-white/80">Exit Date</FormLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          <Select 
            value={exitDateParts.day} 
            onValueChange={(value) => handleDateChange('exitDate', value, 'day')}
          >
            <SelectTrigger className="w-[70px] bg-black/20 border-white/10">
              <SelectValue placeholder="DD" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {dayOptions.map(day => (
                <SelectItem key={`exit-day-${day}`} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={exitDateParts.month} 
            onValueChange={(value) => handleDateChange('exitDate', value, 'month')}
          >
            <SelectTrigger className="w-[70px] bg-black/20 border-white/10">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {monthOptions.map(month => (
                <SelectItem key={`exit-month-${month}`} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={exitDateParts.year} 
            onValueChange={(value) => handleDateChange('exitDate', value, 'year')}
          >
            <SelectTrigger className="w-[90px] bg-black/20 border-white/10">
              <SelectValue placeholder="YYYY" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={`exit-year-${year}`} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DateFieldsRow;
