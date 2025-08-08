
import React from 'react';
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useTradeStore } from "@/hooks/useTradeStore";
import { useAccountCalculations } from "@/hooks/useAccountCalculations";
import { Trade } from "@/types/Trade";

interface TradeRowProps {
  trade: Trade;
}

const TradeRow: React.FC<TradeRowProps> = ({ trade }) => {
  const { selectTrade, selectedTrade } = useTradeStore();
  const { getTradeProfit, formatCurrency } = useAccountCalculations();

  const handleRowClick = () => {
    selectTrade(trade);
  };
  
  // Calculate profit using centralized calculation
  const calculateProfit = () => {
    const profit = getTradeProfit(trade);
    return formatCurrency(profit, 'USD');
  };

  return (
    <TableRow 
      className={`cursor-pointer hover:bg-black/10 transition-colors ${selectedTrade?.id === trade.id ? 'bg-black/20' : ''}`}
      onClick={handleRowClick}
    >
      <TableCell>{trade.instrument || trade.pair}</TableCell>
      <TableCell>
        <Badge 
          className={`${trade.direction === "long" ? "bg-positive/20 text-positive border-0" : "bg-negative/20 text-negative border-0"}`}
        >
          {trade.direction === "long" ? "Long" : "Short"}
        </Badge>
      </TableCell>
      <TableCell>{format(new Date(trade.entryDate), "MMM d")}</TableCell>
      <TableCell>{trade.entryPrice}</TableCell>
      <TableCell>{trade.exitPrice}</TableCell>
      <TableCell>
        <Badge 
          className={`${trade.rMultiple > 0 ? "bg-positive/20 text-positive border-0" : "bg-negative/20 text-negative border-0"}`}
        >
          {trade.rMultiple.toFixed(2)}
        </Badge>
      </TableCell>
      <TableCell>{trade.riskAmount ? `$${trade.riskAmount}` : 'N/A'}</TableCell>
      <TableCell>{calculateProfit()}</TableCell>
      <TableCell>{trade.entryTimeframe || trade.timeframe}</TableCell>
      <TableCell>{trade.session || 'N/A'}</TableCell>
    </TableRow>
  );
};

export default TradeRow;
