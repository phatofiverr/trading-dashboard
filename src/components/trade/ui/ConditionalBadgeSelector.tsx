
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface ConditionalBadgeSelectorProps {
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
}

const ConditionalBadgeSelector: React.FC<ConditionalBadgeSelectorProps> = ({
  options,
  selectedOptions,
  onSelectionChange
}) => {
  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter(o => o !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isSelected = selectedOptions.includes(option);
        return (
          <Badge
            key={option}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-accent text-white hover:bg-accent/80' 
                : 'hover:bg-accent/20'
            }`}
            onClick={() => toggleOption(option)}
          >
            {isSelected && <Check className="h-3 w-3 mr-1" />}
            {option}
          </Badge>
        );
      })}
    </div>
  );
};

export default ConditionalBadgeSelector;
