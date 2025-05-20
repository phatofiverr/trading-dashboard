
import * as TradeDB from "@/lib/db";
import { Trade } from "@/types/Trade";
import { toast } from "sonner";

/**
 * Handle CSV import functionality
 */
export const importTradesFromCSV = async (csvData: string): Promise<{ 
  success: boolean; 
  count?: number; 
  error?: string;
  trades?: Trade[];
}> => {
  try {
    // Parse CSV data
    const lines = csvData.split('\n');
    if (lines.length <= 1) {
      return { success: false, error: "CSV file is empty or invalid" };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    
    const newTrades = [];
    const errors = [];
    
    // Process each line of the CSV
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        errors.push(`Line ${i + 1}: Column count doesn't match headers`);
        continue;
      }
      
      try {
        // Create a trade object from CSV row
        const tradeData: Record<string, any> = {};
        headers.forEach((header, index) => {
          const value = values[index];
          
          // Handle special field transformations
          if (header === 'entryDate' || header === 'exitDate') {
            tradeData[header] = value ? new Date(value) : undefined;
          } 
          else if (header === 'direction') {
            tradeData[header] = value === 'Long' || value === 'Short' ? value : 'Long';
          }
          else if (header === 'confidenceRating') {
            const rating = parseInt(value);
            tradeData[header] = rating >= 1 && rating <= 5 ? rating as 1 | 2 | 3 | 4 | 5 : 3;
          } 
          else if (header === 'tags' && value) {
            tradeData[header] = value.startsWith('[') && value.endsWith(']') 
              ? JSON.parse(value) 
              : value.split(';').map(tag => tag.trim());
          }
          else if (['entryPrice', 'exitPrice', 'slPrice', 'tp1Price', 'tp2Price', 'tp3Price', 'slPips'].includes(header)) {
            tradeData[header] = parseFloat(value) || 0;
          }
          else {
            tradeData[header] = value;
          }
        });
        
        // Generate a tradeId if not provided
        if (!tradeData.tradeId) {
          tradeData.tradeId = `T${Math.floor(Math.random() * 10000)}`;
        }
        
        // Add minimum required fields if missing
        const requiredFields = [
          'instrument', 'entryPrice', 'exitPrice', 'slPrice', 'entryDate', 
          'direction', 'session', 'entryTimeframe'
        ];
        
        requiredFields.forEach(field => {
          if (tradeData[field] === undefined) {
            switch (field) {
              case 'instrument':
                tradeData[field] = 'Unknown';
                break;
              case 'entryPrice':
              case 'exitPrice':
              case 'slPrice':
                tradeData[field] = 0;
                break;
              case 'entryDate':
                tradeData[field] = new Date();
                break;
              case 'direction':
                tradeData[field] = 'Long';
                break;
              case 'session':
                tradeData[field] = 'NY';
                break;
              case 'entryTimeframe':
                tradeData[field] = '1H';
                break;
              default:
                tradeData[field] = '';
            }
          }
        });
        
        newTrades.push(tradeData);
      } catch (error) {
        errors.push(`Line ${i + 1}: ${(error as Error).message}`);
      }
    }
    
    // Report parsing errors if any
    if (errors.length > 0 && errors.length === lines.length - 1) {
      return { 
        success: false, 
        error: `Failed to parse any rows. First error: ${errors[0]}` 
      };
    }
    
    if (newTrades.length === 0) {
      return { success: false, error: "No valid trades found in CSV" };
    }
    
    // Add trades to database
    let successCount = 0;
    for (const tradeData of newTrades) {
      try {
        await TradeDB.addTrade(tradeData);
        successCount++;
      } catch (error) {
        console.error("Error adding trade from CSV:", error);
      }
    }
    
    // Get all trades to return
    const allTrades = await TradeDB.getAllTrades();
    
    return { 
      success: true, 
      count: successCount,
      trades: allTrades,
      error: errors.length > 0 ? `Imported with ${errors.length} errors` : undefined
    };
  } catch (error) {
    console.error("Error importing CSV:", error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Export trades as JSON
 */
export const exportTradesAsJSON = async (): Promise<string> => {
  try {
    return await TradeDB.exportTradesAsJSON();
  } catch (error) {
    console.error("Error exporting as JSON:", error);
    toast.error("Failed to export trades as JSON");
    throw error;
  }
};

/**
 * Export trades as CSV
 */
export const exportTradesAsCSV = async (): Promise<string> => {
  try {
    return await TradeDB.exportTradesAsCSV();
  } catch (error) {
    console.error("Error exporting as CSV:", error);
    toast.error("Failed to export trades as CSV");
    throw error;
  }
};
