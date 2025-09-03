import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, X, RotateCcw } from 'lucide-react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Confluence } from '@/hooks/slices/types';
import { 
  createDefaultConfluence, 
  validateConfluenceWeights, 
  hasDuplicateConfluenceNames, 
  validateConfluence 
} from '@/utils/confluenceUtils';
import { useColors } from '@/hooks/useColors';

interface AddStrategyDialogProps {
  trigger?: React.ReactNode;
  onStrategyAdded?: () => void;
}

const AddStrategyDialog: React.FC<AddStrategyDialogProps> = ({ 
  trigger, 
  onStrategyAdded 
}) => {
  const navigate = useNavigate();
  const { createStrategy } = useTradeStore();
  const colors = useColors();
  const [showDialog, setShowDialog] = useState(false);
  const [newStrategy, setNewStrategy] = useState("");
  const [confluences, setConfluences] = useState<Confluence[]>([createDefaultConfluence()]);
  const [autoBalance, setAutoBalance] = useState(false);

  const handleAddStrategy = async () => {
    if (!newStrategy.trim()) {
      toast.error("Strategy name is required");
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
    
    try {
      await createStrategy(newStrategy.trim(), 'live', confluences);
      setNewStrategy("");
      setConfluences([createDefaultConfluence()]);
      setShowDialog(false);
      
      // Call the callback if provided
      if (onStrategyAdded) {
        onStrategyAdded();
      }
      
      // Navigate to the new strategy
      navigate(`/strategies/${encodeURIComponent(newStrategy.trim())}`);
    } catch (error) {
      console.error("Error creating strategy:", error);
      toast.error("Failed to create strategy");
    }
  };

  const handleCancel = () => {
    setNewStrategy("");
    setConfluences([createDefaultConfluence()]);
    setShowDialog(false);
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
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/40 hover:text-white/60 cursor-pointer rounded-md hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Strategy</span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
        <DialogHeader>
          <DialogTitle>Add New Strategy</DialogTitle>
          <DialogDescription>Create a new trading strategy to organize your trades</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Strategy Name */}
          <div>
            <Label htmlFor="strategy-name" className="text-white font-medium">Strategy Name</Label>
            <Input
              id="strategy-name"
              placeholder="Strategy Name"
              value={newStrategy}
              onChange={(e) => setNewStrategy(e.target.value)}
              className="bg-black/20 border-white/10 mt-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isWeightValid) {
                  handleAddStrategy();
                }
              }}
            />
          </div>
          
          {/* Confluences Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white font-medium">Setup Confluences</Label>
              <div className="text-sm" style={{
                color: isWeightValid ? colors.status.positive.primary : colors.status.negative.primary
              }}>
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
                    color: colors.status.negative.primary,
                    backgroundColor: colors.status.negative.background
                  }}
                >
                  ⚠️ Over 100%
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
                              backgroundColor: colors.status.positive.primary
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
                          color: colors.status.negative.primary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.utils.withOpacity(colors.status.negative.primary, 0.8);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.status.negative.primary;
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
            onClick={handleAddStrategy} 
            variant="glass"
            disabled={!isWeightValid || !newStrategy.trim()}
          >
            Add Strategy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStrategyDialog;
