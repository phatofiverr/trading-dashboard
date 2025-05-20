
// Helper function to detect trading session based on time (24-hour format)
export const detectSession = (time: string, timeZone: string = 'UTC'): string => {
  try {
    // Default to current time if time string is invalid or missing
    if (!time || time === "") {
      time = "00:00";
    }
    
    // Convert time string (e.g. "14:30") to hours and minutes
    const [hours, minutes] = time.split(':').map(Number);
    
    // Check if hours is valid (0-23)
    if (isNaN(hours) || hours < 0 || hours > 23) {
      console.warn(`Invalid hours in time string: ${time}`);
      return 'Unknown';
    }
    
    // Adjust for timezone - this is simplified
    let utcHour = hours;
    
    if (timeZone === 'America/New_York') {
      utcHour = (hours + 4) % 24; // EST is UTC-4 (simplification)
    } else if (timeZone === 'Europe/London') {
      utcHour = (hours + 0) % 24; // GMT is UTC+0
    } else if (timeZone === 'Asia/Tokyo') {
      utcHour = (hours - 9) % 24; // JST is UTC+9
    } else if (timeZone === 'Australia/Sydney') {
      utcHour = (hours - 10) % 24; // AEST is UTC+10
    }
    
    // Normalize negative hours
    if (utcHour < 0) utcHour += 24;
    
    // Map UTC hours to sessions
    if (utcHour >= 0 && utcHour < 8) {
      return 'Asia';
    } else if (utcHour >= 8 && utcHour < 12) {
      return 'London';
    } else if (utcHour >= 12 && utcHour < 16) {
      return 'Overlap';
    } else if (utcHour >= 16 && utcHour < 20) {
      return 'NY';
    } else {
      return 'Late NY';
    }
  } catch (error) {
    console.error('Error detecting session:', error);
    return 'Unknown';
  }
};

// Helper to detect session based on date range
export const detectSessionFromDateRange = (startDate: Date | null, endDate: Date | null): string | null => {
  if (!startDate) return null;
  
  // Get hour of day from start date (24-hour format)
  const hours = startDate.getHours();
  
  // Use simplified mapping of hours to sessions
  if (hours >= 0 && hours < 8) {
    return 'Asia';
  } else if (hours >= 8 && hours < 12) {
    return 'London';
  } else if (hours >= 12 && hours < 16) {
    return 'Overlap';
  } else if (hours >= 16 && hours < 20) {
    return 'NY';
  } else {
    return 'Late NY';
  }
};
