"use client";

import { useFormContext } from "react-hook-form";
import { TradeFormValues } from "../../schemas/tradeFormSchema";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Image, X, Trash2 } from "lucide-react";
import { BEHAVIORAL_TAGS } from "@/constants/behavioralTags";
import { useState } from "react";

export default function StepReview() {
  const form = useFormContext<TradeFormValues>();
  const watchedValues = form.watch();
  const [newTag, setNewTag] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadedImageUrl, setLoadedImageUrl] = useState("");

  // Convert TradingView link to S3 image URL
  const getTradingViewImageUrl = (url: string) => {
    if (!url) return null;
    
    // Check if it's a TradingView link
    const tradingViewPattern = /https:\/\/www\.tradingview\.com\/x\/([A-Za-z0-9]+)\/?/;
    const match = url.match(tradingViewPattern);
    
    if (match) {
      const chartId = match[1];
      // Convert to S3 image URL
      return `https://s3.tradingview.com/snapshots/m/${chartId}.png`;
    }
    
    // Check if it's already an S3 URL
    const s3Pattern = /https:\/\/s3\.tradingview\.com\/snapshots\/1\/([A-Za-z0-9]+)\.png/;
    if (s3Pattern.test(url)) {
      return url;
    }
    
    return null;
  };

  // Only show image if user has clicked Enter to load it
  const chartImageUrl = loadedImageUrl;

  // Predefined trade tags including behavioral tags and common trade characteristics
  const predefinedTags = [
    // Behavioral tags from the constants
    ...BEHAVIORAL_TAGS.map(tag => tag.label),
    // Additional trade characteristic tags
    // "Liquidity Grab",
    // "News Event", 
    // "Late Entry",
    // "Fomo",
    // "Overtrading",
    // "Discipline",
    // "Perfect Setup",
    // "Revenge Trade",
    // "Gap Fill",
    // "Trend Continuation"
  ];

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = watchedValues.tags || [];
    if (!currentTags.includes(newTag.trim())) {
      form.setValue("tags", [...currentTags, newTag.trim()]);
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = watchedValues.tags || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handlePredefinedTagClick = (tag: string) => {
    const currentTags = watchedValues.tags || [];
    if (currentTags.includes(tag)) {
      handleRemoveTag(tag);
    } else {
      form.setValue("tags", [...currentTags, tag]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveChart = () => {
    form.setValue("chartScreenshot", "");
    setLoadedImageUrl("");
    setImageError(false);
  };

  const handleLoadChart = () => {
    const url = watchedValues.chartScreenshot;
    if (!url) return;
    
    const convertedUrl = getTradingViewImageUrl(url);
    if (convertedUrl) {
      setLoadedImageUrl(convertedUrl);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  const handleChartKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLoadChart();
    }
  };

  return (
    <div className="space-y-6">
      {/* Trade Tags */}
      <div className="space-y-3">
        <Label className="text-white/80">Demon Tags</Label>
        
        {/* Add new tag input */}
        {/* <div className="flex gap-2">
          <Input
            placeholder="Add a tag and press Enter"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40"
          />
          <Button 
            type="button"
            onClick={handleAddTag}
            className="bg-white text-black hover:bg-white/90"
          >
            Add
          </Button>
        </div> */}

        {/* Predefined tags */}
        <div className="flex flex-wrap gap-2">
          {predefinedTags.map((tag) => {
            const isSelected = (watchedValues.tags || []).includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected 
                    ? "bg-white text-black hover:bg-white/90" 
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
                onClick={() => handlePredefinedTagClick(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>

        {/* Status message */}
        {(watchedValues.tags || []).length === 0 ? (
          <p className="text-xs text-white/40">
            No tags selected
          </p>
        ) : (
          <p className="text-xs text-white/40">
            {(watchedValues.tags || []).length} tag{(watchedValues.tags || []).length !== 1 ? 's' : ''} selected - Click tags to remove them
          </p>
        )}
      </div>

      {/* Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/80">Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Write your thoughts about this trade, lessons learned, or things to improve..."
                className="min-h-[120px] bg-black/20 border-white/10 text-white placeholder:text-white/40"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Chart Screenshot */}
      <div className="space-y-3">
        <Label className="text-white/80">Chart Screenshot</Label>
        <FormField
          control={form.control}
          name="chartScreenshot"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {chartImageUrl ? (
                  <div className="space-y-4">
                    <div className="relative border border-white/10 rounded-lg overflow-hidden bg-black/10 max-w-full min-h-[200px] flex items-center justify-center">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-white/60 text-sm">Loading chart...</div>
                        </div>
                      )}
                      {imageError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <p className="text-white font-medium mb-1">Failed to load chart image</p>
                          <p className="text-white/60 text-sm">Please check the TradingView link</p>
                        </div>
                      ) : (
                        <img
                          src={chartImageUrl}
                          alt="TradingView Chart"
                          className="max-w-full max-h-full object-contain"
                          style={{ 
                            maxWidth: 'calc(100% - 16px)', 
                            maxHeight: '184px'
                          }}
                          onLoad={() => {
                            setImageLoading(false);
                            setImageError(false);
                          }}
                          onError={() => {
                            setImageLoading(false);
                            setImageError(true);
                            console.error('Error loading chart image from:', chartImageUrl);
                          }}
                          onLoadStart={() => {
                            setImageLoading(true);
                            setImageError(false);
                          }}
                        />
                      )}
                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveChart}
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                                ) : imageError ? (
                  <div className="min-h-[200px] p-8 bg-black/20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium mb-1">Invalid TradingView link</p>
                    <p className="text-white/60 text-sm mb-4">Please use a valid TradingView chart link</p>
                    <div className="flex gap-2 w-full max-w-md">
                      <Input
                        placeholder="Paste your TradingView chart link here (e.g., https://www.tradingview.com/x/abcd1234/)"
                        className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40"
                        onKeyPress={handleChartKeyPress}
                        {...field}
                      />
                      <Button
                        type="button"
                        onClick={handleLoadChart}
                        disabled={!watchedValues.chartScreenshot}
                        className="bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40"
                      >
                        Enter
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[200px] p-8 bg-black/20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-white font-medium mb-1">Upload chart image</p>
                    <div className="flex gap-2 w-full max-w-md">
                      <Input
                        placeholder="Paste your TradingView chart link here (e.g., https://www.tradingview.com/x/abcd1234/)"
                        className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40"
                        onKeyPress={handleChartKeyPress}
                        {...field}
                      />
                      <Button
                        type="button"
                        onClick={handleLoadChart}
                        disabled={!watchedValues.chartScreenshot}
                        className="bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40"
                      >
                        Enter
                      </Button>
                    </div>
                  </div>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}