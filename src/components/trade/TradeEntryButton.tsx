import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BeautifulTradeEntryForm from './BeautifulTradeEntryForm';

interface TradeEntryButtonProps {
  initialAccountId?: string;
  initialStrategyId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const TradeEntryButton: React.FC<TradeEntryButtonProps> = ({
  initialAccountId,
  initialStrategyId,
  variant = "default",
  size = "default",
  className = ""
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsFormOpen(true)}
        className={`bg-trading-accent1 hover:bg-trading-accent1/90 text-white ${className}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Trade
      </Button>

      <BeautifulTradeEntryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialAccountId={initialAccountId}
        initialStrategyId={initialStrategyId}
        isEditing={false}
      />
    </>
  );
};

export default TradeEntryButton;
