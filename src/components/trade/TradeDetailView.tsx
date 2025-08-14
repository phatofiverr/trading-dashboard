
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trade } from "@/types/Trade";
import { format } from "date-fns";
import { useTradeStore } from "@/hooks/useTradeStore";
import { Trash, Pencil, Calendar, Clock, Target, TrendingUp, TrendingDown, DollarSign, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import EditTradeButton from '@/components/trade/EditTradeButton';
import { getBehavioralTagById } from "@/constants/behavioralTags";

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
        <CardContent className="text-sm p-0">
          <TooltipProvider>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 mx-6 mt-4">
                <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
                <TabsTrigger value="analysis" className="text-base">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0 px-6 pb-4">
                <div className="space-y-4">
                  {/* Basic Trade Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Target className="h-3 w-3" />
                      Basic Information
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Trade ID:</span>
                      <span className="font-mono text-xs">{trade.tradeId || trade.id.substring(0, 8)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Instrument:</span>
                      <span className="font-medium">{trade.instrument || trade.pair}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Direction:</span>
                      <Badge variant={trade.direction === "long" ? "default" : "destructive"}>
                        {trade.direction === "long" ? (
                          <><TrendingUp className="h-3 w-3 mr-1" />Long</>
                        ) : (
                          <><TrendingDown className="h-3 w-3 mr-1" />Short</>
                        )}
                      </Badge>
                    </div>
                    
                    {trade.strategyId && trade.strategyId !== 'none' && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Strategy:</span>
                        <Badge variant="outline">{trade.strategyId}</Badge>
                      </div>
                    )}
                  </div>

                  {/* Timing Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Clock className="h-3 w-3" />
                      Timing
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Entry Date:</span>
                      <span>{format(new Date(trade.entryDate), "MMM dd, yyyy")}</span>
                    </div>
                    
                    {trade.entryTime && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Entry Time:</span>
                        <span>{trade.entryTime} {trade.entryTimezone || 'UTC'}</span>
                      </div>
                    )}
                    
                    {trade.exitDate && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Exit Date:</span>
                        <span>{format(new Date(trade.exitDate), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    
                    {trade.exitTime && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Exit Time:</span>
                        <span>{trade.exitTime} {trade.exitTimezone || 'UTC'}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Session:</span>
                      <span>{trade.session || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Timeframes:</span>
                      <span>{trade.entryTimeframe || trade.timeframe} / {trade.htfTimeframe || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Price & Risk Management */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <DollarSign className="h-3 w-3" />
                      Prices & Risk
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Entry Price:</span>
                      <span className="font-mono">{trade.entryPrice}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Exit Price:</span>
                      <span className="font-mono">{trade.exitPrice}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Stop Loss:</span>
                      <span className="font-mono text-red-400">{trade.slPrice || trade.stopLoss}</span>
                    </div>
                    
                    {trade.riskAmount && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Risk Amount:</span>
                        <span>${trade.riskAmount}</span>
                      </div>
                    )}
                    
                    {trade.positionSize && typeof trade.positionSize === 'number' && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Position Size:</span>
                        <span>{trade.positionSize.toFixed(4)} lots</span>
                      </div>
                    )}
                    
                    {trade.riskRewardRatio && typeof trade.riskRewardRatio === 'number' && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Risk:Reward:</span>
                        <span className="font-medium">1:{trade.riskRewardRatio.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-0 px-6 pb-4">
                <div className="space-y-4">
                  {/* Performance */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <TrendingUp className="h-3 w-3" />
                      Performance
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">R-Multiple:</span>
                      <Badge variant={typeof trade.rMultiple === 'number' && trade.rMultiple > 0 ? "default" : "destructive"}>
                        {typeof trade.rMultiple === 'number' ? trade.rMultiple.toFixed(2) : '0.00'}R
                      </Badge>
                    </div>
                    
                    {trade.profit !== undefined && typeof trade.profit === 'number' && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Profit/Loss:</span>
                        <span className={
                          trade.profit > 0 ? "text-green-400 font-medium" : 
                          trade.profit < 0 ? "text-red-400 font-medium" :
                          "text-yellow-400 font-medium"
                        }>
                          {trade.profit === 0 ? "Break Even" : `$${trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    {trade.outcome && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Outcome:</span>
                        <Badge variant={
                          trade.outcome === 'win' ? "default" : 
                          trade.outcome === 'loss' ? "destructive" : 
                          "secondary"
                        }>
                          {trade.outcome.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Break Even Analysis */}
                  {(trade.didHitBE || trade.tpHitAfterBE || trade.reversedAfterBE) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <AlertTriangle className="h-3 w-3" />
                        Break Even Analysis
                      </div>
                      
                      {trade.didHitBE && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Hit Break Even:</span>
                          <Badge variant="secondary">Yes</Badge>
                        </div>
                      )}
                      
                      {trade.tpHitAfterBE && (
                        <div className="flex justify-between">
                          <span className="font-semibold">TP Hit After BE:</span>
                          <Badge variant="default">Yes</Badge>
                        </div>
                      )}
                      
                      {trade.reversedAfterBE && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Reversed After BE:</span>
                          <Badge variant="destructive">Yes</Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Demon Tags */}
                  {trade.behavioralTags && trade.behavioralTags.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <AlertTriangle className="h-3 w-3" />
                        Demon Tags
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {trade.behavioralTags.map(tagId => {
                            const tagInfo = getBehavioralTagById(tagId as any);
                            return tagInfo ? (
                              <Tooltip key={tagId} delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <Badge variant="destructive" className="text-xs cursor-help">
                                    {tagInfo.emoji} {tagInfo.label}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="top" 
                                  className="p-2 border border-white/20 bg-black/90 backdrop-blur-md rounded-xl shadow-2xl max-w-xs"
                                >
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">{tagInfo.label}</div>
                                    <div className="text-xs text-muted-foreground">{tagInfo.description}</div>
                                    <div className="text-xs text-muted-foreground capitalize">Category: {tagInfo.category}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Badge key={tagId} variant="destructive" className="text-xs">
                                {tagId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chart Analysis */}
                  {trade.chartAnalysis && trade.chartAnalysis.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <ImageIcon className="h-3 w-3" />
                        Chart Analysis
                      </div>
                      
                      <div className="space-y-4">
                        {trade.chartAnalysis
                          .sort((a, b) => a.order - b.order)
                          .map((chartEntry, index) => (
                          <div key={chartEntry.id} className="bg-black/10 rounded-lg p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-semibold text-sm">Chart {index + 1}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Chart Image */}
                              <div>
                                {chartEntry.imageUrl ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <div className="relative cursor-pointer group">
                                        <img 
                                          src={chartEntry.imageUrl} 
                                          alt={`Trade Chart ${index + 1}`}
                                          className="w-full h-32 object-cover rounded-lg border-2 border-white/10 hover:border-white/40 transition-all duration-200 group-hover:scale-105"
                                          onError={(e) => {
                                            e.currentTarget.src = '/placeholder-chart.png';
                                            e.currentTarget.alt = 'Chart screenshot unavailable';
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded backdrop-blur-sm">
                                            Click to enlarge
                                          </span>
                                        </div>
                                      </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl w-auto p-2 bg-black/90 backdrop-blur-md border-white/20">
                                      <DialogHeader className="sr-only">
                                        <DialogTitle>Chart Analysis {index + 1}</DialogTitle>
                                      </DialogHeader>
                                      <div className="relative flex items-center justify-center">
                                        <img 
                                          src={chartEntry.imageUrl} 
                                          alt={`Trade Chart Analysis ${index + 1} - Full Size`}
                                          className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                                          onError={(e) => {
                                            e.currentTarget.src = '/placeholder-chart.png';
                                            e.currentTarget.alt = 'Chart screenshot unavailable';
                                          }}
                                        />
                                        <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-2 rounded backdrop-blur-sm">
                                          Chart {index + 1}
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <div className="w-full h-32 bg-black/20 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <ImageIcon className="w-6 h-6 text-white/40 mx-auto mb-2" />
                                      <p className="text-white/40 text-xs">No chart image</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Chart Notes */}
                              <div>
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</span>
                                </div>
                                {chartEntry.notes ? (
                                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{chartEntry.notes}</p>
                                  </div>
                                ) : (
                                  <div className="bg-black/10 rounded-lg p-3 border border-white/10 text-center">
                                    <p className="text-white/40 text-xs">No notes for this chart</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legacy Screenshot (fallback) */}
                  {(!trade.chartAnalysis || trade.chartAnalysis.length === 0) && trade.chartScreenshot && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <ImageIcon className="h-3 w-3" />
                        Chart Screenshot
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Screenshot:</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative cursor-pointer group">
                              <img 
                                src={trade.chartScreenshot} 
                                alt="Trade Screenshot Thumbnail"
                                className="h-16 w-20 object-cover rounded-lg border-2 border-white/10 hover:border-white/40 transition-all duration-200 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-chart.png';
                                  e.currentTarget.alt = 'Chart screenshot unavailable';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded backdrop-blur-sm">
                                  Click to enlarge
                                </span>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl w-auto p-2 bg-black/90 backdrop-blur-md border-white/20">
                            <DialogHeader className="sr-only">
                              <DialogTitle>Chart Screenshot</DialogTitle>
                            </DialogHeader>
                            <div className="relative flex items-center justify-center">
                              <img 
                                src={trade.chartScreenshot} 
                                alt="Trade Chart Screenshot - Full Size"
                                className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-chart.png';
                                  e.currentTarget.alt = 'Chart screenshot unavailable';
                                }}
                              />
                              <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-2 rounded backdrop-blur-sm">
                                Chart Analysis
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                  
                  {/* General Notes */}
                  {trade.notes && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        General Notes
                      </div>
                      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{trade.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TooltipProvider>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          {/* Edit Trade Button */}
          <EditTradeButton 
            trade={trade} 
            variant="outline" 
            size="sm"
            className="w-full"
          />
          
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
