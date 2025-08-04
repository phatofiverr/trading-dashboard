
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trade } from "@/types/Trade";
import { format } from "date-fns";
import { useTradeStore } from "@/hooks/useTradeStore";
import { Trash, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import TradeEntryForm from '@/components/trade/TradeEntryForm';

interface TradeDetailViewProps {
  trade: Trade;
}

const TradeDetailView: React.FC<TradeDetailViewProps> = ({ trade }) => {
  const { deleteTrade, selectTrade } = useTradeStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  
  const handleDelete = async () => {
    await deleteTrade(trade.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="border-trading-border bg-trading-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Trade Details</CardTitle>
        </CardHeader>
        
        <CardContent className="text-sm">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-semibold">Trade ID:</span>
              <span>{trade.tradeId || trade.id.substring(0, 8)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold">Instrument:</span>
              <span>{trade.instrument || trade.pair}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold">Direction:</span>
              <Badge variant={trade.direction === "long" ? "default" : "destructive"}>
                {trade.direction === "long" ? "Long" : "Short"}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold">Entry Date:</span>
              <span>{format(new Date(trade.entryDate), "yyyy-MM-dd")}</span>
            </div>
            
            {trade.exitDate && (
              <div className="flex justify-between">
                <span className="font-semibold">Exit Date:</span>
                <span>{format(new Date(trade.exitDate), "yyyy-MM-dd")}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="font-semibold">Entry Price:</span>
              <span>{trade.entryPrice}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold">Exit Price:</span>
              <span>{trade.exitPrice}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold">SL Price:</span>
              <span>{trade.slPrice || trade.stopLoss}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold">R-Multiple:</span>
              <Badge variant={trade.rMultiple > 0 ? "default" : "destructive"}>
                {trade.rMultiple.toFixed(2)}R
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold">Timeframes:</span>
              <span>{trade.entryTimeframe || trade.timeframe} / {trade.htfTimeframe || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold">Session:</span>
              <span>{trade.session || 'N/A'} {trade.killzone && trade.killzone !== "None" && `(${trade.killzone})`}</span>
            </div>
            
            {trade.tags && trade.tags.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {trade.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {trade.notes && (
              <div className="space-y-1">
                <span className="font-semibold">Notes:</span>
                <p className="text-sm whitespace-pre-wrap">{trade.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          {/* Edit Trade Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-xl border-white/10">
              <DialogHeader>
                <DialogTitle className="text-foreground font-medium">Edit Trade</DialogTitle>
              </DialogHeader>
              <TradeEntryForm initialTrade={trade} isEditing />
            </DialogContent>
          </Dialog>
          
          {/* Delete Trade Button */}
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Trade
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TradeDetailView;
