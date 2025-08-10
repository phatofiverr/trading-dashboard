
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
    
    // Use proper timezone conversion
    let utcHour = hours;
    
    // Create a date object for the current date with the specified time
    const now = new Date();
    const dateString = now.toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    
    try {
      // Simple approach: use hardcoded offsets for known timezones
      // This is more reliable than complex timezone conversion
      if (timeZone === 'America/New_York' || timeZone === 'America/Chicago' || timeZone === 'America/Toronto') {
        utcHour = (hours + 4) % 24; // EST/CST is UTC-4/5 (simplified)
      } else if (timeZone === 'Europe/London' || timeZone === 'GMT' || timeZone === 'UTC') {
        utcHour = hours; // GMT/UTC is UTC+0
      } else if (timeZone === 'Europe/Frankfurt' || timeZone === 'Europe/Paris' || timeZone === 'Europe/Zurich' || 
                 timeZone === 'Europe/Amsterdam' || timeZone === 'Europe/Milan' || timeZone === 'Europe/Madrid' ||
                 timeZone === 'Europe/Stockholm' || timeZone === 'Europe/Oslo') {
        utcHour = (hours - 1) % 24; // CET is UTC+1
      } else if (timeZone === 'Asia/Shanghai' || timeZone === 'Asia/Hong_Kong' || timeZone === 'Asia/Singapore' || 
                 timeZone === 'Asia/Seoul' || timeZone === 'Asia/Taipei' || timeZone === 'Asia/Kuala_Lumpur') {
        utcHour = (hours - 8) % 24; // CST/HKT/SGT/KST is UTC+8
      } else if (timeZone === 'Asia/Tokyo') {
        utcHour = (hours - 9) % 24; // JST is UTC+9
      } else if (timeZone === 'Asia/Bangkok' || timeZone === 'Asia/Jakarta' || timeZone === 'Asia/Manila') {
        utcHour = (hours - 7) % 24; // ICT/WIB/PHT is UTC+7
      } else if (timeZone === 'Asia/Mumbai') {
        utcHour = (hours - 5.5) % 24; // IST is UTC+5:30
      } else if (timeZone === 'Australia/Sydney' || timeZone === 'Australia/Melbourne') {
        utcHour = (hours - 10) % 24; // AEST is UTC+10
      } else if (timeZone === 'America/Los_Angeles') {
        utcHour = (hours + 7) % 24; // PST is UTC-7
      } else if (timeZone === 'America/Sao_Paulo') {
        utcHour = (hours + 3) % 24; // BRT is UTC-3
      } else if (timeZone === 'America/Mexico_City') {
        utcHour = (hours + 5) % 24; // CST is UTC-5
      } else if (timeZone === 'Asia/Dubai' || timeZone === 'Asia/Kuwait' || timeZone === 'Asia/Riyadh') {
        utcHour = (hours - 4) % 24; // GST/AST is UTC+4
      } else if (timeZone === 'Africa/Cairo') {
        utcHour = (hours - 2) % 24; // EET is UTC+2
      } else if (timeZone === 'Africa/Johannesburg') {
        utcHour = (hours - 2) % 24; // SAST is UTC+2
      } else if (timeZone === 'Pacific/Auckland') {
        utcHour = (hours - 12) % 24; // NZST is UTC+12
      } else if (timeZone === 'Pacific/Honolulu') {
        utcHour = (hours + 10) % 24; // HST is UTC-10
      } else if (timeZone === 'Europe/Moscow') {
        utcHour = (hours - 3) % 24; // MSK is UTC+3
      } else if (timeZone === 'Asia/Vladivostok') {
        utcHour = (hours - 10) % 24; // VLAT is UTC+10
      } else {
        // For unknown timezones, assume it's close to UTC
        utcHour = hours;
      }
      
      // Debug logging
      console.log(`Session Detection Debug:`, {
        inputTime: time,
        timezone: timeZone,
        inputHours: hours,
        utcHour,
        session: utcHour >= 0 && utcHour < 8 ? 'Asia' : 
                utcHour >= 8 && utcHour < 12 ? 'London' : 
                utcHour >= 12 && utcHour < 16 ? 'Overlap' : 
                utcHour >= 16 && utcHour < 20 ? 'NY' : 'Late NY'
      });
      
    } catch (timezoneError) {
      console.warn(`Error converting timezone ${timeZone}, using UTC as fallback:`, timezoneError);
      utcHour = hours; // Use input hours as UTC
    }
    
    // Normalize negative hours
    if (utcHour < 0) utcHour += 24;
    
    // Map UTC hours to sessions
    let session = 'Unknown';
    if (utcHour >= 0 && utcHour < 8) {
      session = 'Asia';
    } else if (utcHour >= 8 && utcHour < 12) {
      session = 'London';
    } else if (utcHour >= 12 && utcHour < 16) {
      session = 'Overlap';
    } else if (utcHour >= 16 && utcHour < 20) {
      session = 'NY';
    } else {
      session = 'Late NY';
    }
    
    // Final debug logging
    console.log(`Final Session Detection:`, {
      inputTime: time,
      timezone: timeZone,
      inputHours: hours,
      utcHour,
      session
    });
    
    return session;
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
