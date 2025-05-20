import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFirestoreSync } from "@/hooks/useFirestoreSync";
import { toast } from "sonner";
import { CloudUpload, Download, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FirestoreSyncButtonProps {
  className?: string;
  variant?: "default" | "outline" | "link" | "destructive" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const FirestoreSyncButton: React.FC<FirestoreSyncButtonProps> = ({
  className,
  variant = "default",
  size = "default"
}) => {
  const { 
    isLoading, 
    isSyncing, 
    syncToFirestore, 
    loadFromFirestore 
  } = useFirestoreSync();

  const handleSync = async () => {
    try {
      await syncToFirestore();
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Failed to sync data to Firestore");
    }
  };

  const handleLoad = async () => {
    try {
      await loadFromFirestore();
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data from Firestore");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={isLoading || isSyncing}
        >
          {isLoading || isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLoading ? "Loading..." : "Syncing..."}
            </>
          ) : (
            <>
              <CloudUpload className="mr-2 h-4 w-4" />
              Sync Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Firestore Sync</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSync}
          disabled={isSyncing || isLoading}
        >
          <CloudUpload className="mr-2 h-4 w-4" />
          Save to Firestore
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleLoad}
          disabled={isSyncing || isLoading}
        >
          <Download className="mr-2 h-4 w-4" />
          Load from Firestore
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FirestoreSyncButton; 