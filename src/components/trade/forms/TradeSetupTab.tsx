
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { TradeFormValues } from '../schemas/tradeFormSchema';
import { entryTimeframes, timeZones } from '../constants/formConstants';
import { detectSession } from '../utils/sessionDetector';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import DateFieldsRow from './DateFieldsRow';

const TradeSetupTab: React.FC = () => {
  const form = useFormContext<TradeFormValues>();
  
  // Auto-detect session when time or timezone changes
  useEffect(() => {
    const entryTime = form.watch('entryTime');
    const entryTimezone = form.watch('entryTimezone');
    
    if (entryTime && entryTimezone) {
      const session = detectSession(entryTime, entryTimezone);
      form.setValue('session', session);
    }
  }, [form.watch('entryTime'), form.watch('entryTimezone'), form]);
  
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="instrument"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-white/80">Instrument</FormLabel>
            <FormControl>
              <Input placeholder="e.g. EUR/USD" {...field} className="bg-black/20 border-white/10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="direction"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-white/80">Direction</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2 bg-[#00a86b]/20 px-4 py-2 rounded-md border border-[#00a86b]/30 hover:bg-[#00a86b]/30 transition-colors cursor-pointer w-full">
                  <RadioGroupItem value="Long" id="long" />
                  <Label htmlFor="long" className="cursor-pointer text-white/90 font-medium w-full">Long</Label>
                </div>
                <div className="flex items-center space-x-2 bg-[#ea384c]/20 px-4 py-2 rounded-md border border-[#ea384c]/30 hover:bg-[#ea384c]/30 transition-colors cursor-pointer w-full">
                  <RadioGroupItem value="Short" id="short" />
                  <Label htmlFor="short" className="cursor-pointer text-white/90 font-medium w-full">Short</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Side by side date fields using the DateFieldsRow component */}
      <DateFieldsRow />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium text-white/80">Entry Time (24h)</FormLabel>
          <div className="flex space-x-2">
            <FormField
              control={form.control}
              name="entryTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="HH:MM" 
                      type="time" 
                      {...field} 
                      className="w-full bg-black/20 border-white/10"
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
                <FormItem className="w-[120px]">
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Update session when timezone changes
                      const time = form.getValues('entryTime');
                      if (time) {
                        const session = detectSession(time, value);
                        form.setValue('session', session);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder="TZ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {timeZones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Show detected session */}
          <div className="text-xs text-muted-foreground mt-1">
            Session: {form.watch('session') || 'Auto-detected'}
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel className="text-sm font-medium text-white/80">Exit Time (24h)</FormLabel>
          <div className="flex space-x-2">
            <FormField
              control={form.control}
              name="exitTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="HH:MM" 
                      type="time" 
                      {...field} 
                      className="w-full bg-black/20 border-white/10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exitTimezone"
              render={({ field }) => (
                <FormItem className="w-[120px]">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder="TZ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {timeZones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="entryTimeframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-white/80">Entry Timeframe</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-black/20 border-white/10">
                    <SelectValue placeholder="Select Timeframe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {entryTimeframes.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="htfTimeframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-white/80">HTF Timeframe</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-black/20 border-white/10">
                    <SelectValue placeholder="Select HTF" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {entryTimeframes.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Hidden field to store session */}
      <FormField
        control={form.control}
        name="session"
        render={({ field }) => (
          <input type="hidden" {...field} />
        )}
      />
    </div>
  );
};

export default TradeSetupTab;
