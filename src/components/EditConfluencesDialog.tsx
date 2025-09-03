import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, RotateCcw, Settings } from 'lucide-react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Confluence } from '@/hooks/slices/types';
import { 
  createDefaultConfluence, 
  validateConfluenceWeights, 
  hasDuplicateConfluenceNames, 
  validateConfluence 
} from '@/utils/confluenceUtils';
import { colorPalette } from '@/lib/colorPalette';

interface EditConfluencesDialogProps {
  strategyId: string;
  trigger?: React.ReactNode;
  onConfluencesUpdated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EditConfluencesDialog: React.FC<EditConfluencesDialogProps> = ({ 
  strategyId,
  trigger, 
  onConfluencesUpdated,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}) => {
  const { getStrategyById, updateStrategyConfluences, strategies } = useTradeStore();
  const [showDialog, setShowDialog] = useState(false);
  const [confluences, setConfluences] = useState<Confluence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isDialogOpen = externalOpen !== undefined ? externalOpen : showDialog;
  const setIsDialogOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setShowDialog;

  // Get the current strategy and initialize confluences
  useEffect(() => {
    if (isDialogOpen && strategyId) {
      // Try to find strategy by ID first, then by name
      const strategy = getStrategyById(strategyId) || 
                      strategies.find(s => s.name === strategyId);
      
      if (strategy?.confluences?.length) {
        setConfluences([...strategy.confluences]);
      } else {
        // Initialize with default confluence if none exist
        setConfluences([createDefaultConfluence()]);
      }
    }
  }, [isDialogOpen, strategyId, getStrategyById, strategies]);

  const handleUpdateConfluences = async () => {
    if (!strategyId) {
      toast.error("Strategy ID is required");
      return;
    }
    
    // Validate confluences
    if (!validateConfluenceWeights(confluences)) {
      toast.error("Confluence weights must sum to 100");
      return;
    }
    
    if (hasDuplicateConfluenceNames(confluences)) {
      toast.error("Confluence names must be unique");
      return;
    }
    
    // Validate each confluence
    for (const confluence of confluences) {
      const validation = validateConfluence(confluence);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
    }
    
    setIsLoading(true);
    try {
      // Find strategy by ID or name
      const strategy = getStrategyById(strategyId) || 
                      strategies.find(s => s.name === strategyId);
      
      if (!strategy) {
        throw new Error("Strategy not found");
      }

      await updateStrategyConfluences(strategy.id, confluences);
      setIsDialogOpen(false);
      
      // Call the callback if provided
      if (onConfluencesUpdated) {
        onConfluencesUpdated();
      }
    } catch (error) {
      console.error("Error updating confluences:", error);
      toast.error("Failed to update confluences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };
  
  const addConfluence = () => {
    const newConfluence: Confluence = {
      id: crypto.randomUUID(),
      name: '',
      weight: 1
    };
    setConfluences([...confluences, newConfluence]);
  };
  
  const removeConfluence = (id: string) => {
    if (confluences.length > 1) {
      setConfluences(confluences.filter(c => c.id !== id));
    }
  };
  
  const updateConfluence = (id: string, updates: Partial<Confluence>) => {
    setConfluences(confluences.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };
  
  const getTotalWeight = () => {
    return confluences.reduce((sum, c) => sum + (c.weight || 0), 0);
  };
  
  const autoBalanceWeights = () => {
    if (confluences.length === 0) return;
    
    const equalWeight = Math.floor(100 / confluences.length);
    const remainder = 100 - (equalWeight * confluences.length);
    
    const balancedConfluences = confluences.map((confluence, index) => ({
      ...confluence,
      weight: index === confluences.length - 1 ? equalWeight + remainder : equalWeight
    }));
    
    setConfluences(balancedConfluences);
    toast.success("Confluences auto-balanced to 100%");
  };
  
  const totalWeight = getTotalWeight();
  const isWeightValid = totalWeight === 100;
  const isOverWeight = totalWeight > 100;

  return (
    <Dialog 
      open={isDialogOpen} 
      onOpenChange={setIsDialogOpen}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="minimal" 
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5"
          >
            <Settings className="h-4 w-4" />
            Edit Confluences
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
        <DialogHeader>
          <DialogTitle>Edit Strategy Confluences</DialogTitle>
          <DialogDescription>
            Update the confluences for {strategyId} strategy
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Confluences Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white font-medium">Setup Confluences</Label>
              <div 
                className="text-sm"
                style={{ 
                  color: isWeightValid 
                    ? colorPalette.status.positive.primary 
                    : colorPalette.status.negative.primary 
                }}
              >
                Total: {totalWeight}/100
              </div>
            </div>
            
            {/* Auto-balance toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="minimal"
                  size="sm"
                  onClick={autoBalanceWeights}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Auto-balance to 100%
                </Button>
              </div>
              {isOverWeight && (
                <div 
                  className="text-xs px-2 py-1 rounded"
                  style={{ 
                    color: colorPalette.status.negative.primary,
                    backgroundColor: colorPalette.status.negative.background 
                  }}
                >
                  Over 100%
                </div>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {confluences.map((confluence, index) => (
                <div key={confluence.id} className="glass-effect bg-black/5 border-0 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="H1 Trend"
                        value={confluence.name}
                        onChange={(e) => updateConfluence(confluence.id, { name: e.target.value })}
                        className="bg-black/20 border-white/10 text-sm"
                      />
                      
                      {/* Progress bar slider */}
                      <div className="space-y-2">
                        <div className="relative w-full h-6 bg-black/20 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full transition-all duration-200 relative flex items-center justify-center"
                            style={{ 
                              width: `${Math.min(confluence.weight || 0, 100)}%`,
                              backgroundColor: colorPalette.status.positive.primary
                            }}
                          >
                            <span className="text-xs font-medium text-black absolute inset-0 flex items-center justify-center">
                              {confluence.weight || 0}%
                            </span>
                          </div>
                          
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={confluence.weight || 1}
                            onChange={(e) => updateConfluence(confluence.id, { weight: parseInt(e.target.value) || 1 })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    {confluences.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeConfluence(confluence.id)}
                        className="p-2 h-8 w-8"
                        style={{
                          color: colorPalette.status.negative.primary,
                          borderColor: colorPalette.status.negative.border
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colorPalette.status.negative.secondary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colorPalette.status.negative.primary;
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="minimal" 
              onClick={addConfluence}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Confluence
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button 
            onClick={handleUpdateConfluences} 
            variant="glass"
            disabled={!isWeightValid || isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Confluences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditConfluencesDialog;