import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Trade } from '@/types/Trade';
import BeautifulTradeEntryForm from './BeautifulTradeEntryForm';

interface EditTradeButtonProps {
  trade: Trade;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const EditTradeButton: React.FC<EditTradeButtonProps> = ({
  trade,
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsFormOpen(true)}
        className={`bg-black/20 hover:bg-black/30 text-foreground border-white/10 ${className}`}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Trade
      </Button>

      <BeautifulTradeEntryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialTrade={trade}
        isEditing={true}
        initialAccountId={trade.accountId}
        initialStrategyId={trade.strategyId}
      />
    </>
  );
};

export default EditTradeButton;
