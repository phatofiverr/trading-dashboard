
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfluenceStore } from '@/hooks/useConfluenceStore';
import { ScrollArea } from '@/components/ui/scroll-area';

const ConfluenceManager: React.FC = () => {
  const { toast } = useToast();
  const { 
    confluenceTypes, 
    options, 
    addConfluenceType, 
    removeConfluenceType, 
    addOption, 
    removeOption, 
    saveConfluenceData 
  } = useConfluenceStore();
  
  const [newConfluence, setNewConfluence] = useState("");
  const [currentOption, setCurrentOption] = useState<Record<string, string>>({});

  const handleAddConfluence = () => {
    if (newConfluence.trim()) {
      if (confluenceTypes.includes(newConfluence.trim())) {
        toast({
          title: "Condition already exists",
          description: "Please enter a unique condition name",
          variant: "destructive",
        });
        return;
      }
      
      addConfluenceType(newConfluence.trim());
      setNewConfluence("");
      toast({
        title: "Condition Added",
        description: "New trading condition has been added"
      });
    }
  };

  const handleAddOption = (confluenceType: string) => {
    const option = currentOption[confluenceType];
    if (option && option.trim()) {
      if (options[confluenceType] && options[confluenceType].includes(option.trim())) {
        toast({
          title: "Option already exists",
          description: "Please enter a unique option name",
          variant: "destructive",
        });
        return;
      }
      
      addOption(confluenceType, option.trim());
      setCurrentOption(prev => ({ ...prev, [confluenceType]: "" }));
      toast({
        title: "Option Added",
        description: `Added to ${confluenceType}`
      });
    }
  };

  const handleSave = () => {
    saveConfluenceData();
    toast({
      title: "Saved",
      description: "Trading conditions saved successfully"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, confluenceType: string) => {
    if (e.key === 'Enter') {
      handleAddOption(confluenceType);
    }
  };

  const handleConfluenceKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddConfluence();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-xl font-normal">Trading Conditions</CardTitle>
          <Button 
            variant="default" 
            size="sm"
            className="flex items-center gap-1 h-8 bg-accent/80 hover:bg-accent border-0"
            onClick={handleSave}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-5">
            {/* Add Condition Form */}
            <div className="flex space-x-2">
              <Input 
                placeholder="Add new trading condition..." 
                value={newConfluence}
                onChange={(e) => setNewConfluence(e.target.value)}
                onKeyPress={handleConfluenceKeyPress}
                className="flex-1 input-minimal"
              />
              <Button 
                onClick={handleAddConfluence}
                className="bg-accent/80 hover:bg-accent border-0"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            {/* Conditions List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {confluenceTypes.length > 0 ? (
                  confluenceTypes.map(confluenceType => (
                    <div key={confluenceType} className="border border-white/10 rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{confluenceType}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConfluenceType(confluenceType)}
                          className="h-7 px-2 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Add option..." 
                          value={currentOption[confluenceType] || ""}
                          onChange={(e) => setCurrentOption(prev => ({ ...prev, [confluenceType]: e.target.value }))}
                          onKeyPress={(e) => handleKeyPress(e, confluenceType)}
                          className="flex-1 input-minimal"
                        />
                        <Button 
                          onClick={() => handleAddOption(confluenceType)}
                          size="sm"
                          className="bg-accent/80 hover:bg-accent border-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {options[confluenceType]?.map(option => (
                          <Badge 
                            key={option} 
                            variant="outline"
                            className="minimal-badge flex items-center gap-1.5 px-3 py-1.5"
                          >
                            <span>{option}</span>
                            <X 
                              className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" 
                              onClick={() => removeOption(confluenceType, option)}
                            />
                          </Badge>
                        ))}
                        
                        {options[confluenceType]?.length === 0 && (
                          <div className="text-sm text-muted-foreground pt-1 italic">
                            No options added yet
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No conditions added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Add your first condition above</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfluenceManager;
