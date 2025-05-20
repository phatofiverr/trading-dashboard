import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useThemeStore } from '@/hooks/useThemeStore';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Palette } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

interface ColorOption {
  name: string;
  key: keyof typeof defaultColors;
  description: string;
}

// Default colors for the color picker
const defaultColors = {
  winColor: '#15b9a6',
  breakEvenColor: '#8E9196',
  lossColor: '#D12B35',
  positiveColor: '#15b9a6',
  negativeColor: '#D12B35',
  neutralColor: '#64748B',
};

// Color options that can be customized
const colorOptions: ColorOption[] = [
  { name: 'Profit Color', key: 'winColor', description: 'Used for profitable trades and positive metrics' },
  { name: 'Loss Color', key: 'lossColor', description: 'Used for losing trades and negative metrics' },
  { name: 'Break-Even Color', key: 'breakEvenColor', description: 'Used for break-even trades and neutral metrics' },
  { name: 'Positive Highlight', key: 'positiveColor', description: 'Highlighting for positive values' },
  { name: 'Negative Highlight', key: 'negativeColor', description: 'Highlighting for negative values' },
  { name: 'Neutral Color', key: 'neutralColor', description: 'Used for neutral UI elements' },
];

interface ThemeEditorProps {
  children?: React.ReactNode;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ children }) => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { 
    customThemes, 
    addCustomTheme, 
    updateCustomTheme, 
    deleteCustomTheme,
    setStrategyTheme,
    getThemeColorsForStrategy
  } = useThemeStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('preset');
  const [currentColors, setCurrentColors] = useState(defaultColors);
  const [themeName, setThemeName] = useState('');
  
  // Load current colors when the component mounts or strategy changes
  useEffect(() => {
    if (strategyId) {
      const colors = getThemeColorsForStrategy(strategyId);
      setCurrentColors(colors);
    }
  }, [strategyId, getThemeColorsForStrategy]);
  
  const handleColorChange = (colorKey: keyof typeof defaultColors, value: string) => {
    setCurrentColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };
  
  const handleSaveTheme = () => {
    if (!themeName.trim()) {
      toast({
        title: "Theme name required",
        description: "Please enter a name for your theme.",
        variant: "destructive"
      });
      return;
    }
    
    const existingTheme = customThemes.find(theme => theme.name === themeName);
    
    if (existingTheme) {
      updateCustomTheme(themeName, currentColors);
      toast({
        title: "Theme updated",
        description: `Theme "${themeName}" has been updated.`
      });
    } else {
      addCustomTheme(themeName, currentColors);
      toast({
        title: "Theme saved",
        description: `Theme "${themeName}" has been saved.`
      });
    }
  };
  
  const handleApplyToStrategy = () => {
    if (!strategyId) return;
    
    if (activeTab === 'preset') {
      // If using preset theme, don't need to save custom colors
      setStrategyTheme(strategyId, 'custom', currentColors);
    } else {
      // For custom theme tab, save with current colors
      setStrategyTheme(strategyId, 'custom', currentColors);
    }
    
    toast({
      title: "Theme applied",
      description: `Theme has been applied to ${strategyId} strategy.`
    });
    
    setIsOpen(false);
  };
  
  const handleCancel = () => {
    // Reset to current strategy colors
    if (strategyId) {
      const colors = getThemeColorsForStrategy(strategyId);
      setCurrentColors(colors);
    }
    setIsOpen(false);
  };
  
  // Color preview component
  const ColorPreview = ({ color }: { color: string }) => (
    <div 
      className="h-12 w-full rounded-lg shadow-inner" 
      style={{ backgroundColor: color || '#ffffff' }}
    />
  );
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button 
            variant="minimal" 
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5"
          >
            <Palette className="h-4 w-4" />
            Theme
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto bg-black/80 backdrop-blur-xl border-white/10 text-foreground">
        <SheetHeader>
          <SheetTitle className="text-foreground">Theme Editor</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Customize chart and metric colors for this strategy.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="preset" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="preset">Preset Themes</TabsTrigger>
              <TabsTrigger value="custom">Custom Colors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preset" className="space-y-4">
              <div className="mb-6">
                <ThemeSelector />
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-6">
              <div className="space-y-4">
                {colorOptions.map((option) => (
                  <div key={option.key} className="grid gap-2">
                    <Label htmlFor={option.key} className="flex justify-between">
                      <span>{option.name}</span>
                      <span className="text-xs text-muted-foreground">{currentColors[option.key]}</span>
                    </Label>
                    <div className="grid grid-cols-[1fr_80px] gap-2">
                      <Input
                        type="color"
                        id={option.key}
                        value={currentColors[option.key]}
                        onChange={(e) => handleColorChange(option.key, e.target.value)}
                        className="h-8 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={currentColors[option.key]}
                        onChange={(e) => handleColorChange(option.key, e.target.value)}
                        className="h-8 font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme-name">Save Theme As</Label>
                <Input
                  id="theme-name"
                  placeholder="My Custom Theme"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={handleSaveTheme}
                  disabled={!themeName.trim()}
                  className="w-full mt-2"
                >
                  Save Theme
                </Button>
              </div>
              
              {customThemes.length > 0 && (
                <div className="space-y-2">
                  <Label>Your Saved Themes</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {customThemes.map((theme) => (
                      <div 
                        key={theme.name}
                        className="flex items-center justify-between p-2 rounded-md border border-white/10 bg-black/20 cursor-pointer hover:bg-white/5"
                        onClick={() => {
                          setCurrentColors({
                            winColor: theme.winColor,
                            breakEvenColor: theme.breakEvenColor,
                            lossColor: theme.lossColor,
                            positiveColor: theme.positiveColor,
                            negativeColor: theme.negativeColor,
                            neutralColor: theme.neutralColor,
                          });
                          setThemeName(theme.name);
                        }}
                      >
                        <span>{theme.name}</span>
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.winColor }}></div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.lossColor }}></div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.breakEvenColor }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-8">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-left">Profit</p>
              <ColorPreview color={currentColors.winColor} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-left">Break Even</p>
              <ColorPreview color={currentColors.breakEvenColor} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-left">Loss</p>
              <ColorPreview color={currentColors.lossColor} />
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-6 flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleApplyToStrategy} className="w-full sm:w-auto">
            Apply to {strategyId || "Strategy"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ThemeEditor;
