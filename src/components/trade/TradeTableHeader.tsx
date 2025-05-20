
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TradeTableHeader: React.FC = () => {
  return (
    <TableHeader className="bg-black/10">
      <TableRow>
        <TableHead className="text-white/70 font-medium">Instrument</TableHead>
        <TableHead className="text-white/70 font-medium">Direction</TableHead>
        <TableHead className="text-white/70 font-medium">Date</TableHead>
        <TableHead className="text-white/70 font-medium">Entry</TableHead>
        <TableHead className="text-white/70 font-medium">Exit</TableHead>
        <TableHead className="text-white/70 font-medium">R</TableHead>
        <TableHead className="text-white/70 font-medium">Risk Amount</TableHead>
        <TableHead className="text-white/70 font-medium">Profit</TableHead>
        <TableHead className="text-white/70 font-medium">Timeframe</TableHead>
        <TableHead className="text-white/70 font-medium">Session</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TradeTableHeader;
