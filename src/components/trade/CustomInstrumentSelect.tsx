"use client";

import { useState, useEffect } from "react";
import { Star, Plus, X, Search } from "lucide-react";
import { useInstrumentStore } from "@/hooks/useInstrumentStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CustomInstrumentSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomInstrumentSelect({
  value,
  onValueChange,
  placeholder = "Select instrument"
}: CustomInstrumentSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newInstrumentSymbol, setNewInstrumentSymbol] = useState("");
  const [newInstrumentName, setNewInstrumentName] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const {
    instruments,
    favoriteInstruments,
    addCustomInstrument,
    removeInstrument,
    toggleFavorite,
    getFavoriteInstruments,
    initializeDefaultInstruments,
  } = useInstrumentStore();

  // Initialize instruments on component mount
  useEffect(() => {
    console.log('CustomInstrumentSelect: Initializing instruments');
    console.log('Current instruments count:', instruments.length);
    console.log('Current instruments:', instruments);
    initializeDefaultInstruments();
  }, [initializeDefaultInstruments]);

  // Filter instruments based on search term and favorites filter
  const filteredInstruments = instruments
    .filter((instrument) => {
      const matchesSearch = 
        instrument.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFavoritesFilter = showFavoritesOnly 
        ? favoriteInstruments.includes(instrument.symbol)
        : true;
      
      return matchesSearch && matchesFavoritesFilter;
    })
    .sort((a, b) => {
      // Sort favorites first, then by symbol
      const aIsFavorite = favoriteInstruments.includes(a.symbol);
      const bIsFavorite = favoriteInstruments.includes(b.symbol);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      return a.symbol.localeCompare(b.symbol);
    });

  const handleAddInstrument = async () => {
    if (newInstrumentSymbol.trim()) {
      try {
        await addCustomInstrument(newInstrumentSymbol, newInstrumentName.trim() || undefined);
        setNewInstrumentSymbol("");
        setNewInstrumentName("");
        setShowAddDialog(false);
      } catch (error) {
        console.error('Error adding instrument:', error);
      }
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, symbol: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite(symbol);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleRemoveInstrument = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeInstrument(id);
    } catch (error) {
      console.error('Error removing instrument:', error);
    }
  };

  const handleAddButtonClick = () => {
    setShowAddDialog(true);
  };

  return (
    <div className="space-y-2">
      {/* Main Select Component */}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-black/20 border-white/10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Search and Filter Controls */}
          <div className="p-2 space-y-2 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search instruments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-black/20 border-white/10 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <div
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`text-xs px-3 py-1.5 border rounded-md cursor-pointer transition-colors flex items-center ${
                  showFavoritesOnly 
                    ? "bg-accent text-accent-foreground border-accent" 
                    : "bg-transparent border-white/20 hover:bg-white/5"
                }`}
              >
                <Star className={`h-3 w-3 mr-1 ${showFavoritesOnly ? "fill-current" : ""}`} />
                Favorites Only
              </div>
              
              <div
                onClick={handleAddButtonClick}
                className="text-xs px-3 py-1.5 border border-white/20 rounded-md cursor-pointer hover:bg-white/5 transition-colors flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          {!showFavoritesOnly && favoriteInstruments.length > 0 && (
            <div className="p-2 border-b border-white/10">
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Favorites
              </div>
              {getFavoriteInstruments().map((instrument) => (
                <SelectItem key={`fav-${instrument.id}`} value={instrument.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{instrument.symbol}</span>
                      {instrument.name !== instrument.symbol && (
                        <span className="text-muted-foreground text-sm">
                          {instrument.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs">★</Badge>
                      {instrument.isCustom && (
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </div>
          )}

          {/* All Instruments */}
          {filteredInstruments.map((instrument) => {
            const isFavorite = favoriteInstruments.includes(instrument.symbol);
            
            return (
              <SelectItem key={instrument.id} value={instrument.symbol}>
                <div className="flex items-center justify-between w-full group">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{instrument.symbol}</span>
                    {instrument.name !== instrument.symbol && (
                      <span className="text-muted-foreground text-sm">
                        {instrument.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                      className="h-6 w-6 p-0 flex items-center justify-center cursor-pointer rounded hover:bg-gray-700/50"
                      onClick={(e) => handleToggleFavorite(e, instrument.symbol)}
                    >
                      <Star 
                        className={`h-3 w-3 ${isFavorite ? "fill-current text-yellow-400" : "text-muted-foreground"}`} 
                      />
                    </div>
                    {instrument.isCustom && (
                      <div
                        className="h-6 w-6 p-0 flex items-center justify-center cursor-pointer rounded hover:bg-red-700/50 text-red-400 hover:text-red-300"
                        onClick={(e) => handleRemoveInstrument(e, instrument.id)}
                      >
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}

          {filteredInstruments.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No instruments found
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Display selected instrument info */}
      {value && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Selected: {value}</span>
          {favoriteInstruments.includes(value) && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Favorite
            </Badge>
          )}
          {instruments.find(i => i.symbol === value)?.isCustom && (
            <Badge variant="outline" className="text-xs">Custom</Badge>
          )}
        </div>
      )}

      {/* Add Instrument Dialog - Outside Select to avoid conflicts */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Instrument</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Symbol *
              </label>
              <Input
                placeholder="e.g., BTCUSD, XAUUSD"
                value={newInstrumentSymbol}
                onChange={(e) => setNewInstrumentSymbol(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Display Name (Optional)
              </label>
              <Input
                placeholder="e.g., Bitcoin/USD, Gold Spot"
                value={newInstrumentName}
                onChange={(e) => setNewInstrumentName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddInstrument}
                disabled={!newInstrumentSymbol.trim()}
              >
                Add Instrument
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}