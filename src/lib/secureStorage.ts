/**
 * Secure Storage Utility
 * Provides basic encoding for localStorage data to prevent easy access
 */

export const secureStorage = {
  /**
   * Store data with basic encoding
   */
  setItem: (key: string, value: any): void => {
    try {
      const encoded = btoa(JSON.stringify(value));
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.warn('Failed to store data securely:', error);
      // Fallback to regular storage
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  /**
   * Retrieve data with decoding
   */
  getItem: <T>(key: string): T | null => {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;
      
      const decoded = atob(encoded);
      return JSON.parse(decoded);
    } catch (error) {
      console.warn('Failed to retrieve data securely:', error);
      // Fallback to regular storage
      try {
        const fallback = localStorage.getItem(key);
        return fallback ? JSON.parse(fallback) : null;
      } catch {
        return null;
      }
    }
  },

  /**
   * Remove data
   */
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * Clear all data
   */
  clear: (): void => {
    localStorage.clear();
  },

  /**
   * Check if key exists
   */
  hasItem: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  }
};

/**
 * Session Storage Utility (for temporary data)
 */
export const sessionStorage = {
  setItem: (key: string, value: any): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to store session data:', error);
    }
  },

  getItem: <T>(key: string): T | null => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to retrieve session data:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    window.sessionStorage.removeItem(key);
  },

  clear: (): void => {
    window.sessionStorage.clear();
  }
};
