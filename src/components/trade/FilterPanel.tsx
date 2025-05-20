
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTradeStore } from "@/hooks/useTradeStore";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const FilterPanel: React.FC = () => {
  const { filters, setFilter, clearFilters } = useTradeStore();
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: filters.dateRange[0] || undefined,
    to: filters.dateRange[1] || undefined,
  });
  
  // Generate years for dropdown (10 years ago to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 10 + i);

  // Month names array for the dropdown
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Handle year change for from date
  const handleFromYearChange = (year: string) => {
    if (!dateRange.from) {
      const newDate = new Date();
      newDate.setFullYear(parseInt(year, 10));
      handleDateRangeChange({ 
        from: newDate, 
        to: dateRange.to 
      });
    } else {
      const newDate = new Date(dateRange.from);
      newDate.setFullYear(parseInt(year, 10));
      handleDateRangeChange({ 
        from: newDate, 
        to: dateRange.to 
      });
    }
  };

  // Handle month change for from date
  const handleFromMonthChange = (monthIndex: string) => {
    if (!dateRange.from) {
      const newDate = new Date();
      newDate.setMonth(parseInt(monthIndex, 10));
      handleDateRangeChange({ 
        from: newDate, 
        to: dateRange.to 
      });
    } else {
      const newDate = new Date(dateRange.from);
      newDate.setMonth(parseInt(monthIndex, 10));
      handleDateRangeChange({ 
        from: newDate, 
        to: dateRange.to 
      });
    }
  };

  // Handle year change for to date
  const handleToYearChange = (year: string) => {
    if (!dateRange.to) {
      const newDate = new Date();
      newDate.setFullYear(parseInt(year, 10));
      handleDateRangeChange({ 
        from: dateRange.from, 
        to: newDate 
      });
    } else {
      const newDate = new Date(dateRange.to);
      newDate.setFullYear(parseInt(year, 10));
      handleDateRangeChange({ 
        from: dateRange.from, 
        to: newDate 
      });
    }
  };

  // Handle month change for to date
  const handleToMonthChange = (monthIndex: string) => {
    if (!dateRange.to) {
      const newDate = new Date();
      newDate.setMonth(parseInt(monthIndex, 10));
      handleDateRangeChange({ 
        from: dateRange.from, 
        to: newDate 
      });
    } else {
      const newDate = new Date(dateRange.to);
      newDate.setMonth(parseInt(monthIndex, 10));
      handleDateRangeChange({ 
        from: dateRange.from, 
        to: newDate 
      });
    }
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange({
      from: range.from,
      to: range.to
    });
    setFilter("dateRange", [range.from || null, range.to || null]);
  };

  return (
    <Card className="bg-black/10 backdrop-blur-sm rounded-xl overflow-hidden border-0">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Select
                value={filters.direction || "all-directions"}
                onValueChange={(value) =>
                  setFilter("direction", value === "all-directions" ? null : value)
                }
              >
                <SelectTrigger className="h-9 bg-black/10 border-0 shadow-inner shadow-black/5">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-0">
                  <SelectItem value="all-directions">Direction: All</SelectItem>
                  <SelectItem value="Long">Long</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.session || "all-sessions"}
                onValueChange={(value) =>
                  setFilter("session", value === "all-sessions" ? null : value)
                }
              >
                <SelectTrigger className="h-9 bg-black/10 border-0 shadow-inner shadow-black/5">
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-0">
                  <SelectItem value="all-sessions">Session: All</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="NY">NY</SelectItem>
                  <SelectItem value="Overlap">Overlap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.entryType || "all-entry-types"}
                onValueChange={(value) =>
                  setFilter("entryType", value === "all-entry-types" ? null : value)
                }
              >
                <SelectTrigger className="h-9 bg-black/10 border-0 shadow-inner shadow-black/5">
                  <SelectValue placeholder="Entry Type" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-0">
                  <SelectItem value="all-entry-types">Entry: All</SelectItem>
                  <SelectItem value="OB Tap">OB Tap</SelectItem>
                  <SelectItem value="FVG Fill">FVG Fill</SelectItem>
                  <SelectItem value="Breaker">Breaker</SelectItem>
                  <SelectItem value="Liquidity Sweep">Liquidity Sweep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.timeframe || "all-timeframes"}
                onValueChange={(value) =>
                  setFilter("timeframe", value === "all-timeframes" ? null : value)
                }
              >
                <SelectTrigger className="h-9 bg-black/10 border-0 shadow-inner shadow-black/5">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-0">
                  <SelectGroup>
                    <SelectItem value="all-timeframes">TF: All</SelectItem>
                    <SelectItem value="M1">M1</SelectItem>
                    <SelectItem value="M5">M5</SelectItem>
                    <SelectItem value="M15">M15</SelectItem>
                    <SelectItem value="M30">M30</SelectItem>
                    <SelectItem value="H1">H1</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* From date */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-white/70">From:</span>
                
                {/* Year selector */}
                <Select 
                  value={dateRange.from ? dateRange.from.getFullYear().toString() : undefined}
                  onValueChange={handleFromYearChange}
                >
                  <SelectTrigger className="w-[75px] h-9 bg-black/10 border-0 shadow-inner shadow-black/5">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-md border-0">
                    {years.map((year) => (
                      <SelectItem key={`from-${year}`} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Month selector */}
                <Select 
                  value={dateRange.from ? dateRange.from.getMonth().toString() : undefined}
                  onValueChange={handleFromMonthChange}
                >
                  <SelectTrigger className="w-[110px] h-9 bg-black/10 border-0 shadow-inner shadow-black/5">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-md border-0">
                    {months.map((month, index) => (
                      <SelectItem key={`from-month-${index}`} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Day selector */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[80px] justify-start text-left font-normal h-9 bg-black/10 border-0 shadow-inner shadow-black/5",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      {dateRange.from ? format(dateRange.from, "dd") : "Day"}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black/80 backdrop-blur-md border-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve year and month if already selected
                          if (dateRange.from) {
                            date.setFullYear(dateRange.from.getFullYear());
                            date.setMonth(dateRange.from.getMonth());
                          }
                          handleDateRangeChange({ from: date, to: dateRange.to });
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* To date */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-white/70">To:</span>
                
                {/* Year selector */}
                <Select 
                  value={dateRange.to ? dateRange.to.getFullYear().toString() : undefined}
                  onValueChange={handleToYearChange}
                >
                  <SelectTrigger className="w-[75px] h-9 bg-black/10 border-0 shadow-inner shadow-black/5">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-md border-0">
                    {years.map((year) => (
                      <SelectItem key={`to-${year}`} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Month selector */}
                <Select 
                  value={dateRange.to ? dateRange.to.getMonth().toString() : undefined}
                  onValueChange={handleToMonthChange}
                >
                  <SelectTrigger className="w-[110px] h-9 bg-black/10 border-0 shadow-inner shadow-black/5">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-md border-0">
                    {months.map((month, index) => (
                      <SelectItem key={`to-month-${index}`} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Day selector */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[80px] justify-start text-left font-normal h-9 bg-black/10 border-0 shadow-inner shadow-black/5",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      {dateRange.to ? format(dateRange.to, "dd") : "Day"}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black/80 backdrop-blur-md border-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve year and month if already selected
                          if (dateRange.to) {
                            date.setFullYear(dateRange.to.getFullYear());
                            date.setMonth(dateRange.to.getMonth());
                          }
                          handleDateRangeChange({ from: dateRange.from, to: date });
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              size="sm"
              className="bg-black/10 hover:bg-black/20 text-white/70 hover:text-white border-0 h-9"
              onClick={() => {
                clearFilters();
                setDateRange({ from: undefined, to: undefined });
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
