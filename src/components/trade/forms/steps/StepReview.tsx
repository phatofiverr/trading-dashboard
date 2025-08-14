"use client";

import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface ChartEntry {
  id: string;
  imageUrl: string;
  notes: string;
  order: number;
}

export default function StepReview() {
  const form = useFormContext<TradeFormValues>();
  const watchedValues = form.watch();
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [imageErrorStates, setImageErrorStates] = useState<Record<string, boolean>>({});

  // Get chart analysis entries, initialize with one empty entry if none exist
  const chartAnalysis = watchedValues.chartAnalysis || [];
  
  // Initialize with one empty entry if none exist using useEffect
  useEffect(() => {
    if (chartAnalysis.length === 0) {
      const initialEntry: ChartEntry = {
        id: generateId(),
        imageUrl: "",
        notes: "",
        order: 0
      };
      form.setValue("chartAnalysis", [initialEntry]);
    }
  }, [chartAnalysis.length, form]);

  function generateId(): string {
    return `chart_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  const handleAddChartEntry = () => {
    const currentEntries = form.getValues("chartAnalysis") || [];
    const newEntry: ChartEntry = {
      id: generateId(),
      imageUrl: "",
      notes: "",
      order: currentEntries.length
    };
    form.setValue("chartAnalysis", [...currentEntries, newEntry]);
  };

  const handleRemoveChartEntry = (entryId: string) => {
    const currentEntries = form.getValues("chartAnalysis") || [];
    if (currentEntries.length <= 1) return; // Don't allow removing the last entry
    
    const updatedEntries = currentEntries.filter(entry => entry.id !== entryId);
    // Reorder the remaining entries
    const reorderedEntries = updatedEntries.map((entry, index) => ({
      ...entry,
      order: index
    }));
    form.setValue("chartAnalysis", reorderedEntries);
    
    // Clean up loading/error states
    setImageLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[entryId];
      return newState;
    });
    setImageErrorStates(prev => {
      const newState = { ...prev };
      delete newState[entryId];
      return newState;
    });
  };

  const handleImageUrlChange = (entryId: string, newUrl: string) => {
    const currentEntries = form.getValues("chartAnalysis") || [];
    const updatedEntries = currentEntries.map(entry => 
      entry.id === entryId ? { ...entry, imageUrl: newUrl } : entry
    );
    form.setValue("chartAnalysis", updatedEntries);
  };

  const handleNotesChange = (entryId: string, newNotes: string) => {
    const currentEntries = form.getValues("chartAnalysis") || [];
    const updatedEntries = currentEntries.map(entry => 
      entry.id === entryId ? { ...entry, notes: newNotes } : entry
    );
    form.setValue("chartAnalysis", updatedEntries);
  };

  const handleImageLoad = (entryId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [entryId]: false }));
    setImageErrorStates(prev => ({ ...prev, [entryId]: false }));
  };

  const handleImageError = (entryId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [entryId]: false }));
    setImageErrorStates(prev => ({ ...prev, [entryId]: true }));
  };

  const handleImageLoadStart = (entryId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [entryId]: true }));
    setImageErrorStates(prev => ({ ...prev, [entryId]: false }));
  };

  const renderChartContainer = (entry: ChartEntry) => {
    const isLoading = imageLoadingStates[entry.id];
    const hasError = imageErrorStates[entry.id];

    return (
      <div className="relative bg-black/20 border-2 border-dashed border-white/20 rounded-lg min-h-[200px]">
        {/* Chart Image Area or Placeholder */}
        <div className="p-4 pb-16"> {/* Extra padding bottom for URL input */}
          {!entry.imageUrl ? (
            <div className="h-32 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-white/60" />
              </div>
              <p className="text-white/60 text-sm text-center">Upload chart image</p>
            </div>
          ) : (
            <div className="relative min-h-[120px] flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white/60 text-sm">Loading chart...</div>
                </div>
              )}
              <img
                src={entry.imageUrl}
                alt="Trading Chart"
                className="max-w-full max-h-[120px] object-contain rounded"
                onLoad={() => handleImageLoad(entry.id)}
                onError={() => handleImageError(entry.id)}
                onLoadStart={() => handleImageLoadStart(entry.id)}
              />
              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                    <X className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-red-400 text-sm text-center">Failed to load image</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* URL Input at Bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste your TradingView chart link here (e.g., https://www.tradingview.com/x/abcd1234/)"
              value={entry.imageUrl}
              onChange={(e) => handleImageUrlChange(entry.id, e.target.value)}
              className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Input is already handled by onChange
                }
              }}
            />

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[60vh] overflow-y-auto space-y-6 pr-2">
      <h3 className="text-xl font-medium text-white">Chart Analysis</h3>
      
      <FormField
        control={form.control}
        name="chartAnalysis"
        render={() => (
          <FormItem>
            <FormControl>
              <div className="space-y-6">
                {chartAnalysis.map((entry: ChartEntry) => (
                  <div key={entry.id} className="relative bg-black/5 border border-white/10 rounded-lg p-4">
                    {/* Cancel button on top-right */}
                    {chartAnalysis.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveChartEntry(entry.id)}
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/40 hover:bg-red-500/40 border-white/20 hover:border-red-500/40 z-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Main Container Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Chart Container */}
                      <div className="order-2 lg:order-1">
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-white">Chart Screenshot</h4>
                        </div>
                        {renderChartContainer(entry)}
                      </div>

                      {/* Notes Area */}
                      <div className="order-1 lg:order-2">
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-white">Notes</h4>
                        </div>
                        <Textarea
                          placeholder="Write your thoughts about this trade, lessons learned, or things to improve..."
                          value={entry.notes}
                          onChange={(e) => handleNotesChange(entry.id, e.target.value)}
                          className="min-h-[200px] bg-black/20 border-white/10 text-white placeholder:text-white/40 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Add Chart Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={handleAddChartEntry}
          variant="outline"
          className="bg-black/20 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Chart Analysis
        </Button>
      </div>
    </div>
  );
}