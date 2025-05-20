
/**
 * Helper function to safely convert any date type to ISO string
 */
export function formatDateToISOString(date: any): string {
  // If it's a string already, check if it's a valid ISO string
  if (typeof date === 'string') {
    // Try to parse the string as a date and format it
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
    return date;
  }
  
  // If it's a Date object with toISOString method
  if (date && typeof date === 'object' && 'toISOString' in date) {
    // Verify it's a valid date before calling toISOString
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  
  // Return current date as fallback
  return new Date().toISOString();
}

/**
 * Helper to check if a date is valid
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  
  return false;
}

/**
 * Get default date for a new trade entry
 * Returns the last used date if available, otherwise the current date
 */
export function getDefaultTradeDate(lastUsedDate?: string | Date | null): Date {
  if (lastUsedDate) {
    if (typeof lastUsedDate === 'string') {
      const parsed = new Date(lastUsedDate);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } else if (lastUsedDate instanceof Date && !isNaN(lastUsedDate.getTime())) {
      return lastUsedDate;
    }
  }
  
  return new Date();
}
