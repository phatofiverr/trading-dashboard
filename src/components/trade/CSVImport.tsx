
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const CSVImport = () => {
  const handleImportClick = () => {
    toast.info("CSV import functionality is not available");
  };

  return (
    <Button
      variant="minimal" 
      className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5"
      onClick={handleImportClick}
    >
      <Upload className="h-4 w-4" />
      Import
    </Button>
  );
};

export default CSVImport;
