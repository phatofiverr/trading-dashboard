
import React from 'react';
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useTradeStore } from "@/hooks/useTradeStore";
import { useAccountCalculations } from "@/hooks/useAccountCalculations";
import { Trade } from "@/types/Trade";
import { colorPalette } from "@/lib/colorPalette";

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
          style={{
            backgroundColor: trade.direction === "long" ? colorPalette.trading.long.background : colorPalette.trading.short.background,
            color: trade.direction === "long" ? colorPalette.trading.long.primary : colorPalette.trading.short.primary,
            border: 'none'
          }}
        >
          {trade.direction === "long" ? "Long" : "Short"}
        </Badge>
      </TableCell>
      <TableCell>{format(new Date(trade.entryDate), "MMM d")}</TableCell>
      <TableCell>{trade.entryPrice}</TableCell>
      <TableCell>{trade.exitPrice}</TableCell>
      <TableCell>
        <Badge 
          style={{
            backgroundColor: trade.rMultiple > 0 ? colorPalette.status.positive.background : colorPalette.status.negative.background,
            color: trade.rMultiple > 0 ? colorPalette.status.positive.primary : colorPalette.status.negative.primary,
            border: 'none'
          }}
        >
          {trade.rMultiple.toFixed(2)}
        </Badge>
      </TableCell>
      <TableCell>{trade.riskAmount ? `$${trade.riskAmount}` : 'N/A'}</TableCell>
      <TableCell>{calculateProfit()}</TableCell>
      <TableCell>
        {trade.setupQuality !== undefined ? (
          <Badge 
            style={{
              backgroundColor: trade.setupQuality >= 80 ? colorPalette.status.positive.background :
                              trade.setupQuality >= 60 ? colorPalette.status.warning.background :
                              trade.setupQuality >= 40 ? colorPalette.status.warning.background :
                              colorPalette.status.negative.background,
              color: trade.setupQuality >= 80 ? colorPalette.status.positive.primary :
                    trade.setupQuality >= 60 ? colorPalette.status.warning.primary :
                    trade.setupQuality >= 40 ? colorPalette.status.warning.secondary :
                    colorPalette.status.negative.primary,
              border: 'none'
            }}
          >
            {trade.setupQuality}%
          </Badge>
        ) : (
          <span style={{ color: colorPalette.text.secondary }}>N/A</span>
        )}
      </TableCell>
      <TableCell>{trade.entryTimeframe || trade.timeframe}</TableCell>
      <TableCell>{trade.session || 'N/A'}</TableCell>
    </TableRow>
  );
};

export default TradeRow;
