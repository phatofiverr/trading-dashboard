"use client";

import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useColors } from "@/hooks/useColors";
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
  const colors = useColors();
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
      <div 
        className="relative border-2 border-dashed rounded-lg h-full"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.muted
        }}
      >
        {/* Chart Image Area or Placeholder */}
        <div className="p-4 pb-16"> {/* Extra padding bottom for URL input */}
          {!entry.imageUrl ? (
            <div className="h-32 flex flex-col items-center justify-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: colors.background.muted }}
              >
                <ImageIcon className="w-6 h-6" style={{ color: colors.text.secondary }} />
              </div>
              <p className="text-sm text-center" style={{ color: colors.text.secondary }}>Upload chart image</p>
            </div>
          ) : (
            <div className="relative min-h-[120px] flex items-center justify-center">
              {isLoading && (
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: colors.background.modal }}
                >
                  <div className="text-sm" style={{ color: colors.text.secondary }}>Loading chart...</div>
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
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ backgroundColor: colors.background.modal }}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: colors.status.negative.background }}
                  >
                    <X className="w-6 h-6" style={{ color: colors.status.negative.primary }} />
                  </div>
                  <p className="text-sm text-center" style={{ color: colors.status.negative.primary }}>Failed to load image</p>
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
              className="flex-1 text-sm"
              style={{
                backgroundColor: colors.background.input,
                borderColor: colors.border.input,
                color: colors.text.primary,
                '--placeholder-color': colors.text.disabled
              }}
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
      <h3 className="text-xl font-medium" style={{ color: colors.text.primary }}>Chart Analysis</h3>
      
      <FormField
        control={form.control}
        name="chartAnalysis"
        render={() => (
          <FormItem>
            <FormControl>
              <div className="space-y-6">
                {chartAnalysis.map((entry: ChartEntry) => (
                  <div 
                    key={entry.id} 
                    className="relative rounded-lg p-4"
                    style={{
                      backgroundColor: colors.background.glass
                    }}
                  >
                    {/* Cancel button on top-right */}
                    {chartAnalysis.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveChartEntry(entry.id)}
                        className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
                        style={{
                          backgroundColor: colors.background.glass,
                          borderColor: colors.border.muted,
                          '--hover-bg-color': colors.status.negative.background,
                          '--hover-border-color': colors.status.negative.border
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Main Container Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Chart Container */}
                      <div className="order-2 lg:order-1 flex flex-col">
                        <div className="mb-2">
                          <h4 className="text-sm font-medium" style={{ color: colors.text.primary }}>Chart Screenshot</h4>
                        </div>
                        <div className="flex-1">
                          {renderChartContainer(entry)}
                        </div>
                      </div>

                      {/* Notes Area */}
                      <div className="order-1 lg:order-2 flex flex-col">
                        <div className="mb-2">
                          <h4 className="text-sm font-medium" style={{ color: colors.text.primary }}>Notes</h4>
                        </div>
                        <Textarea
                          placeholder="Write your thoughts about this trade, lessons learned, or things to improve..."
                          value={entry.notes}
                          onChange={(e) => handleNotesChange(entry.id, e.target.value)}
                          className="flex-1 resize-none"
                          style={{
                            backgroundColor: colors.background.input,
                            borderColor: colors.border.input,
                            color: colors.text.primary,
                            '--placeholder-color': colors.text.disabled
                          }}
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
          style={{
            backgroundColor: colors.background.glass,
            borderColor: colors.border.muted,
            color: colors.text.primary,
            '--hover-bg-color': colors.background.muted,
            '--hover-border-color': colors.border.primary
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Chart Analysis
        </Button>
      </div>
    </div>
  );
}