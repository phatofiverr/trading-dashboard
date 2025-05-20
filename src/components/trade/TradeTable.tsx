
import React, { useEffect, useState } from 'react';
import { useTradeStore } from "@/hooks/useTradeStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CSVImport from './CSVImport';
import TradeRow from './TradeRow';
import TradeTableHeader from './TradeTableHeader';
import EmptyTradeState from './EmptyTradeState';
import TradePagination from './TradePagination';
import { TradeTableProps } from './TradeComponentProps';

const ITEMS_PER_PAGE = 10;

const TradeTable: React.FC<TradeTableProps> = ({ hideExportButton = false, trades }) => {
  const { fetchTrades, filteredTrades } = useTradeStore();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use provided trades or fall back to filteredTrades from the store
  const displayTrades = trades || filteredTrades || [];
  
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);
  
  // Reset to first page when filtered trades change
  useEffect(() => {
    setCurrentPage(1);
  }, [displayTrades.length]);
  
  const totalPages = Math.max(1, Math.ceil(displayTrades.length / ITEMS_PER_PAGE));
  
  // Get current page trades
  const getCurrentPageTrades = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return displayTrades.slice(startIndex, endIndex);
  };
  
  const currentTrades = getCurrentPageTrades();
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  return (
    <div className="space-y-4">
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-normal">Trade History</CardTitle>
            {!hideExportButton && (
              <CSVImport />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TradeTableHeader />
                <TableBody>
                  {displayTrades.length === 0 ? (
                    <EmptyTradeState />
                  ) : (
                    currentTrades.map((trade) => (
                      <TradeRow key={trade.id} trade={trade} />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {displayTrades.length > 0 && (
            <div className="flex justify-center p-2 border-t border-white/10">
              <TradePagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeTable;
