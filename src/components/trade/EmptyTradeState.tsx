import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyTradeStateProps {
  message?: string;
}

const EmptyTradeState: React.FC<EmptyTradeStateProps> = ({ message }) => {
  return (
    <TableRow>
      <TableCell colSpan={8} className="text-left py-10 text-muted-foreground">
        {message || "No trades found. Add some trades to see them here."}
      </TableCell>
    </TableRow>
  );
};

export default EmptyTradeState;
