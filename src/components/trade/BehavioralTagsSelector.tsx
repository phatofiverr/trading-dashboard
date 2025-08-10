import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { TradeFormValues } from './schemas/tradeFormSchema';
import { BEHAVIORAL_TAGS, BehavioralTagDefinition } from '@/constants/behavioralTags';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Info, DoorOpen, FileText, Shield, Zap } from 'lucide-react';

interface BehavioralTagsSelectorProps {
  strategyId?: string;
  isDemonMode?: boolean;
}

const BehavioralTagsSelector: React.FC<BehavioralTagsSelectorProps> = ({ strategyId, isDemonMode = false }) => {
  const form = useFormContext<TradeFormValues>();
  
  // Show behavioral tags if a strategy is selected OR if in demon mode
  const shouldShowBehavioralTags = isDemonMode || (strategyId && strategyId !== "none");
  
  if (!shouldShowBehavioralTags) {
    return null;
  }
  
  const handleTagToggle = useCallback((tagId: string, currentTags: string[], onChange: (tags: string[]) => void) => {
    const updatedTags = currentTags.includes(tagId)
      ? currentTags.filter((id: string) => id !== tagId)
      : [...currentTags, tagId];
    onChange(updatedTags);
  }, []);
  
  
  const getCategoryIcon = (category: BehavioralTagDefinition['category']) => {
    switch (category) {
      case 'entry': return <DoorOpen className="h-4 w-4" />;
      case 'exit': return <DoorOpen className="h-4 w-4" />;
      case 'planning': return <FileText className="h-4 w-4" />;
      case 'risk': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };
  
  // Group tags by category
  const tagsByCategory = BEHAVIORAL_TAGS.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, BehavioralTagDefinition[]>);
  
  return (
    <FormField
      control={form.control}
      name="behavioralTags"
      render={({ field }) => {
        return (
          <FormItem className="space-y-4">
            <FormDescription className="text-xs text-muted-foreground flex items-start space-x-2">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                {isDemonMode 
                  ? "Mark any behavioral mistakes you committed during this trade."
                  : "Mark any behavioral mistakes you made during this trade."
                }
              </span>
            </FormDescription>
            
            <div className="space-y-4">
              {Object.entries(tagsByCategory).map(([category, tags]) => (
                <div key={category} className="space-y-2">
                  {/* <div className="flex items-center space-x-2">
                    {getCategoryIcon(category as BehavioralTagDefinition['category'])}
                    <h4 className="text-sm font-medium capitalize">
                      {isDemonMode ? `${category} Demons` : `${category} Mistakes`}
                    </h4>
                  </div> */}
                  
                  <div className="grid grid-cols-1 gap-2 pl-6">
                    {tags.map((tag) => {
                      const isSelected = field.value?.includes(tag.id) || false;
                      
                      return (
                        <div
                          key={tag.id}
                          onClick={(e) => {
                            // Prevent double-toggle if clicking the checkbox directly
                            if (e.target === e.currentTarget) {
                              handleTagToggle(tag.id, field.value || [], field.onChange);
                            }
                          }}
                          className={`
                            glass-effect flex items-center space-x-3 p-3 rounded-lg border-0 transition-all hover:bg-black/10 cursor-pointer
                            ${isSelected 
                              ? 'bg-red-500/10 border-red-500/30 text-red-400 border-opacity-50' 
                              : ''
                            }
                          `}
                        >
                          <FormControl>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleTagToggle(tag.id, field.value || [], field.onChange)}
                              className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                            />
                          </FormControl>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <Zap className="h-4 w-4" />
                              <span className={`text-sm font-medium ${isSelected ? 'text-current' : ''}`}>
                                {tag.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {(field.value?.length || 0) > 0 && (
              <div className="glass-effect bg-red-500/10 border-red-500/20 mt-4 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    {isDemonMode ? "Trading Demons Identified" : "Behavioral Issues Identified"}: {field.value?.length || 0}
                  </span>
                </div>
              </div>
            )}
            
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default BehavioralTagsSelector;