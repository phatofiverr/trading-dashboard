
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { useTradeStore } from "@/hooks/useTradeStore";
import { getDefaultTradeDate } from "@/lib/dateUtils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { lastEntryDate } = useTradeStore();
  
  // Initialize with the currently displayed month's year or last entry date year or current year
  const [currentYear, setCurrentYear] = React.useState<number>(() => {
    if (props.selected instanceof Date) {
      return props.selected.getFullYear();
    } else if (props.defaultMonth instanceof Date) {
      return props.defaultMonth.getFullYear();
    } else if (lastEntryDate) {
      const parsedDate = new Date(lastEntryDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.getFullYear();
      }
    }
    return new Date().getFullYear();
  });
  
  // Years range from 1999 to 2025
  const years = Array.from({ length: 27 }, (_, i) => 1999 + i);
  
  // Handle year change
  const handleYearChange = (newYear: string) => {
    const year = parseInt(newYear, 10);
    setCurrentYear(year);
    
    if (props.onMonthChange) {
      let newDate: Date;
      
      if (props.selected instanceof Date) {
        newDate = new Date(props.selected);
      } else if (props.defaultMonth instanceof Date) {
        newDate = new Date(props.defaultMonth);
      } else if (lastEntryDate) {
        newDate = getDefaultTradeDate(lastEntryDate);
      } else {
        newDate = new Date();
      }
      
      newDate.setFullYear(year);
      props.onMonthChange(newDate);
    }
  };
  
  // Customize the caption to only show month name
  function CustomCaption({ 
    displayMonth, 
    onMonthChange 
  }: {
    displayMonth: Date; 
    onMonthChange: (date: Date) => void;
  }) {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    return (
      <div className="flex items-center justify-center gap-1">
        <div className="text-sm font-medium">
          {months[displayMonth.getMonth()]}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Year selector outside of the calendar */}
      <Select
        value={currentYear.toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="h-8 w-full sm:w-[120px] text-xs font-medium">
          <SelectValue>{currentYear}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Day Picker for month and date selection */}
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3 pointer-events-auto", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium", // Show only month in caption
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
          Caption: CustomCaption
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
